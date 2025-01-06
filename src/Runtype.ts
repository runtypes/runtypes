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
import Parser from "./Parser.ts"
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
type Static<R extends { readonly [RuntypeSymbol]: [unknown, unknown] }> = R[typeof RuntypeSymbol][0]

type Parsed<R extends { readonly [RuntypeSymbol]: [unknown, unknown] }> = R[typeof RuntypeSymbol][1]

namespace Runtype {
	export const create = <R extends Runtype.Core = never>(
		validate: (
			x: unknown,
			innerValidate: InnerValidate,
			self: R,
			parsing: boolean,
		) => Result<Static<R> | Parsed<R>>,
		base: Base<R>,
	): R => {
		const self = base as Base<R> & R & Runtype.Common<Static<R>>

		defineProperties(
			self,
			{
				[RuntypeSymbol]: {
					validate: (value: unknown, visited: VisitedState, parsing: boolean) => {
						if (isObject(value)) {
							const memo = visited.memo(value, self, null)
							if (memo) return memo
							else if (memo === undefined) {
								const result = validate(value, createInnerValidate(visited), self, parsing)
								visited.memo(value, self, result)
								return result
							} else return SUCCESS(value)
						} else {
							return validate(value, createInnerValidate(visited), self, parsing)
						}
					},
				},
				toString: (): string => `Runtype<${show(self as Runtype)}>`,
			},
			{ configurable: true, enumerable: false, writable: true },
		)

		defineProperties(
			self,
			{
				validate: (x: unknown): Result<Static<R>> =>
					(self[RuntypeSymbol] as any).validate(x, createVisitedState(), false),
				check: (x: unknown): Static<R> => {
					const result: Result<unknown> = self.validate(x)
					if (result.success) return result.value as Static<R>
					else throw new ValidationError(result)
				},
				guard: (x: unknown): x is Static<R> => self.validate(x).success,
				assert: (x: unknown): asserts x is Static<R> => void self.check(x),
				parse: (x: unknown): Parsed<R> => {
					const result: Result<unknown> = (self[RuntypeSymbol] as any).validate(
						x,
						createVisitedState(),
						true,
					)
					if (result.success) return result.value as Static<R>
					else throw new ValidationError(result)
				},
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
				default: <Y extends Parsed<R>>(value: Y) => Optional(self, value),
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
				withParser: <Y>(parser: (value: Parsed<R>) => Y) => Parser(self, parser),
				conform: () => self,
			},
			{ configurable: true, enumerable: true, writable: true },
		)

		return self as R
	}

	/** @internal */
	export const isRuntype = (x: unknown): x is Runtype =>
		isObject(x) && globalThis.Object.hasOwn(x, RuntypeSymbol)

	export type Base<R> = {
		[K in keyof R as K extends Exclude<keyof Runtype.Common, "tag"> ? never : K]: R[K]
	} & (
		| globalThis.Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type
		| object
	)

	export interface Common<T = unknown, X = T> extends Core<T, X>, Conformance<T, X> {
		/**
		 * Returns a clone of this runtype with additional properties. Useful when you want to provide related values, such as the default value and utility functions.
		 */
		with: <P extends object>(extension: P | ((self: this) => P)) => this & P

		/**
		 * Creates a shallow clone of this runtype.
		 */
		clone: () => this

		/**
		 * Unions this Runtype with another.
		 */
		or: <R extends Runtype.Core>(other: R) => Union.WithUtilities<[this, R]>

		/**
		 * Intersects this Runtype with another.
		 */
		and: <R extends Runtype.Core>(other: R) => Intersect<[this, R]>

		/**
		 * Optionalizes this property.
		 *
		 * Note that `Optional` is not a runtype, but just a contextual modifier which is only meaningful when defining the content of `Object`. If you want to allow the validated value to be `undefined`, use `undefinedable` method.
		 */
		optional: () => Optional<this, never>

		/**
		 * Optionalizes this property, defaulting to the given value if this property was absent; only meaningful for parsing.
		 */
		default: <X = never>(value: X) => Optional<this, X>

		/**
		 * Unions this runtype with `Null`.
		 */
		nullable: () => Union.WithUtilities<[this, Literal<null>]>

