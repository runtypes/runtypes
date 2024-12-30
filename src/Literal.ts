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

/**
 * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
 */
const literal = (value: unknown) =>
	Array.isArray(value)
		? globalThis.String(value.map(globalThis.String))
		: typeof value === "bigint"
			? globalThis.String(value) + "n"
			: globalThis.String(value)

/**
 * Construct a runtype for a type literal.
 */
const Literal = <T extends LiteralBase>(value: T) =>
	Runtype.create<Literal<T>>(
		x =>
			(x === value
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