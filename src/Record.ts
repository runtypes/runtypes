import Literal from "./Literal.ts"
import type Optional from "./Optional.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Symbol from "./Symbol.ts"
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

/**
 * Validates that a value is an object, and properties fulfill the given key and value runtypes.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for `null`, `undefined`, non-objects, non-plain-object non-arrays, and non-plain-object arrays if the key runtype was `String`
 * - `CONTENT_INCORRECT` with `details` reporting the failed properties
 *
 * For each property, contextual failures can be seen in addition to failures of the property runtype:
 *
 * - `PROPERTY_MISSING` for missing required properties
 * - `KEY_INCORRECT` with `detail` reporting the failure of the key runtype
 */
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

const Record = <K extends Runtype.Core<PropertyKey>, V extends Runtype.Core>(key: K, value: V) => {
	const keyRuntype = key
	const valueRuntype = value

	return Runtype.create<Record<K, V>>(
		({ received: x, innerValidate, expected, parsing }) => {
			if (x === null || x === undefined || typeof x !== "object")
				return FAILURE.TYPE_INCORRECT({ expected, received: x })

			if (globalThis.Object.getPrototypeOf(x) !== globalThis.Object.prototype)
				if (!Array.isArray(x) || keyRuntype.tag === "string")
					return FAILURE.TYPE_INCORRECT({ expected, received: x })

			const keys = [...new Set([...extractLiteralKeys(key), ...enumerableKeysOf(x)])]
			const results: globalThis.Record<PropertyKey, Result<unknown>> = {}
			for (const key of keys) {
				const xHasKey = hasEnumerableOwn(key, x)
				if (xHasKey) {
					const testKey = (key: PropertyKey): Failure | undefined => {
						// We should provide interoperability with `number` and `string` here, as a user would expect JavaScript engines to convert numeric keys to string keys automatically. So, if the key can be interpreted as a decimal number, then test it against a `Number` OR `String` runtype.
						if (typeof key === "number" || isNumberLikeKey(key)) {
							const keyInterop = globalThis.Number(key)
							const result = innerValidate({ expected: keyRuntype, received: keyInterop, parsing })
							if (!result.success) {
								const result = innerValidate({ expected: keyRuntype, received: key, parsing })
								if (!result.success) return result
							}
						} else {
							const result = innerValidate({ expected: keyRuntype, received: key, parsing })
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
						defineProperty(
							results,
							key,
							innerValidate({ expected: valueRuntype, received: x[key], parsing }),
						)
					}
				} else {
					defineProperty(
						results,
						key,
						FAILURE.PROPERTY_MISSING({
							expected:
								typeof key === "symbol" ? Symbol(globalThis.Symbol.keyFor(key)) : Literal(key),
						}),
					)
				}
			}

			const details: Failure.Details = {}
			for (const key of keys) {
				const result = results[key]!
				if (!result.success) defineProperty(details, key, result)
			}

			if (enumerableKeysOf(details).length !== 0)
				return FAILURE.CONTENT_INCORRECT({ expected, received: x, details })
			else return SUCCESS(x as Static<Record<K, V>>)
		},
		{ tag: "record", key, value },
	)
}

export default Record