import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import sameValueZero from "./utils-internal/sameValueZero.ts"

type LiteralStatic = undefined | null | boolean | number | bigint | string

interface Literal<T extends LiteralStatic = LiteralStatic> extends Runtype<T> {
	tag: "literal"
	value: T
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