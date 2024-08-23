import Optional from "./Optional.ts"
import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasKey from "./utils-internal/hasKey.ts"

interface Object<O extends { [_: string | number | symbol]: RuntypeBase }>
	extends Runtype<{ [K in keyof O]: Static<O[K]> }> {
	tag: "object"
	fields: O

	asPartial(): Object<O extends infer O ? { [K in keyof O]?: O[K] } : never>
	asReadonly(): Object<{ readonly [K in keyof O]: O[K] }>

	pick<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): Object<Pick<O, K>>
	omit<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): Object<Omit<O, K>>

	extend<P extends { [_: string | number | symbol]: RuntypeBase }>(fields: {
		[K in keyof P]: K extends keyof O
			? Static<P[K]> extends Static<O[K]>
				? P[K]
				: RuntypeBase<Static<O[K]>>
			: P[K]
	}): Object<{ [K in keyof (O & P)]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never }>
}

/**
 * Construct an object runtype from runtypes for its values.
 */

const Object = <O extends { [_: string | number | symbol]: RuntypeBase }>(fields: O): Object<O> => {
	const self = { tag: "object", fields } as any
	return withExtraModifierFuncs(
		create((x, visited) => {
			if (x === null || x === undefined) {
				return FAILURE.TYPE_INCORRECT(self, x)
			}

			const keysOfFields = enumerableKeysOf(fields)
			if (keysOfFields.length !== 0 && typeof x !== "object") return FAILURE.TYPE_INCORRECT(self, x)

			const keys = [...new Set([...keysOfFields, ...enumerableKeysOf(x)])]
			const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
				(results, key) => {
					const fieldsHasKey = hasKey(key, fields)
					const xHasKey = hasKey(key, x)
					if (fieldsHasKey) {
						const runtype = fields[key]!
						const isOptional = runtype.reflect.tag === "optional"
						if (xHasKey) {
							const value = x[key]
							if (isOptional)
								results[key] = innerValidate(runtype.reflect.underlying, value, visited)
							else results[key] = innerValidate(runtype, value, visited)
						} else {
							if (isOptional) results[key] = SUCCESS(undefined)
							else results[key] = FAILURE.PROPERTY_MISSING(runtype.reflect)
						}
					} else if (xHasKey) {
						// TODO: exact object validation
						const value = x[key]
						results[key] = SUCCESS(value)
					} else {
						/* istanbul ignore next */
						throw new Error("impossible")
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
			else return SUCCESS(x)
		}, self),
	)
}

const withExtraModifierFuncs = <O extends { [_: string | number | symbol]: RuntypeBase }>(
	A: any,
): Object<O> => {
	const asPartial = () =>
		Object(
			globalThis.Object.fromEntries(
				globalThis.Object.entries(A.fields).map(([key, value]) => [
					key,
					Optional(value as RuntypeBase),
				]),
			),
		)

	const asReadonly = () => Object(A.fields)

	const pick = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): Object<Pick<O, K>> => {
		const result: any = {}
		keys.forEach(key => {
			result[key] = A.fields[key]
		})
		return Object(result)
	}

	const omit = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): Object<Omit<O, K>> => {
		const result: any = {}
		const existingKeys = enumerableKeysOf(A.fields)
		existingKeys.forEach(key => {
			if (!(keys as (string | symbol)[]).includes(key)) result[key] = A.fields[key]
		})
		return Object(result) as Object<Omit<O, K>>
	}

	const extend = (fields: any): any => Object(globalThis.Object.assign({}, A.fields, fields))

	A.asPartial = asPartial
	A.asReadonly = asReadonly
	A.pick = pick
	A.omit = omit
	A.extend = extend

	return A
}

export default Object