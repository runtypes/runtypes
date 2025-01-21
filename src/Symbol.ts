import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a symbol, and optionally the key is equal to the given one. If you want to ensure a symbol is *not* keyed, pass `undefined`.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-symbols
 * - `VALUE_INCORRECT` if the key is not equal to the given one
 */
interface Symbol<K extends string | undefined = never> extends Runtype<symbol> {
	tag: "symbol"
	key?: K
	<K extends string | undefined>(key: K): Symbol<K>
}

const SymbolFor = <K extends string | undefined>(key: K): Symbol<K> =>
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

const Symbol: Symbol = Runtype.create<Symbol>(
	({ received, expected }) =>
		typeof received === "symbol"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	globalThis.Object.assign(SymbolFor, { tag: "symbol" as const }),
)

export default Symbol