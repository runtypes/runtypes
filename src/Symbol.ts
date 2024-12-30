import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Symbol extends Runtype.Common<symbol> {
	tag: "symbol"
	/**
	Validates that a value is a symbol with a specific key or without any key.
	@param {string | undefined} key - Specify what key the symbol is for. If you want to ensure the validated symbol is *not* keyed, pass `undefined`.
	*/
	<K extends string | undefined>(key: K): SymbolFor<K>
}

interface SymbolFor<K extends string | undefined> extends Runtype.Common<symbol> {
	tag: "symbol"
	key: K
}

const SymbolFor = <K extends string | undefined>(key: K) =>
	Runtype.create<SymbolFor<K>>(
		(value, innerValidate, self) => {
			if (typeof value !== "symbol") return FAILURE.TYPE_INCORRECT(self, value)
			else {
				const keyForValue = globalThis.Symbol.keyFor(value)
				if (keyForValue !== key)
					return FAILURE.VALUE_INCORRECT(
						"symbol key",
						quoteIfPresent(key),
						quoteIfPresent(keyForValue),
					)
				else return SUCCESS(value)
			}
		},
		{ tag: "symbol", key },
	)

/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
const Symbol = Runtype.create<Symbol>(
	(value, innerValidate, self) =>
		typeof value === "symbol" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value),
	globalThis.Object.assign(SymbolFor, { tag: "symbol" as const }),
)

const quoteIfPresent = (key: string | undefined) => (key === undefined ? "undefined" : `"${key}"`)

export default Symbol