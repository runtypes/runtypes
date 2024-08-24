import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Symbol extends Runtype<symbol> {
	tag: "symbol"
	/**
	Validates that a value is a symbol with a specific key or without any key.
	@param {string | undefined} key - Specify what key the symbol is for. If you want to ensure the validated symbol is *not* keyed, pass `undefined`.
	*/
	<K extends string | undefined>(key: K): SymbolFor<K>
}

interface SymbolFor<K extends string | undefined> extends Runtype<symbol> {
	tag: "symbol"
	key: K
}

const f = (key: string | undefined) => {
	const self = { tag: "symbol", key } as unknown as Reflect
	return create<Symbol>(value => {
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
	}, self)
}

const self = { tag: "symbol" } as unknown as Reflect

/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
const Symbol = create<Symbol>(
	value => (typeof value === "symbol" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	globalThis.Object.assign(f, self),
)

const quoteIfPresent = (key: string | undefined) => (key === undefined ? "undefined" : `"${key}"`)

export default Symbol