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
import copyProperties from "./utils-internal/copyProperties.ts"
import defineIntrinsics from "./utils-internal/defineIntrinsics.ts"
import isObject from "./utils-internal/isObject.ts"
import show from "./utils-internal/show.ts"

const RuntypeSymbol: unique symbol = globalThis.Symbol() as any
const RuntypeConformance: unique symbol = globalThis.Symbol() as any
const RuntypePrivate: unique symbol = globalThis.Symbol() as any

/**
 * Obtains the static type associated with a runtype.
 */
type Static<R extends { readonly [RuntypeSymbol]: [unknown, unknown] }> = R[typeof RuntypeSymbol][0]

/**
 * Obtains the parsed type associated with a runtype.
 */
type Parsed<R extends { readonly [RuntypeSymbol]: [unknown, unknown] }> = R[typeof RuntypeSymbol][1]

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
class Runtype<T = any, X = T> implements Conformance<T, X> {
	tag!: string

	/** @internal */ readonly [RuntypeSymbol]!: [T, X]

	/** @internal */ readonly [RuntypeConformance]!: Conformance<T, X>[typeof RuntypeConformance]

	/** @internal */ private readonly [RuntypePrivate]!: {
		(
			context: Context<Runtype.Core<T, X>> & {
				visited: VisitedState
				memoParsed?: WeakMap<object, object>
			},
		): Result<T | X>
		validate: <R extends Runtype>(
			context: Context<R> & { innerValidate: InnerValidate; memoParsed: WeakMap<object, object> },
		) => Result<Static<R> | Parsed<R>>
		extensions: (object | ((self: Runtype) => object))[]
	}

	get [globalThis.Symbol.toStringTag](): string {
		return `Runtype<${show(this)}>`
	}

	toString(): string {
		return `[object ${this[globalThis.Symbol.toStringTag]}]`
	}

	/** @internal */ static create = <R extends Runtype>(
		validate: (
			context: Context<R> & { innerValidate: InnerValidate; memoParsed?: WeakMap<object, object> },
		) => Result<Static<R> | Parsed<R>>,
		base: Runtype.Base<R>,
	): R => new Runtype(validate as any, base) as R

	static #createInnerValidate =
		(visited: VisitedState): InnerValidate =>
		context =>
			(context.expected as Runtype)[RuntypePrivate]({ ...context, visited })

	/** @internal */ private constructor(
		validate: (context: Context<Runtype<T, X>> & { innerValidate: InnerValidate }) => Result<T | X>,
		base: Runtype.Base<Runtype.Core<T>>,
	) {
		// @ts-expect-error: type-only
		delete this[RuntypeSymbol]
		// @ts-expect-error: type-only
		delete this[RuntypeConformance]
		copyProperties(this, base)
		defineIntrinsics(this, {
			[RuntypePrivate]: globalThis.Object.assign(
				({
					expected,
					received,
					visited,
					parsing,
					memoParsed,
				}: Context<Runtype<T, X>> & {
					visited: VisitedState
					memoParsed: WeakMap<object, object>
				}) => {
					if (isObject(received)) {
						const memo = visited.memo(received, expected, null)
						if (memo) return memo
						else if (memo === undefined) {
							const innerValidate = Runtype.#createInnerValidate(visited)
							const result = expected[RuntypePrivate].validate({
								received,
								innerValidate,
								expected,
								parsing,
								memoParsed,
							})
							visited.memo(received, expected, result)
							return result
						} else return SUCCESS((parsing && memoParsed?.get(received)) || received)
					} else {
						const innerValidate = Runtype.#createInnerValidate(visited)
						return expected[RuntypePrivate].validate({
							received,
							innerValidate,
							expected,
							parsing,
							memoParsed,
						})
					}
				},
				{ validate, extensions: [] },
			),
		})
		copyProperties(base, this)
		bindThis(base, globalThis.Object.getPrototypeOf(this))
		return base as this
	}

	/**
	 * Process a value with this runtype, returning a detailed information of success or failure. Does not throw on failure.
	 */
	inspect<U = T, P extends boolean = true>(
		x: Maybe<T, U>,
		options: {
			/**
			 * Whether to parse.
			 *
			 * @default true
			 */
			parse?: P | undefined
		} = {},
	): Result<P extends true ? X : T & U> {
		return this[RuntypePrivate]({
			expected: this,
			received: x,
			visited: createVisitedState(),
			parsing: options.parse ?? true,
		}) as Result<P extends true ? X : T & U>
	}

