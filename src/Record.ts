import type Optional from "./Optional.ts"
import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

type RecordKeyType = string | number | symbol
type StringLiteralFor<K extends RecordKeyType> = K extends string
	? "string"
	: K extends number
		? "number"
		: K extends symbol
			? "symbol"
			: never
type RecordKeyRuntype = Runtype.Core<string | number | symbol>

interface Record<
	K extends RecordKeyRuntype = RecordKeyRuntype,
	V extends Runtype.Core = Runtype.Core,
> extends Runtype.Common<
		V extends Optional<any>
			? { [_ in Static<K>]?: Exclude<Static<V>, undefined> }
			: { [_ in Static<K>]: Static<V> }
	> {
	tag: "record"
	key: K
	value: V
}

/**
 * Construct a runtype for arbitrary records.
 * @param key - A `Runtype` for key.
 * @param value - A `Runtype` for value.
 */
const Record = <K extends RecordKeyRuntype, V extends Runtype.Core>(key: K, value: V) => {
	const keyRuntype = key
	const valueRuntype = value
	return Runtype.create<Record<K, V>>(
		(x, innerValidate, self) => {
			if (x === null || x === undefined || typeof x !== "object")
				return FAILURE.TYPE_INCORRECT(self, x)

			if (globalThis.Object.getPrototypeOf(x) !== globalThis.Object.prototype)
				if (!Array.isArray(x) || keyRuntype.tag === "string") return FAILURE.TYPE_INCORRECT(self, x)

			const keys = enumerableKeysOf(x)
			const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
				(results, key) => {
					// We should provide interoperability with `number` and `string` here,
					// as a user would expect JavaScript engines to convert numeric keys to
					// string keys automatically. So, if the key can be interpreted as a
					// decimal number, then test it against a `Number` OR `String` runtype.
					const isNumberLike = isNumberLikeKey(key)
					const keyInterop = isNumberLike ? globalThis.Number(key) : key
					if (
						isNumberLike
							? !keyRuntype.guard(keyInterop) && !keyRuntype.guard(key)
							: !keyRuntype.guard(keyInterop)
					) {
						results[key] = FAILURE.KEY_INCORRECT(self, keyRuntype, keyInterop)
					} else {
						const value = (x as { [key in typeof key]: unknown })[key]
						const runtype =
							valueRuntype.tag === "optional"
								? (valueRuntype as unknown as Optional<Runtype.Core>).underlying
								: valueRuntype
						results[key] = innerValidate(runtype, value)
					}
					return results
				},
				{},
			)

			const details = keys.reduce<{ [key in string | number | symbol]: string | Failure.Details }>(
				(details, key) => {
					const result = results[key]!
					if (!result.success) details[key] = result.details || result.message
					return details
				},
				{},
			)

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x as Static<Record<K, V>>)
		},
		{ tag: "record", key, value },
	)
}

export default Record