import Runtype, { type Static } from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Parser<R extends Runtype.Core = Runtype.Core, X = Static<R>>
	extends Runtype.Common<Static<R>, X> {
	tag: "parser"
	underlying: R
	parser: (value: Static<R>) => X
}

/**
 * Constructs a runtype that transforms values validated and transformed by another runtype.
 */
const Parser = <R extends Runtype.Core, X>(underlying: R, parser: (value: Static<R>) => X) =>
	Runtype.create<Parser<R, X>>(
		({ value, innerValidate, self, parsing }) => {
			try {
				const result = innerValidate(self.underlying, value, parsing)
				if (!result.success) return result
				if (!parsing) return result
				return SUCCESS(self.parser(result.value))
			} catch (error) {
				return FAILURE.PARSING_FAILED(error)
			}
		},
		{ tag: "parser", underlying, parser },
	)

export default Parser