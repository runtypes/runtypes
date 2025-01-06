import type Optional from "./Optional.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasKey from "./utils-internal/hasKey.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"
import show from "./utils-internal/show.ts"
import unwrapTrivial from "./utils-internal/unwrapTrivial.ts"

type RecordKeyStatic = string | number | symbol

type RecordKeyRuntype = Runtype.Core<RecordKeyStatic>

type RecordStatic<
	K extends RecordKeyRuntype = RecordKeyRuntype,
	V extends Runtype.Core = Runtype.Core,
> = V extends Optional ? { [_ in Static<K>]?: Static<V> } : { [_ in Static<K>]: Static<V> }

type RecordParsed<
	K extends RecordKeyRuntype = RecordKeyRuntype,
	V extends Runtype.Core = Runtype.Core,
> = V extends Optional ? { [_ in Parsed<K>]?: Parsed<V> } : { [_ in Parsed<K>]: Parsed<V> }

interface Record<
	K extends RecordKeyRuntype = RecordKeyRuntype,
	V extends Runtype.Core = Runtype.Core,
> extends Runtype.Common<RecordStatic<K, V>, RecordParsed<K, V>> {
	tag: "record"
	key: K
	value: V
}

const extractLiteralKeys = (runtype: RecordKeyRuntype) => {
	const literalKeys: RecordKeyStatic[] = []
	const inner = unwrapTrivial(runtype as Runtype)
	switch (inner.tag) {
		case "union": {
			for (const alternative of inner.alternatives) {
				const inner = unwrapTrivial(alternative as Runtype)
				switch (inner.tag) {
					case "literal": {
						switch (typeof inner.value) {
							case "string":
							case "number":
							case "symbol":
								literalKeys.push(inner.value)
						}
						break
					}
					case "string":
					case "number":
					case "symbol":
						break
					default:
						throw new Error(`Unsupported runtype for \`Record\` keys: ${show(inner)}`)
				}
			}
		}
	}
	return literalKeys
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
		(x, innerValidate, self, parsing) => {
			if (x === null || x === undefined || typeof x !== "object")
				return FAILURE.TYPE_INCORRECT(self, x)

			if (globalThis.Object.getPrototypeOf(x) !== globalThis.Object.prototype)
				if (!Array.isArray(x) || keyRuntype.tag === "string") return FAILURE.TYPE_INCORRECT(self, x)

			const keys = [...new Set([...extractLiteralKeys(key), ...enumerableKeysOf(x)])]
			const results: { [key in RecordKeyStatic]: Result<unknown> } = {}
			for (const key of keys) {
				const xHasKey = hasKey(key, x)
				if (xHasKey) {
					// We should provide interoperability with `number` and `string` here, as a user would expect JavaScript engines to convert numeric keys to string keys automatically. So, if the key can be interpreted as a decimal number, then test it against a `Number` OR `String` runtype.
					const isNumberLike = typeof key === "number" || isNumberLikeKey(key)
					const keyInterop = isNumberLike ? globalThis.Number(key) : key
					if (
						isNumberLike
							? !keyRuntype.guard(keyInterop) && !keyRuntype.guard(key)
							: !keyRuntype.guard(keyInterop)
					) {
						results[key] = FAILURE.KEY_INCORRECT(self, keyRuntype, keyInterop)
					} else {
						results[key] = innerValidate(valueRuntype, x[key], parsing)
					}
				} else {
					results[key] = FAILURE.PROPERTY_MISSING(value)
				}
			}

			const details: Failure.Details = {}
			for (const key of keys) {
				const result = results[key]!
				if (!result.success) details[key] = result
			}

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x as Static<Record<K, V>>)
		},
		{ tag: "record", key, value },
	)
}

export default Record