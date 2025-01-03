import Runtype from "./Runtype.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * The super type of all literal types.
 */
type LiteralBase = undefined | null | boolean | number | bigint | string

interface Literal<T extends LiteralBase = LiteralBase> extends Runtype.Common<T> {
	tag: "literal"
	value: T
}

const literal = (value: unknown): string =>
	value !== null && typeof value === "object"
		? "[object Object]"
		: typeof value === "bigint"
			? globalThis.String(value) + "n"
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
const Literal = <T extends LiteralBase>(value: T) =>
	Runtype.create<Literal<T>>(
		x =>
			(sameValueZero(x, value)
				? SUCCESS(x as T)
				: FAILURE.VALUE_INCORRECT(
						"literal",
						`\`${literal(value)}\``,
						`\`${literal(x)}\``,
					)) as Result<T>,
		{ tag: "literal", value },
	)

export default Literal
// eslint-disable-next-line import/no-named-export
export { type LiteralBase, literal }