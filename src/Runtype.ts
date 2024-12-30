/* eslint-disable import/no-named-export */
import type Array from "./Array.ts"
import type BigInt from "./BigInt.ts"
import type Boolean from "./Boolean.ts"
import Brand from "./Brand.ts"
import Constraint from "./Constraint.ts"
import type Dictionary from "./Dictionary.ts"
import type Function from "./Function.ts"
import type InstanceOf from "./InstanceOf.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import type Never from "./Never.ts"
import type Number from "./Number.ts"
import type Object from "./Object.ts"
import Optional from "./Optional.ts"
import type Record from "./Record.ts"
import type String from "./String.ts"
import type Symbol from "./Symbol.ts"
import type Template from "./Template.ts"
import type Tuple from "./Tuple.ts"
import Union from "./Union.ts"
import type Unknown from "./Unknown.ts"
import type Result from "./result/Result.ts"
import ValidationError from "./result/ValidationError.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import isObject from "./utils-internal/isObject.ts"
import show from "./utils-internal/show.ts"

const RuntypeSymbol: unique symbol = globalThis.Symbol.for("runtypes/Runtype") as any

/**
 * Obtains the static type associated with a Runtype.
 */
type Static<R extends { readonly [RuntypeSymbol]: unknown }> = R[typeof RuntypeSymbol]

namespace Runtype {
	/** @internal */
	// eslint-disable-next-line import/no-named-export
	export const create = <
		R extends Runtype.Core &
			(
				| globalThis.Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type
				| object
			) = never,
	>(
		validate: (x: unknown, innerValidate: InnerValidate, self: R) => Result<Static<R>>,
		base: { [K in keyof R as K extends Exclude<keyof Runtype.Common, "tag"> ? never : K]: R[K] },
	): R => {
		const self = base as R & Runtype.Common<Static<R>>

		defineProperties(
			self,
			{
				[RuntypeSymbol]: (value: unknown, visited: VisitedState) => {
					if (visited.has(value, self)) return SUCCESS(value) as Result<Static<R>>
					return validate(value, createInnerValidate(visited), self)
				},
				toString: (): string => `Runtype<${show(self as Runtype)}>`,
			},
			{ configurable: true, enumerable: false, writable: true },
		)

		defineProperties(
			self,
			{
				validate: (x: unknown): Result<Static<R>> =>
					(self[RuntypeSymbol] as any)(x, createVisitedState()),
				check: (x: unknown): Static<R> => {
					const result: Result<unknown> = self.validate(x)
					if (result.success) return result.value as Static<R>
					else throw new ValidationError(result)
				},
				guard: (x: unknown): x is Static<R> => self.validate(x).success,
				with: <P extends object>(extension: P | ((self: R) => P)): typeof self & P => {
					const base: typeof self & P =
						typeof self === "function"
							? self.bind(undefined)
							: globalThis.Object.create(globalThis.Object.getPrototypeOf(self))
					globalThis.Object.defineProperties(
						base,
						globalThis.Object.getOwnPropertyDescriptors(self),
					)
					const properties = typeof extension === "function" ? extension(self) : extension
					globalThis.Object.defineProperties(
						base,
						globalThis.Object.getOwnPropertyDescriptors(properties),
					)
					return base
				},
				or: <R extends Runtype.Core>(other: R) => Union(self, other),
				and: <R extends Runtype.Core>(other: R) => Intersect(self, other),
				optional: () => Optional(self),
				nullable: () => Union(self, Literal(null)),
				withConstraint: <K = unknown>(
					constraint: (x: Static<R>) => boolean | string,
					options?: { name?: string; args?: K },
				) => Constraint(self, constraint, options),
				withGuard: <U extends Static<R>, K = unknown>(
					guard: (x: Static<R>) => x is U,
					options?: { name?: string; args?: K },
				) => Constraint(self, guard, options),
				withBrand: <B extends string>(brand: B) => Brand(brand, self),
			},
			{ configurable: true, enumerable: true, writable: true },
		)

		return self as R
	}

	// eslint-disable-next-line import/no-named-export
	export const isRuntype = (x: unknown): x is Runtype.Core<unknown> =>
		isObject(x) && globalThis.Object.hasOwn(x, RuntypeSymbol)

	// eslint-disable-next-line import/no-named-export
	export interface Common<T = unknown> extends Core<T> {
		/**
		 * Union this Runtype with another.
		 */
		or: <R extends Runtype.Core>(other: R) => Union<[this, R]>

		/**
		 * Intersect this Runtype with another.
		 */
		and: <R extends Runtype.Core>(other: R) => Intersect<[this, R]>