		/**
		 * Unions this runtype with `Undefined`.
		 */
		undefinedable: () => Union.WithUtilities<[this, Literal<undefined>]>

		/**
		 * Unions this runtype with `Null` and `Undefined`.
		 */
		nullishable: () => Union.WithUtilities<[this, Literal<null>, Literal<undefined>]>

		/**
		 * Uses a constraint function to add additional constraints to this runtype, and manually converts a static type of this runtype into another via the type argument if passed.
		 */
		withConstraint: <U extends T>(constraint: (x: T) => boolean | string) => Constraint<this, U>

		/**
		 * Uses a guard function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
		 */
		withGuard: <U extends T>(guard: (x: T) => x is U) => Constraint<this, U>

		/**
		 * Uses an assertion function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
		 */
		withAssertion: <U extends T>(assert: (x: T) => asserts x is U) => Constraint<this, U>

		/**
		 * Adds a brand to the type.
		 */
		withBrand: <B extends string>(brand: B) => Brand<B, this>

		/**
		 * Chains custom parser after this runtype. Only works in the `parse` method.
		 */
		withParser: <Y>(parser: (value: X) => Y) => Parser<this, Y>

		/**
		 * Statically ensures this runtype is defined for exactly `T`, not for a subtype of `T`. `X` is for the parsed type.
		 */
		conform<T, X = T>(this: Conform<T, X>): Conform<T, X> & this
	}

	type Conform<T, X> = Runtype.Core<T, X> & Conformance<T, X>

	type Conformance<T, X> = {
		/** @internal */ readonly [RuntypeConformance]: [
			(StaticTypeOfThis: T) => T,
			(ParsedTypeOfThis: X) => X,
		]
	}

	/**
	 * A runtype determines at runtime whether a value conforms to a type specification.
	 */
	export interface Core<T = any, X = T> {
		/** @internal */ readonly [RuntypeSymbol]: [T, X]

		tag: string

		/**
		 * Validates that a value conforms to this runtype, returning a detailed information of success or failure. Does not throw on failure.
		 */
		validate: <U = T>(x: Maybe<T, U>) => Result<T & U>

		/**
		 * Validates that a value conforms to this runtype, returning a `boolean` that represents success (`true`) or failure (`false`). Does not throw on failure.
		 */
		guard: <U = T>(x: Maybe<T, U>) => x is T & U

		/**
		 * Validates that a value conforms to this runtype, returning the original value, statically typed. Throws `ValidationError` on failure.
		 */
		check: <U = T>(x: Maybe<T, U>) => T & U

		/**
		 * Validates that a value conforms to this runtype. Throws `ValidationError` on failure.
		 */
		assert: <U = T>(x: Maybe<T, U>) => asserts x is T & U

		/**
		 * Validates that a value conforms to this runtype and returns another value transformed by functions passed to `withParser`. Throws `ValidationError` on failure. Does not modify the original value.
		 */
		parse: <U = T>(x: Maybe<T, U>) => X
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
	| Parser
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

type InnerValidate = <T>(runtype: Runtype.Core, value: unknown, parsing: boolean) => Result<T>

const createInnerValidate =
	(visited: VisitedState): InnerValidate =>
	(runtype, value, parsing) =>
		(runtype[RuntypeSymbol] as any).validate(value, visited, parsing)

type VisitedState = {
	memo: (
		candidate: object,
		runtype: Runtype.Core,
		result: Result<any> | null,
	) => Result<any> | null | undefined
}

const createVisitedState = (): VisitedState => {
	const map = new WeakMap<object, WeakMap<Runtype.Core, Result<any> | null>>()

	const memo = (
		candidate: object,
		runtype: Runtype.Core,
		result: Result<any> | null,
	): Result<any> | null | undefined => {
		const inner = map.get(candidate) ?? new WeakMap()
		map.set(candidate, inner)
		const memo = inner.get(runtype)
		inner.set(runtype, result)
		return memo
	}

	return { memo }
}

export default Runtype
// eslint-disable-next-line import/no-named-export, sort-exports/sort-exports
export type { Static, Parsed }