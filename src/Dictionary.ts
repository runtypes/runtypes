import Constraint from "./Constraint.ts"
import Optional from "./Optional.ts"
import Record from "./Record.ts"
import Runtype, { RuntypeBase } from "./Runtype.ts"
import String from "./String.ts"
import Static from "./utils/Static.ts"

type DictionaryKeyType = string | number | symbol
type StringLiteralFor<K extends DictionaryKeyType> = K extends string
	? "string"
	: K extends number
		? "number"
		: K extends symbol
			? "symbol"
			: never
type DictionaryKeyRuntype = RuntypeBase<string | number | symbol>

const NumberKey = Constraint(String, s => !isNaN(+s), { name: "number" })

interface Dictionary<V extends RuntypeBase, K extends DictionaryKeyType>
	extends Runtype<V extends Optional<any> ? { [_ in K]?: Static<V> } : { [_ in K]: Static<V> }> {
	tag: "record"
	key: StringLiteralFor<K>
	value: V
}

/**
 * @deprecated Use `Record` instead.
 */
const Dictionary: {
	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A `Runtype` for key.
	 */
	<V extends RuntypeBase, K extends DictionaryKeyRuntype>(
		value: V,
		key?: K,
	): Dictionary<V, Static<K>>

	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A string representing a type for key.
	 */
	<V extends RuntypeBase>(value: V, key: "string"): Dictionary<V, string>

	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A string representing a type for key.
	 */
	<V extends RuntypeBase>(value: V, key: "number"): Dictionary<V, number>
} = <V extends RuntypeBase, K extends DictionaryKeyRuntype | "string" | "number">(
	value: V,
	key?: K,
) => {
	const keyRuntype =
		key === undefined
			? String
			: key === "string"
				? String
				: key === "number"
					? NumberKey
					: (key as Exclude<K, string>)
	return Record(keyRuntype, value) as Dictionary<V, K extends DictionaryKeyRuntype ? Static<K> : K>
}

export default Dictionary