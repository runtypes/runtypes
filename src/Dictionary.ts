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

interface StringDictionary<V extends RuntypeBase>
	extends Runtype<
		V extends Optional<any> ? { [_ in string]?: Static<V> } : { [_ in string]: Static<V> }
	> {
	tag: "record"
	key: "string"
	value: V
}

interface NumberDictionary<V extends RuntypeBase>
	extends Runtype<
		V extends Optional<any> ? { [_ in number]?: Static<V> } : { [_ in number]: Static<V> }
	> {
	tag: "record"
	key: "number"
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
	<V extends RuntypeBase>(value: V, key: "string"): StringDictionary<V>

	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A string representing a type for key.
	 */
	<V extends RuntypeBase>(value: V, key: "number"): NumberDictionary<V>
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
	return Record(keyRuntype, value)
}

export default Dictionary
// eslint-disable-next-line import/no-named-export
export { type NumberDictionary, type StringDictionary }