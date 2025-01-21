import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

type LiteralStatic = undefined | null | boolean | number | bigint | string

/**
 * Validates that a value is equal to the given value with the [`SameValueZero`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality) equality.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` if they have different `typeof`s
 * - `VALUE_INCORRECT` if they were different as per `SameValueZero`
 */
interface Literal<T extends LiteralStatic = LiteralStatic> extends Runtype<T> {
	tag: "literal"
	value: T
}

/**
 * <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality>
 */
const sameValueZero = (x: unknown, y: unknown) => {
	if (typeof x === "number" && typeof y === "number") {
		// x and y are equal (may be -0 and 0) or they are both NaN
		return x === y || (x !== x && y !== y)
	}
	return x === y
}

const Literal = <T extends LiteralStatic>(value: T) =>
	Runtype.create<Literal<T>>(
		({ received: x, expected }) =>
			sameValueZero(x, value)
				? SUCCESS(x as T)
				: typeof x !== typeof value || value === null
					? FAILURE.TYPE_INCORRECT({ expected, received: x })
					: FAILURE.VALUE_INCORRECT({ expected, received: x }),
		{ tag: "literal", value },
	)

export default Literal