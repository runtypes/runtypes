import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Symbol<K extends string | undefined = undefined> extends Runtype.Common<symbol> {
	tag: "symbol"
	key: K

	/**
	Validates that a value is a symbol with a specific key or without any key.
	@param {string | undefined} key - Specify what key the symbol is for. If you want to ensure the validated symbol is *not* keyed, pass `undefined`.
	*/
	<K extends string | undefined>(key: K): Symbol<K>
}

const SymbolFor = <K extends string | undefined>(key: K) =>
	Runtype.create<Symbol<K>>(
		(value, innerValidate, self) => {
			if (typeof value !== "symbol") return FAILURE.TYPE_INCORRECT(self, value)
			else {
				const keyForValue = globalThis.Symbol.keyFor(value)
				console.log(keyForValue, self.key)
				if (keyForValue !== self.key)
					if (self.key === undefined) {
						return FAILURE.VALUE_INCORRECT("unique", "symbol", `for ${quoteIfPresent(keyForValue)}`)
					} else {
						return FAILURE.VALUE_INCORRECT(
							"symbol for",
							quoteIfPresent(self.key),
							keyForValue === undefined ? "unique" : `for ${quoteIfPresent(keyForValue)}`,
						)
					}
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
	globalThis.Object.assign(SymbolFor, { tag: "symbol" as const, key: undefined }),
)

const quoteIfPresent = (key: string | undefined) => (key === undefined ? "undefined" : `"${key}"`)

export default Symbol