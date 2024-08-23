import Optional from "./Optional.ts"
import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import show from "./utils-internal/show.ts"

type RecordKeyType = string | number | symbol
type StringLiteralFor<K extends RecordKeyType> = K extends string
	? "string"
	: K extends number
		? "number"
		: K extends symbol
			? "symbol"
			: never
type RecordKeyRuntype = RuntypeBase<string | number | symbol>

interface Record<K extends RecordKeyRuntype, V extends RuntypeBase>
	extends Runtype<
		V extends Optional<any> ? { [_ in Static<K>]?: Static<V> } : { [_ in Static<K>]: Static<V> }
	> {
	tag: "record"
	key: StringLiteralFor<Static<K>>
	value: V
}

/**
 * Construct a runtype for arbitrary records.
 * @param key - A `Runtype` for key.
 * @param value - A `Runtype` for value.
 */
const Record = <K extends RecordKeyRuntype, V extends RuntypeBase>(key: K, value: V) => {
	const keyRuntype = key
	const keyString = show(keyRuntype as any)
	const self = { tag: "record", key: keyString, value } as any
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

export default Record