	/**
	 * Validates that a value conforms to this runtype, returning the original value, statically typed. Throws `ValidationError` on failure.
	 */
	check<U = T>(x: Maybe<T, U>): T & U {
		const result: Result<unknown> = this.inspect(x, { parse: false })
		if (result.success) return result.value as T & U
		else throw new ValidationError(result)
	}

	/**
	 * Validates that a value conforms to this runtype, returning a `boolean` that represents success or failure. Does not throw on failure.
	 */
	guard<U = T>(x: Maybe<T, U>): x is T & U {
		return this.inspect(x, { parse: false }).success
	}

	/**
	 * Validates that a value conforms to this runtype. Throws `ValidationError` on failure.
	 */
	assert<U = T>(x: Maybe<T, U>): asserts x is T & U {
		return void this.check(x)
	}

	/**
	 * Validates that a value conforms to this runtype and returns another value returned by the function passed to `withParser`. Throws `ValidationError` on failure. Does not modify the original value.
	 */
	parse<U = T>(x: Maybe<T, U>): X {
		const result: Result<unknown> = this.inspect(x, { parse: true })
		if (result.success) return result.value as X
		else throw new ValidationError(result)
	}

	/**
	 * Returns a shallow clone of this runtype with additional properties. Useful when you want to integrate related values, such as the default value and utility functions.
	 */
	with<P extends object>(extension: P | ((self: this) => P)): this & P {
		const cloned = this.clone() as this & P
		cloned[RuntypePrivate].extensions = [...this[RuntypePrivate].extensions, extension]
		for (const extension of cloned[RuntypePrivate].extensions)
			copyProperties(cloned, typeof extension === "function" ? extension(cloned) : extension)
		return cloned
	}

	/**
	 * Creates a shallow clone of this runtype.
	 */
	clone(): this {
		const base =
			typeof this === "function"
				? (this as globalThis.Function).bind(undefined)
				: globalThis.Object.create(globalThis.Object.getPrototypeOf(this))
		copyProperties(base, this)
		return new Runtype(this[RuntypePrivate].validate as any, base) as any
	}

	/**
	 * Unions this Runtype with another.
	 */
	or<R extends Runtype.Core>(other: R): Union<[this, R]> {
		return Union(this, other)
	}

	/**
	 * Intersects this Runtype with another.
	 */
	and<R extends Runtype.Core>(other: R): Intersect<[this, R]> {
		return Intersect(this, other)
	}

	/**
	 * Optionalizes this property.
	 *
	 * Note that `Optional` is not a runtype, but just a contextual modifier which is only meaningful when defining the content of `Object`. If you want to allow the validated value to be `undefined`, use `undefinedable` method.
	 */
	optional(): Optional<this, never> {
		return Optional<this>(this)
	}

	/**
	 * Optionalizes this property, defaulting to the given value if this property was absent. Only meaningful for parsing.
	 */
	default<X = never>(value: X): Optional<this, X> {
		return Optional(this, value)
	}

	/**
	 * Unions this runtype with `Null`.
	 */
	nullable(): Union<[this, Literal<null>]> {
		return Union(this, Literal(null))
	}

	/**
	 * Unions this runtype with `Undefined`.
	 */
	undefinedable(): Union<[this, Literal<undefined>]> {
		return Union(this, Literal(undefined))
	}

	/**
	 * Unions this runtype with `Null` and `Undefined`.
	 */
	nullishable(): Union<[this, Literal<null>, Literal<undefined>]> {
		return Union(this, Literal(null), Literal(undefined))
	}

	/**
	 * Uses a constraint function to add additional constraints to this runtype, and manually converts a static type of this runtype into another via the type argument if passed.
	 */
	withConstraint<Y extends X>(constraint: (x: X) => boolean | string): Constraint<this, Y> {
		return Constraint(this, (x: X): asserts x is Y => {
			const message = constraint(x)
			if (typeof message === "string") throw message
			else if (!message) throw undefined
		})
	}

	/**
	 * Uses a guard function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
	 */
	withGuard<Y extends X>(guard: (x: X) => x is Y): Constraint<this, Y> {
		return Constraint(this, (x: X): asserts x is Y => {
			if (!guard(x)) throw undefined
		})
	}

	/**
	 * Uses an assertion function to add additional constraints to this runtype, and automatically converts a static type of this runtype into another.
	 */
	withAssertion<Y extends X>(assert: (x: X) => asserts x is Y): Constraint<this, Y> {
		return Constraint(this, assert)
	}

