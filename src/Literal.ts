import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * The super type of all literal types.
 */
type LiteralStatic = undefined | null | boolean | number | bigint | string

interface Literal<T extends LiteralStatic = LiteralStatic> extends Runtype.Common<T> {
	tag: "literal"
	value: T
}

const literal = (value: LiteralStatic): string =>
	typeof value === "bigint"
		? globalThis.String(value) + "n"
		: typeof value === "string"
			? `"${globalThis.String(value)}"`
			: globalThis.String(value)

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

/**
 * Construct a runtype for a type literal.
 */
const Literal = <T extends LiteralStatic>(value: T) =>
	Runtype.create<Literal<T>>(
		({ value: x, self }) =>
			sameValueZero(x, value)
				? SUCCESS(x as T)
				: typeof x !== typeof value || value === null
					? FAILURE.TYPE_INCORRECT({ expected: self, received: x })
					: FAILURE.VALUE_INCORRECT({ expected: self, received: x }),
		{ tag: "literal", value },
	)

export default Literal
// eslint-disable-next-line import/no-named-export
export { type LiteralStatic, literal }