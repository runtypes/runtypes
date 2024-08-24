import Optional from "./Optional.ts"
import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create, innerValidate } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasKey from "./utils-internal/hasKey.ts"

type FilterOptionalKeys<T> = {
	[K in keyof T]: T[K] extends Optional<any> ? K : never
}[keyof T]
type FilterRequiredKeys<T> = {
	[K in keyof T]: T[K] extends Optional<any> ? never : K
}[keyof T]
type ObjectStatic<O extends { [_: string | number | symbol]: RuntypeBase }> = {
	[K in FilterRequiredKeys<O>]: Static<O[K]>
} & {
	[K in FilterOptionalKeys<O>]?: Exclude<Static<O[K]>, undefined>
} extends infer P
	? { [K in keyof P]: P[K] }
	: never
type ObjectStaticReadonly<O extends { [_: string | number | symbol]: RuntypeBase }> = {
	[K in FilterRequiredKeys<O>]: Static<O[K]>
} & {
	[K in FilterOptionalKeys<O>]?: Exclude<Static<O[K]>, undefined>
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

interface ObjectReadonly<O extends { [_: string | number | symbol]: RuntypeBase }>
	extends Runtype<ObjectStaticReadonly<O>> {
	tag: "object"
	fields: O

	asPartial(): ObjectReadonly<{
		[K in keyof O]: O[K] extends Optional<any> ? O[K] : Optional<O[K]>
	}>

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

interface Object<O extends { [_: string | number | symbol]: RuntypeBase }>
	extends Runtype<ObjectStatic<O>> {
	tag: "object"
	fields: O

	asPartial(): Object<{ [K in keyof O]: O[K] extends Optional<any> ? O[K] : Optional<O[K]> }>
	asReadonly(): ObjectReadonly<O>

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