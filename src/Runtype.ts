/* eslint-disable import/no-named-export */
import type Array from "./Array.ts"
import type BigInt from "./BigInt.ts"
import type Boolean from "./Boolean.ts"
import Brand from "./Brand.ts"
import Constraint from "./Constraint.ts"
import type Function from "./Function.ts"
import type InstanceOf from "./InstanceOf.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import type Never from "./Never.ts"
import type Number from "./Number.ts"
import type Object from "./Object.ts"
import Optional from "./Optional.ts"
import type Record from "./Record.ts"
import type Spread from "./Spread.ts"
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
const RuntypeConformance: unique symbol = globalThis.Symbol.for(
	"runtypes/RuntypeConformance",
) as any

/**
 * Obtains the static type associated with a Runtype.
 */
type Static<R extends { readonly [RuntypeSymbol]: unknown }> = R[typeof RuntypeSymbol]

namespace Runtype {
	export const create = <R extends Runtype.Core = never>(
		validate: (x: unknown, innerValidate: InnerValidate, self: R) => Result<Static<R>>,
		base: Base<R>,
	): R => {
		const self = base as Base<R> & R & Runtype.Common<Static<R>>

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
				assert: (x: unknown): asserts x is Static<R> => void self.check(x),
				with: <P extends object>(extension: P | ((self: R) => P)): typeof self & P => {
					const base = self.clone() as typeof self & P
					const properties = typeof extension === "function" ? extension(self) : extension
					globalThis.Object.defineProperties(
						base,
						globalThis.Object.getOwnPropertyDescriptors(properties),
					)
					return base
				},
				clone: () => {
					const base: typeof self =
						typeof self === "function"
							? self.bind(undefined)
							: globalThis.Object.create(globalThis.Object.getPrototypeOf(self))
					globalThis.Object.defineProperties(
						base,
						globalThis.Object.getOwnPropertyDescriptors(self),
					)
					return Runtype.create(validate, base)
				},
				or: <R extends Runtype.Core>(other: R) => Union(self, other),
				and: <R extends Runtype.Core>(other: R) => Intersect(self, other),
				optional: () => Optional(self),
				nullable: () => Union(self, Literal(null)),
				undefinedable: () => Union(self, Literal(undefined)),
				nullishable: () => Union(self, Literal(null), Literal(undefined)),
				withConstraint: <U extends Static<R>>(constraint: (x: Static<R>) => boolean | string) =>
					Constraint(self, (x): asserts x is U => {
						const message = constraint(x)
						if (typeof message === "string") throw message
						else if (!message) throw undefined
					}),
				withGuard: <U extends Static<R>>(guard: (x: Static<R>) => x is U) =>
					Constraint(self, (x): asserts x is U => {
						if (!guard(x)) throw undefined
					}),
				withAssertion: <U extends Static<R>>(assert: (x: Static<R>) => asserts x is U) =>
					Constraint(self, assert),
				withBrand: <B extends string>(brand: B) => Brand(brand, self),
				conform: () => self,
			},
			{ configurable: true, enumerable: true, writable: true },
		)

		return self as R
	}

	/** @internal */
	export const isRuntype = (x: unknown): x is Runtype.Core<unknown> =>
		isObject(x) && globalThis.Object.hasOwn(x, RuntypeSymbol)

	export type Base<R> = {
		[K in keyof R as K extends Exclude<keyof Runtype.Common, "tag"> ? never : K]: R[K]
	} & (
		| globalThis.Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type
		| object
	)

	export interface Common<T = unknown> extends Core<T>, Conformance<T> {
		/**
		 * Returns a clone of this runtype with additional properties. Useful when you want to provide related values, such as the default value and utility functions.
		 */
		with: <P extends object>(extension: P | ((self: this) => P)) => this & P

		/**
		 * Creates a shallow clone of this runtype.
		 */
		clone: () => this

		/**
		 * Union this Runtype with another.
		 */
		or: <R extends Runtype.Core>(other: R) => Union<[this, R]>

		/**
		 * Intersect this Runtype with another.
		 */
		and: <R extends Runtype.Core>(other: R) => Intersect<[this, R]>

		/**
		 * Optionalize this property.
		 *
		 * Note that `Optional` is not a runtype, but just a contextual modifier which is only meaningful when defining the content of `Object`. If you want to allow the validated value to be `undefined`, use `undefinedable` method.
		 */
		optional: () => Optional<this>

		/**
		 * Union this runtype with `Null`.
		 */
		nullable: () => Union<[this, Literal<null>]>

		/**
		 * Union this runtype with `Undefined`.
		 */
		undefinedable: () => Union<[this, Literal<undefined>]>

		/**
		 * Union this runtype with `Null` and `Undefined`.
		 */
		nullishable: () => Union<[this, Literal<null>, Literal<undefined>]>

		/**
		 * Use a constraint function to add additional constraints to this runtype, and manually converts a static type of this runtype into another via the type argument if passed.
		 */
		withConstraint: <U extends T>(constraint: (x: T) => boolean | string) => Constraint<this, U>

		/**
		 * Use a guard function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
		 */
		withGuard: <U extends T>(guard: (x: T) => x is U) => Constraint<this, U>

		/**
		 * Use an assertion function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
		 */
		withAssertion: <U extends T>(assert: (x: T) => asserts x is U) => Constraint<this, U>

		/**
		 * Adds a brand to the type.
		 */
		withBrand: <B extends string>(brand: B) => Brand<B, this>

		/**
		 * Statically ensures this runtype is defined for exactly `U`, not for a subtype of `U`.
		 */
		conform<U>(this: Conform<U>): Conform<U> & this
	}

	type Conform<T> = Runtype.Core<T> & Conformance<T>

	type Conformance<T> = {
		/** @internal */ readonly [RuntypeConformance]: (StaticTypeOfThis: T) => T
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
		validate: <U = T>(x: Maybe<T, U>) => Result<T & U>

		/**
		 * A type guard for this runtype.
		 */
		guard: <U = T>(x: Maybe<T, U>) => x is T & U

		/**
		 * Verifies that a value conforms to this runtype. If so, returns the same value,
		 * statically typed. Otherwise throws an exception.
		 */
		check: <U = T>(x: Maybe<T, U>) => T & U

		/**
		 * Verifies that a value conforms to this runtype. When given a value that does
		 * not conform to the runtype, throws an exception.
		 */
		assert: <U = T>(x: Maybe<T, U>) => asserts x is T & U
	}

	// Special-casing when `T = never`, as it breaks expected assignability everywhere.
	type Maybe<T, U> = [T] extends [never] ? unknown : [T & U] extends [never] ? T : U

	export type Spreadable = Runtype.Core<readonly unknown[]> & Iterable<Spread<Spreadable>>
}

type Runtype =
	| Array
	| BigInt
	| Boolean
	| Brand
	| Constraint
	| Function
	| InstanceOf
	| Intersect
	| Literal
	| Never
	| Number
	| Object
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