		/**
		 * Optionalize this Runtype.
		 */
		optional: () => Optional<this>

		/**
		 * Union this Runtype with `Null`.
		 */
		nullable: () => Union<[this, Literal<null>]>

		/**
		 * Use an arbitrary constraint function to validate a runtype, and optionally
		 * to change its name and/or its static type.
		 *
		 * @template T - Optionally override the static type of the resulting runtype
		 * @param {(x: Static<this>) => boolean | string} constraint - Custom function
		 * that returns `true` if the constraint is satisfied, `false` or a custom
		 * error message if not.
		 * @param [options]
		 * @param {string} [options.name] - allows setting the name of this
		 * constrained runtype, which is helpful in reflection or diagnostic
		 * use-cases.
		 */
		withConstraint: <K = unknown>(
			constraint: (x: T) => boolean | string,
			options?: { name?: string; args?: K },
		) => Constraint<this, T, K>

		/**
		 * Helper function to convert an underlying Runtype into another static type
		 * via a type guard function.  The static type of the runtype is inferred from
		 * the type of the guard function.
		 *
		 * @template T - Typically inferred from the return type of the type guard
		 * function, so usually not needed to specify manually.
		 * @param {(x: Static<this>) => x is T} guard - Type guard function (see
		 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
		 *
		 * @param [options]
		 * @param {string} [options.name] - allows setting the name of this
		 * constrained runtype, which is helpful in reflection or diagnostic
		 * use-cases.
		 */
		withGuard: <U extends T, K = unknown>(
			guard: (x: T) => x is U,
			options?: { name?: string; args?: K },
		) => Constraint<this, U, K>

		/**
		 * Adds a brand to the type.
		 */
		withBrand: <B extends string>(brand: B) => Brand<B, this>
	}

	/**
	 * A runtype determines at runtime whether a value conforms to a type specification.
	 */
	export interface Core<T = unknown> {
		/** @internal */ readonly [RuntypeSymbol]: T

		tag: string

		/**
		 * Validates that a value conforms to this type, and returns a result indicating
		 * success or failure (does not throw).
		 */
		validate: (x: unknown) => Result<T>

		/**
		 * A type guard for this runtype.
		 */
		guard: (x: unknown) => x is T

		/**
		 * Verifies that a value conforms to this runtype. If so, returns the same value,
		 * statically typed. Otherwise throws an exception.
		 */
		check: (x: unknown) => T

		/**
		 * Verifies that a value conforms to this runtype. When given a value that does
		 * not conform to the runtype, throws an exception.
		 */
		assert: (x: unknown) => asserts x is T

		/**
		 * Defines additional properties on this Runtype. Useful when you want to provide related values, such as the default value and utility functions.
		 */
		with: <P extends object>(extension: P | ((self: this) => P)) => this & P
	}
}

type Runtype =
	| Array
	| BigInt
	| Boolean
	| Brand
	| Constraint
	| Dictionary
	| Function
	| InstanceOf
	| Intersect
	| Literal
	| Never
	| Number
	| Object
	| Optional
	| Record
	| String
	| Symbol
	| Template
	| Tuple
	| Union
	| Unknown

const defineProperties = (
	target: object,
	properties: object,
	descriptor: { enumerable: boolean; writable: boolean; configurable: boolean },
) => {
	for (const key of Reflect.ownKeys(properties)) {
		const value = properties[key as keyof typeof properties]
		globalThis.Object.defineProperty(target, key, {
			...descriptor,
			value,
		})
	}
}

type InnerValidate = <R extends Runtype.Core>(runtype: R, value: unknown) => Result<Static<R>>

const createInnerValidate =
	(visited: VisitedState): InnerValidate =>
	<R extends Runtype.Core>(runtype: R, value: unknown): Result<Static<R>> =>
		(runtype[RuntypeSymbol] as any)(value, visited)

type VisitedState = {
	has: (candidate: unknown, runtype: Runtype.Core) => boolean
}

const createVisitedState = (): VisitedState => {
	const members = new WeakMap<object, WeakSet<Runtype.Core>>()

	const add = (candidate: unknown, runtype: Runtype.Core) => {
		if (!isObject(candidate)) return
		members.set(candidate, (members.get(candidate) ?? new WeakSet()).add(runtype))
	}

	const has = (candidate: unknown, runtype: Runtype.Core) => {
		if (!isObject(candidate)) return false
		const value = members.get(candidate)?.has(runtype) ?? false
		add(candidate, runtype)
		return value
	}

	return { has }
}

export default Runtype
// eslint-disable-next-line import/no-named-export, sort-exports/sort-exports
export { type Static }