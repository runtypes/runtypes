import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Symbol<K extends string | undefined = string | undefined> extends Runtype<symbol> {
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
		({ value, self }) => {
			if (typeof value !== "symbol")
				return FAILURE.TYPE_INCORRECT({ expected: self, received: value })
			else {
				if (globalThis.Symbol.keyFor(value) !== self.key)
					return FAILURE.VALUE_INCORRECT({ expected: self, received: value })
				else return SUCCESS(value)
			}
		},
		{ tag: "symbol", key },
	)

/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
const Symbol = Runtype.create<Symbol>(
	({ value, self }) =>
		typeof value === "symbol"
			? SUCCESS(value)
			: FAILURE.TYPE_INCORRECT({ expected: self, received: value }),
	globalThis.Object.assign(SymbolFor, { tag: "symbol" as const, key: undefined }),
)

const quoteIfPresent = (key: string | undefined) => (key === undefined ? "undefined" : `"${key}"`)

export default Symbol