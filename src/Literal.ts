import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * The super type of all literal types.
 */
type LiteralBase = undefined | null | boolean | number | bigint | string

interface Literal<A extends LiteralBase> extends Runtype<A> {
	tag: "literal"
	value: A
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
const Literal = <A extends LiteralBase>(value: A): Literal<A> => {
	const self = { tag: "literal", value } as unknown as Reflect
	return create<Literal<A>>(
		x =>
			x === value
				? SUCCESS(x)
				: FAILURE.VALUE_INCORRECT("literal", `\`${literal(value)}\``, `\`${literal(x)}\``),
		self,
	)
}

export default Literal
// eslint-disable-next-line import/no-named-export
export { type LiteralBase, literal }