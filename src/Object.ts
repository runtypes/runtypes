import Optional from "./Optional.ts"
import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasKey from "./utils-internal/hasKey.ts"

type FilterOptionalKeys<T> = {
	[K in keyof T]: T[K] extends Optional ? K : never
}[keyof T]

type FilterRequiredKeys<T> = {
	[K in keyof T]: T[K] extends Optional ? never : K
}[keyof T]

type ObjectStaticReadonly<O extends { [_: string | number | symbol]: Runtype.Core | Optional }> = {
	[K in FilterRequiredKeys<O>]: O[K] extends Runtype.Core ? Static<O[K]> : never
} & {
	[K in FilterOptionalKeys<O>]?: O[K] extends Runtype.Core
		? Exclude<Static<O[K]>, undefined>
		: never
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

type ObjectStatic<O extends { [_: string | number | symbol]: Runtype.Core | Optional }> = {
	[K in FilterRequiredKeys<O>]: O[K] extends Runtype.Core ? Static<O[K]> : never
} & {
	[K in FilterOptionalKeys<O>]?: O[K] extends Optional<infer OK>
		? Exclude<Static<OK>, undefined>
		: never
} extends infer P
	? { [K in keyof P]: P[K] }
	: never

interface ObjectReadonly<
	O extends { [_: string | number | symbol]: Runtype.Core | Optional } = {
		[_: string | number | symbol]: Runtype.Core | Optional
	},
> extends Runtype.Common<ObjectStaticReadonly<O>> {
	tag: "object"
	fields: O
}

interface Object<
	O extends { [_: string | number | symbol]: Runtype.Core | Optional } = {
		[_: string | number | symbol]: Runtype.Core | Optional
	},
> extends Runtype.Common<ObjectStatic<O>> {
	tag: "object"
	fields: O
}

const isOptional = (value: Runtype.Core | Optional): value is Optional => value.tag === "optional"

/**
 * Construct an object runtype from runtypes for its values.
 */

const Object = <O extends { [_: string | number | symbol]: Runtype.Core | Optional }>(fields: O) =>
	Runtype.create<Object<O>>(
		(x, innerValidate, self) => {
			if (x === null || x === undefined) return FAILURE.TYPE_INCORRECT(self, x)

			const keysOfFields = enumerableKeysOf(fields)
			if (keysOfFields.length !== 0 && typeof x !== "object") return FAILURE.TYPE_INCORRECT(self, x)

			const keys = [...new Set([...keysOfFields, ...enumerableKeysOf(x)])]
			const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
				(results, key) => {
					const fieldsHasKey = hasKey(key, fields)
					const xHasKey = hasKey(key, x)
					if (fieldsHasKey) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const runtype = fields[key]!
						if (xHasKey) {
							const value = x[key]
							if (isOptional(runtype)) results[key] = innerValidate(runtype.underlying, value)
							else results[key] = innerValidate(runtype, value)
						} else {
							if (isOptional(runtype)) results[key] = SUCCESS(undefined)
							else results[key] = FAILURE.PROPERTY_MISSING(runtype)
						}
					} else if (xHasKey) {
						// TODO: exact object validation
						const value = x[key]
						results[key] = SUCCESS(value)
					} else {
						throw new Error("impossible")
					}
					return results
				},
				{},
			)

			const details = keys.reduce<{
				[key in string | number | symbol]: string | Failure.Details
			}>((details, key) => {
				const result = results[key]!
				if (!result.success) details[key] = result.details || result.message
				return details
			}, {})

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x as ObjectStatic<O>)
		},
		{ tag: "object", fields },
	).with({
		asPartial: () =>
			Object(
				globalThis.Object.fromEntries(
					globalThis.Object.entries(fields).map(([key, value]) => [
						key,
						Optional(value as Runtype.Core),
					]),
				),
			),

		asReadonly: () => Object(fields),

		pick: <K extends keyof O>(
			...keys: K[] extends (keyof O)[] ? K[] : never[]
		): Object<Pick<O, K>> => {
			const result: any = {}
			keys.forEach(key => {
				result[key] = fields[key]
			})
			return Object(result)
		},

		omit: <K extends keyof O>(
			...keys: K[] extends (keyof O)[] ? K[] : never[]
		): Object<Omit<O, K>> => {
			const result: any = {}
			const existingKeys = enumerableKeysOf(fields)
			existingKeys.forEach(key => {
				if (!(keys as (string | symbol)[]).includes(key)) result[key] = fields[key]
			})
			return Object(result) as Object<Omit<O, K>>
		},

		extend: (extension: any): any => Object(globalThis.Object.assign({}, fields, extension)),
	} as unknown as {
		asPartial(): Object<{
			[K in keyof O]: O[K] extends Optional
				? O[K]
				: O[K] extends Runtype.Core
					? Optional<O[K]>
					: never
		}>
		asReadonly(): ObjectReadonly<O>

		pick<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): Object<Pick<O, K>>
		omit<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): Object<Omit<O, K>>

		extend<P extends { [_: string | number | symbol]: Runtype.Core | Optional }>(fields: {
			[K in keyof P]: K extends keyof O
				? O[K] extends Optional<infer OK>
					? P[K] extends Optional<infer PK>
						? Static<PK> extends Static<OK>
							? P[K]
							: Runtype.Core<Static<OK>> | Optional<Runtype.Core<Static<OK>>>
						: P[K] extends Runtype.Core
							? P[K] extends OK
								? P[K]
								: Runtype.Core<Static<OK>> | Optional<Runtype.Core<Static<OK>>>
							: never
					: O[K] extends Runtype.Core
						? P[K] extends Optional
							? Runtype.Core<Static<O[K]>>
							: P[K] extends Runtype.Core
								? Static<P[K]> extends Static<O[K]>
									? P[K]
									: Runtype.Core<Static<O[K]>>
								: never
						: never
				: P[K]
		}): Object<{
			[K in keyof (O & P)]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never
		}>
	})

export default Object