import Brand from "./Brand.ts"
import Constraint, { type ConstraintCheck } from "./Constraint.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import Optional from "./Optional.ts"
import Union from "./Union.ts"
import type Result from "./result/Result.ts"
import ValidationError from "./result/ValidationError.ts"
import type Reflect from "./utils/Reflect.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import isObject from "./utils-internal/isObject.ts"
import show from "./utils-internal/show.ts"

const RuntypeSymbol = Symbol()

const isRuntype = (x: unknown): x is RuntypeBase<unknown> =>
	isObject(x) && globalThis.Object.hasOwn(x, RuntypeSymbol)

/**
 * Obtains the static type associated with a Runtype.
 */
type Static<A extends { readonly [RuntypeSymbol]: unknown }> = A[typeof RuntypeSymbol]

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
interface RuntypeBase<A = unknown> {
	/**
	 * Verifies that a value conforms to this runtype. When given a value that does
	 * not conform to the runtype, throws an exception.
	 */
	assert(x: unknown): asserts x is A

	/**
	 * Verifies that a value conforms to this runtype. If so, returns the same value,
	 * statically typed. Otherwise throws an exception.
	 */
	check(x: unknown): A

	/**
	 * Validates that a value conforms to this type, and returns a result indicating
	 * success or failure (does not throw).
	 */
	validate(x: unknown): Result<A>

	/**
	 * A type guard for this runtype.
	 */
	guard(x: unknown): x is A

	/**
	 * Convert this to a Reflect, capable of introspecting the structure of the type.
	 */
	readonly reflect: Reflect

	/** @internal */ readonly [RuntypeSymbol]: A
}

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
interface Runtype<A = unknown> extends RuntypeBase<A> {
	/**
	 * Union this Runtype with another.
	 */
	or<B extends RuntypeBase>(B: B): Union<[this, B]>

	/**
	 * Intersect this Runtype with another.
	 */
	and<B extends RuntypeBase>(B: B): Intersect<[this, B]>

	/**
	 * Optionalize this Runtype.
	 */
	optional(): Optional<this>

	/**
	 * Union this Runtype with `Null`.
	 */
	nullable(): Union<[this, Literal<null>]>

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
	withConstraint<T extends Static<this>, K = unknown>(
		constraint: ConstraintCheck<this>,
		options?: { name?: string; args?: K },
	): Constraint<this, T, K>

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
	withGuard<T extends Static<this>, K = unknown>(
		guard: (x: Static<this>) => x is T,
		options?: { name?: string; args?: K },
	): Constraint<this, T, K>

	/**
	 * Adds a brand to the type.
	 */
	withBrand<B extends string>(brand: B): Brand<B, this>
}

const create = <A extends RuntypeBase>(
	validate: (x: unknown, innerValidate: InnerValidate) => Result<Static<A>>,
	base: any,
): A => {
	const check = (x: unknown) => {
		const result: Result<unknown> = base.validate(x)
		if (result.success) return result.value
		else throw new ValidationError(result)
	}

	const guard = (x: unknown): x is A => base.validate(x).success

	const or = <B extends Runtype>(B: B): Union<[A, B]> => Union(base, B)

	const and = <B extends Runtype>(B: B): Intersect<[A, B]> => Intersect(base, B)

	const optional = (): Optional<A> => Optional(base)

	const nullable = (): Union<[A, Literal<null>]> => Union(base, Literal(null))

	const withConstraint = <T extends Static<A>, K = unknown>(
		constraint: ConstraintCheck<A>,
		options?: { name?: string; args?: K },
	): Constraint<A, T, K> => Constraint<A, T, K>(base, constraint, options)

	const withGuard = <T extends Static<A>, K = unknown>(
		guard: (x: Static<A>) => x is T,
		options?: { name?: string; args?: K },
	): Constraint<A, T, K> => Constraint<A, T, K>(base, guard, options)

	const withBrand = <B extends string>(B: B): Brand<B, A> => Brand(B, base)

	const propertiesNonEnumerable = {
		[RuntypeSymbol]: (value: unknown, visited: VisitedState) => {
			if (visited.has(value, base)) return SUCCESS(value)
			return validate(value, createInnerValidate(visited))
		},
		toString: () => `Runtype<${show(base)}>`,
	}
	const propertiesEnumerable = {
		validate: (value: unknown) => base[RuntypeSymbol](value, createVisitedState()),
		check,
		assert: check,
		guard,
		or,
		and,
		optional,
		nullable,
		withConstraint,
		withGuard,
		withBrand,
		reflect: base,
	}

	const writable = true
	const configurable = true
	defineProperties(base, propertiesNonEnumerable, { enumerable: false, writable, configurable })
	defineProperties(base, propertiesEnumerable, { enumerable: true, writable, configurable })

	return base
}

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

type InnerValidate = <A extends RuntypeBase>(runtype: A, value: unknown) => Result<Static<A>>

const createInnerValidate =
	(visited: VisitedState): InnerValidate =>
	<A extends RuntypeBase>(runtype: A, value: unknown): Result<Static<A>> =>
		(runtype as any)[RuntypeSymbol](value, visited)

type VisitedState = {
	has: (candidate: unknown, runtype: RuntypeBase) => boolean
}

const createVisitedState = (): VisitedState => {
	const members = new WeakMap<object, WeakSet<RuntypeBase>>()

	const add = (candidate: unknown, runtype: RuntypeBase) => {
		if (!isObject(candidate)) return
		members.set(candidate, (members.get(candidate) ?? new WeakSet()).add(runtype))
	}

	const has = (candidate: unknown, runtype: RuntypeBase) => {
		if (!isObject(candidate)) return false
		const value = members.get(candidate)?.has(runtype) ?? false
		add(candidate, runtype)
		return value
	}

	return { has }
}

export default Runtype
// eslint-disable-next-line import/no-named-export
export { type RuntypeBase, type Static, create, isRuntype }