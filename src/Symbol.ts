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
		({ received, expected }) => {
			if (typeof received !== "symbol") return FAILURE.TYPE_INCORRECT({ expected, received })
			else {
				if (globalThis.Symbol.keyFor(received) !== expected.key)
					return FAILURE.VALUE_INCORRECT({ expected, received })
				else return SUCCESS(received)
			}
		},
		{ tag: "symbol", key },
	)

/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
const Symbol = Runtype.create<Symbol>(
	({ received, expected }) =>
		typeof received === "symbol"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	globalThis.Object.assign(SymbolFor, { tag: "symbol" as const, key: undefined }),
)

export default Symbol