import Literal from "./Literal.ts"
import type Optional from "./Optional.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineProperty from "./utils-internal/defineProperty.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasEnumerableOwn from "./utils-internal/hasEnumerableOwn.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"
import show from "./utils-internal/show.ts"
import unwrapTrivial from "./utils-internal/unwrapTrivial.ts"

type RecordStatic<
	K extends Runtype.Core<PropertyKey> = Runtype.Core<PropertyKey>,
	V extends Runtype.Core = Runtype.Core,
> = V extends Optional ? { [_ in Static<K>]?: Static<V> } : { [_ in Static<K>]: Static<V> }

type RecordParsed<
	K extends Runtype.Core<PropertyKey> = Runtype.Core<PropertyKey>,
	V extends Runtype.Core = Runtype.Core,
> = V extends Optional ? { [_ in Parsed<K>]?: Parsed<V> } : { [_ in Parsed<K>]: Parsed<V> }

interface Record<
	K extends Runtype.Core<PropertyKey> = Runtype.Core<PropertyKey>,
	V extends Runtype.Core = Runtype.Core,
> extends Runtype<RecordStatic<K, V>, RecordParsed<K, V>> {
	tag: "record"
	key: K
	value: V
}

const extractLiteralKeys = (runtype: Runtype.Core<PropertyKey>) => {
	const literalKeys: PropertyKey[] = []
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
const Record = <K extends Runtype.Core<PropertyKey>, V extends Runtype.Core>(key: K, value: V) => {
	const keyRuntype = key
	const valueRuntype = value

	return Runtype.create<Record<K, V>>(
		({ value: x, innerValidate, self, parsing }) => {
			if (x === null || x === undefined || typeof x !== "object")
				return FAILURE.TYPE_INCORRECT({ expected: self, received: x })

			if (globalThis.Object.getPrototypeOf(x) !== globalThis.Object.prototype)
				if (!Array.isArray(x) || keyRuntype.tag === "string")
					return FAILURE.TYPE_INCORRECT({ expected: self, received: x })

			const keys = [...new Set([...extractLiteralKeys(key), ...enumerableKeysOf(x)])]
			const results: globalThis.Record<PropertyKey, Result<unknown>> = {}
			for (const key of keys) {
				const xHasKey = hasEnumerableOwn(key, x)
				if (xHasKey) {
					const testKey = (key: PropertyKey): Failure | undefined => {
						// We should provide interoperability with `number` and `string` here, as a user would expect JavaScript engines to convert numeric keys to string keys automatically. So, if the key can be interpreted as a decimal number, then test it against a `Number` OR `String` runtype.
						if (typeof key === "number" || isNumberLikeKey(key)) {
							const keyInterop = globalThis.Number(key)
							const result = innerValidate(keyRuntype, keyInterop, parsing)
							if (!result.success) {
								const result = innerValidate(keyRuntype, key, parsing)
								if (!result.success) return result
							}
						} else {
							const result = innerValidate(keyRuntype, key, parsing)
							if (!result.success) return result
						}
						return undefined
					}

					const failure = testKey(key)
					if (failure) {
						defineProperty(
							results,
							key,
							FAILURE.KEY_INCORRECT({
								expected: keyRuntype,
								received: key,
								detail: failure,
							}),
						)
					} else {
						defineProperty(results, key, innerValidate(valueRuntype, x[key], parsing))
					}
				} else {
					// TODO: symbols
					defineProperty(results, key, FAILURE.PROPERTY_MISSING({ expected: Literal(key as any) }))
				}
			}

			const details: Failure.Details = {}
			for (const key of keys) {
				const result = results[key]!
				if (!result.success) defineProperty(details, key, result)
			}

			if (enumerableKeysOf(details).length !== 0)
				return FAILURE.CONTENT_INCORRECT({ expected: self, received: x, details })
			else return SUCCESS(x as Static<Record<K, V>>)
		},
		{ tag: "record", key, value },
	)
}

export default Record