	/**
	 * Adds a brand to the type.
	 */
	withBrand<B extends string>(brand: B): Brand<B, this> {
		return Brand(brand, this)
	}

	/**
	 * Chains custom parser after this runtype. Basically only works in the `parse` method, but in certain cases parsing is implied within a chain of normal validation, such as before execution of a constraint, or upon function boundaries enforced with `Contract` and `AsyncContract`.
	 */
	withParser<Y>(parser: (value: X) => Y): Parser<this, Y> {
		return Parser(this, parser)
	}

	/**
	 * Statically ensures this runtype is defined for exactly `T`, not for a subtype of `T`. `X` is for the parsed type.
	 */
	conform<T, X = T>(this: Conform<T, X>): Conform<T, X> & this {
		return this as any
	}

	/**
	 * Guards if a value is a runtype.
	 */
	static isRuntype = (x: unknown): x is Runtype.Interfaces =>
		x instanceof globalThis.Object && globalThis.Object.hasOwn(x, RuntypePrivate)

	/**
	 * Asserts if a value is a runtype.
	 */
	static assertIsRuntype: (x: unknown) => asserts x is Runtype.Interfaces = x => {
		if (!Runtype.isRuntype(x)) throw new Error("Expected runtype, but was not")
	}

	static [globalThis.Symbol.hasInstance] = Runtype.isRuntype
}

namespace Runtype {
	// eslint-disable-next-line import/no-unused-modules
	/** @internal */ export type Base<R> = {
		[K in keyof R as K extends Exclude<keyof Runtype, "tag"> ? never : K]: R[K]
	} & (
		| globalThis.Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type
		| object
	)

	/**
	 * An upper bound of a {@link Runtype|`Runtype`}, with the bare minimum set of APIs to perform validation and parsing. Useful when you want a variable to accept any runtype; if you want to introspect the contents of it, use {@link Runtype.isRuntype|`Runtype.isRuntype`} or {@link Runtype.assertIsRuntype|`Runtype.assertIsRuntype`} first and `switch` with the {@link Runtype.prototype.tag|`Runtype.prototype.tag`}.
	 */
	// eslint-disable-next-line import/no-unused-modules
	export type Core<T = any, X = T> = Pick<
		Runtype<T, X>,
		typeof RuntypeSymbol | "tag" | "inspect" | "check" | "guard" | "assert" | "parse"
	>

	/**
	 * The union of all possible runtypes. {@link Runtype.isRuntype|`Runtype.isRuntype`} or {@link Runtype.assertIsRuntype|`Runtype.assertIsRuntype`} can be used to ensure a value is of this type.
	 */
	// eslint-disable-next-line import/no-unused-modules
	export type Interfaces =
		| Array
		| Array.Readonly
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
		| Object.Readonly
		| Parser
		| Record
		| String
		| Symbol
		| Template
		| Tuple
		| Tuple.Readonly
		| Union
		| Unknown

	// eslint-disable-next-line import/no-unused-modules
	export type Spreadable = Runtype.Core<readonly unknown[]> & Iterable<Spread<Spreadable>>
}

const bindThis = (self: object, prototype: object) => {
	const descriptors = globalThis.Object.getOwnPropertyDescriptors(prototype)
	delete (descriptors as Partial<typeof descriptors>)["constructor"]
	for (const key of globalThis.Reflect.ownKeys(descriptors)) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const descriptor = descriptors[key as keyof typeof descriptors]!
		if ("value" in descriptor && typeof descriptor.value === "function")
			descriptor.value = descriptor.value.bind(self)
		if ("get" in descriptor && descriptor.get) descriptor.get = descriptor.get.bind(self)
		if ("set" in descriptor && descriptor.set) descriptor.set = descriptor.set.bind(self)
	}
	globalThis.Object.defineProperties(self, descriptors)
}

type Conform<T, X> = Runtype.Core<T, X> & Conformance<T, X>

type Conformance<T, X> = {
	/** @internal */ readonly [RuntypeConformance]: [
		(StaticTypeOfThis: T) => T,
		(ParsedTypeOfThis: X) => X,
	]
}

// Special-casing when `T = never`, as it breaks expected assignability everywhere.
type Maybe<T, U> = [T] extends [never] ? unknown : [T & U] extends [never] ? T : U

type Context<R extends Runtype.Core> = { expected: R; received: unknown; parsing: boolean }

type InnerValidate = <T, X>(
	context: Context<Runtype.Core<T, X>> & { memoParsed?: WeakMap<object, object> },
) => Result<T | X>

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