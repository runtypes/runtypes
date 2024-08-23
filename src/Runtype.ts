import Brand from "./Brand.ts"
import Constraint, { ConstraintCheck } from "./Constraint.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import Optional from "./Optional.ts"
import Union from "./Union.ts"
import Result from "./result/Result.ts"
import ValidationError from "./result/ValidationError.ts"
import Reflect from "./utils/Reflect.ts"
import Static from "./utils/Static.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import hasKey from "./utils-internal/hasKey.ts"
import show from "./utils-internal/show.ts"

const RuntypeSymbol: unique symbol = Symbol()

const isRuntype = (x: any): x is RuntypeBase<unknown> => hasKey(RuntypeSymbol, x)

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
interface RuntypeBase<A = unknown> {
	/**
	 * Verifies that a value conforms to this runtype. When given a value that does
	 * not conform to the runtype, throws an exception.
	 */
	assert(x: any): asserts x is A

	/**
	 * Verifies that a value conforms to this runtype. If so, returns the same value,
	 * statically typed. Otherwise throws an exception.
	 */
	check(x: any): A

	/**
	 * Validates that a value conforms to this type, and returns a result indicating
	 * success or failure (does not throw).
	 */
	validate(x: any): Result<A>

	/**
	 * A type guard for this runtype.
	 */
	guard(x: any): x is A

	/**
	 * Convert this to a Reflect, capable of introspecting the structure of the type.
	 */
	readonly reflect: Reflect

	/* @internal */ readonly _falseWitness: A
	/* @internal */ readonly [RuntypeSymbol]: true
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

class FunctionExtensible<F extends Function> {
	constructor(f: F) {
		return globalThis.Object.setPrototypeOf(f, new.target.prototype)
	}
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Runtype<A = unknown, T = A>
	extends FunctionExtensible<(...args: any) => void>
	implements Runtype<A, T> {}

const create = <A extends RuntypeBase>(
	validate: (x: any, visited: VisitedState) => Result<Static<A>>,
	base: any,
): A => {
	const check = (x: any) => {
		const result: Result<unknown> = base.validate(x)
		if (result.success) return result.value
		else throw new ValidationError(result)
	}

	const guard = (x: any): x is A => base.validate(x).success

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

	base[RuntypeSymbol] = true
	base.check = check
	base.assert = check
	base._innerValidate = (value: any, visited: VisitedState) => {
		if (visited.has(value, base)) return SUCCESS(value)
		return validate(value, visited)
	}
	base.validate = (value: any) => base._innerValidate(value, VisitedState())
	base.guard = guard
	base.or = or
	base.and = and
	base.optional = optional
	base.nullable = nullable
	base.withConstraint = withConstraint
	base.withGuard = withGuard
	base.withBrand = withBrand
	base.reflect = base
	base.toString = () => `Runtype<${show(base)}>`

	return base
}

const innerValidate = <A extends RuntypeBase>(
	targetType: A,
	value: any,
	visited: VisitedState,
): Result<Static<A>> => (targetType as any)._innerValidate(value, visited)

type VisitedState = {
	has: (candidate: object, type: RuntypeBase) => boolean
}
const VisitedState = (): VisitedState => {
	const members: WeakMap<object, WeakMap<RuntypeBase, true>> = new WeakMap()

	const add = (candidate: unknown, type: RuntypeBase) => {
		if (candidate === null || !(typeof candidate === "object")) return
		const typeSet = members.get(candidate)
		members.set(
			candidate,
			typeSet
				? typeSet.set(type, true)
				: (new WeakMap() as WeakMap<RuntypeBase, true>).set(type, true),
		)
	}

	const has = (candidate: object, type: RuntypeBase) => {
		const typeSet = members.get(candidate)
		const value = (typeSet && typeSet.get(type)) || false
		add(candidate, type)
		return value
	}

	return { has }
}

export default Runtype
// eslint-disable-next-line import/no-named-export
export { type RuntypeBase, VisitedState, create, innerValidate, isRuntype }