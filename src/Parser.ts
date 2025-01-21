import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Adds a parser to the given runtype.
 *
 * Possible failures when `check`-ing:
 *
 * - Failures of the inner runtype
 *
 * Possible failures when `parse`-ing:
 *
 * - Failures of the inner runtype
 * - `PARSING_FAILED` with `thrown` reporting the thrown value from the parser function
 */
interface Parser<R extends Runtype.Core = Runtype.Core, X = Parsed<R>>
	extends Runtype<Static<R>, X> {
	tag: "parser"
	underlying: R
	parser: (value: Parsed<R>) => X
}

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