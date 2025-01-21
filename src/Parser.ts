import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Parser<R extends Runtype.Core = Runtype.Core, X = Parsed<R>>
	extends Runtype<Static<R>, X> {
	tag: "parser"
	underlying: R
	parser: (value: Parsed<R>) => X
}

/**
 * Constructs a runtype that transforms values validated and transformed by another runtype.
 */
const Parser = <R extends Runtype.Core, X>(
	underlying: R,
	parser: (value: Parsed<R>) => X,
): Parser<R, X> =>
	Runtype.create<Parser<R, X>>(
		({ received, innerValidate, expected, parsing }) => {
			try {
				const result = innerValidate({ expected: expected.underlying, received, parsing })
				if (!result.success) return result
				if (!parsing) return result
				return SUCCESS(expected.parser(result.value))
			} catch (error) {
				return FAILURE.PARSING_FAILED({ expected, received, thrown: error })
			}
		},
		{ tag: "parser", underlying, parser },
	)

export default Parser