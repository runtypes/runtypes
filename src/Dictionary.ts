import Constraint from "./Constraint.ts"
import Optional from "./Optional.ts"
import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import String from "./String.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import show from "./utils-internal/show.ts"

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
	tag: "dictionary"
	key: StringLiteralFor<K>
	value: V
}

interface StringDictionary<V extends RuntypeBase>
	extends Runtype<
		V extends Optional<any> ? { [_ in string]?: Static<V> } : { [_ in string]: Static<V> }
	> {
	tag: "dictionary"
	key: "string"
	value: V
}

interface NumberDictionary<V extends RuntypeBase>
	extends Runtype<
		V extends Optional<any> ? { [_ in number]?: Static<V> } : { [_ in number]: Static<V> }
	> {
	tag: "dictionary"
	key: "number"
	value: V
}

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
	const keyString = show(keyRuntype as any)
	const self = { tag: "dictionary", key: keyString, value } as any
	return create<any>((x, visited) => {
		if (x === null || x === undefined || typeof x !== "object")
			return FAILURE.TYPE_INCORRECT(self, x)

		if (globalThis.Object.getPrototypeOf(x) !== globalThis.Object.prototype)
			if (!Array.isArray(x) || keyString === "string") return FAILURE.TYPE_INCORRECT(self, x)

		const numberString = /^(?:NaN|-?\d+(?:\.\d+)?)$/
		const keys = enumerableKeysOf(x)
		const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
			(results, key) => {
				// We should provide interoperability with `number` and `string` here,
				// as a user would expect JavaScript engines to convert numeric keys to
				// string keys automatically. So, if the key can be interpreted as a
				// decimal number, then test it against a `Number` OR `String` runtype.
				const isNumberLikeKey = typeof key === "string" && numberString.test(key)
				const keyInterop = isNumberLikeKey ? globalThis.Number(key) : key
				if (
					isNumberLikeKey
						? !keyRuntype.guard(keyInterop) && !keyRuntype.guard(key)
						: !keyRuntype.guard(keyInterop)
				) {
					results[key as any] = FAILURE.KEY_INCORRECT(self, keyRuntype.reflect, keyInterop)
				} else results[key as any] = innerValidate(value, x[key], visited)
				return results
			},
			{},
		)

		const details = keys.reduce<{ [key in string | number | symbol]: string | Failure.Details }>(
			(details, key) => {
				const result = results[key as any]!
				if (!result.success) details[key as any] = result.details || result.message
				return details
			},
			{},
		)

		if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
		else return SUCCESS(x)
	}, self)
}

export default Dictionary
// eslint-disable-next-line import/no-named-export
export { type NumberDictionary, type StringDictionary }