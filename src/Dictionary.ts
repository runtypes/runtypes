import Constraint from "./Constraint.ts"
import type Optional from "./Optional.ts"
import Record from "./Record.ts"
import type Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import show from "./utils-internal/show.ts"

type DictionaryKeyType = string | number | symbol
type StringLiteralFor<K extends DictionaryKeyType> = K extends string
	? "string"
	: K extends number
		? "number"
		: K extends symbol
			? "symbol"
			: never
type DictionaryKeyRuntype = Runtype.Core<DictionaryKeyType>

const NumberKey = Constraint(String, s => !isNaN(+s), { name: "number" })

interface Dictionary<
	V extends Runtype.Core = Runtype.Core,
	K extends DictionaryKeyType = DictionaryKeyType,
> extends Runtype.Common<
		V extends Optional<any> ? { [_ in K]?: Static<V> } : { [_ in K]: Static<V> }
	> {
	tag: "dictionary"
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
	 * @deprecated Use `Record` instead.
	 */
	<V extends Runtype.Core, K extends DictionaryKeyRuntype>(
		value: V,
		key?: K,
	): Dictionary<V, Static<K>>

	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A string representing a type for key.
	 * @deprecated Use `Record` instead.
	 */
	<V extends Runtype.Core>(value: V, key: "string"): Dictionary<V, string>

	/**
	 * Construct a runtype for arbitrary dictionaries.
	 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
	 * @param value - A `Runtype` for value.
	 * @param [key] - A string representing a type for key.
	 * @deprecated Use `Record` instead.
	 */
	<V extends Runtype.Core>(value: V, key: "number"): Dictionary<V, number>
} = <V extends Runtype.Core, K extends DictionaryKeyRuntype | "string" | "number">(
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
					: (key as Exclude<K, string | number>)
	return Record(keyRuntype, value).with({
		tag: "dictionary",
		key: show(keyRuntype as Runtype) as any,
	}) as Dictionary<V, K extends DictionaryKeyRuntype ? Static<K> : K>
}

export default Dictionary