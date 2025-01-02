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

type ObjectStaticReadonly<O extends Object.Fields> = {
	[K in FilterRequiredKeys<O>]: O[K] extends Runtype.Core ? Static<O[K]> : never
} & {
	[K in FilterOptionalKeys<O>]?: O[K] extends Runtype.Core
		? Exclude<Static<O[K]>, undefined>
		: never
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

type ObjectStatic<O extends Object.Fields> = {
	[K in FilterRequiredKeys<O>]: O[K] extends Runtype.Core ? Static<O[K]> : never
} & {
	[K in FilterOptionalKeys<O>]?: O[K] extends Optional<infer OK>
		? Exclude<Static<OK>, undefined>
		: never
} extends infer P
	? { [K in keyof P]: P[K] }
	: never

interface ObjectReadonly<O extends Object.Fields = Object.Fields>
	extends Runtype.Common<ObjectStaticReadonly<O>> {
	tag: "object"
	fields: O
	isExact: boolean
}

interface Object<O extends Object.Fields = Object.Fields> extends Runtype.Common<ObjectStatic<O>> {
	tag: "object"
	fields: O
	isExact: boolean
}

namespace Object {
	// eslint-disable-next-line import/no-named-export
	export type Fields = { [_: string | number | symbol]: Runtype.Core | Optional }

	// eslint-disable-next-line import/no-named-export
	export type Utilities<O extends Object.Fields> = {
		asPartial(): Object.WithUtilities<{
			[K in keyof O]: O[K] extends Optional
				? O[K]
				: O[K] extends Runtype.Core
					? Optional<O[K]>
					: never
		}>
		asReadonly(): ObjectReadonly<O>

		pick<K extends keyof O = never>(...keys: K[]): Object.WithUtilities<Pick<O, K>>
		omit<K extends keyof O = never>(...keys: K[]): Object.WithUtilities<Omit<O, K>>

		extend<P extends Object.Fields>(fields: {
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
		}): Object.WithUtilities<{
			[K in keyof O | keyof P]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never
		}>

		exact(): Object.WithUtilities<O>
	}

	// eslint-disable-next-line import/no-named-export
	export type WithUtilities<O extends Object.Fields> = Object<O> & Utilities<O>
}

const isOptional = (value: Runtype.Core | Optional): value is Optional => value.tag === "optional"

/**
 * Construct an object runtype from runtypes for its values.
 */
const Object = <O extends Object.Fields>(fields: O): Object.WithUtilities<O> => {
	return Runtype.create<Object<O>>(
		(x, innerValidate, self) => {
			if (x === null || x === undefined) return FAILURE.TYPE_INCORRECT(self, x)

			const keysOfFields = enumerableKeysOf(self.fields)
			if (keysOfFields.length !== 0 && typeof x !== "object") return FAILURE.TYPE_INCORRECT(self, x)

			const keys = [...new Set([...keysOfFields, ...enumerableKeysOf(x)])]
			const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
				(results, key) => {
					const fieldsHasKey = hasKey(key, self.fields)
					const xHasKey = hasKey(key, x)
					if (fieldsHasKey) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const runtype = self.fields[key]!
						if (xHasKey) {
							const value = x[key]
							if (isOptional(runtype)) results[key] = innerValidate(runtype.underlying, value)
							else results[key] = innerValidate(runtype, value)
						} else {
							if (isOptional(runtype)) results[key] = SUCCESS(undefined)
							else results[key] = FAILURE.PROPERTY_MISSING(runtype)
						}
					} else if (xHasKey) {
						const value = x[key]
						if (self.isExact) {
							results[key] = FAILURE.PROPERTY_PRESENT(value)
						} else {
							results[key] = SUCCESS(value)
						}
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
		{ tag: "object", fields, isExact: false } as Runtype.Base<Object<O>>,
	).with(
		self =>
			({
				asPartial: () =>
					Object(
						globalThis.Object.fromEntries(
							globalThis.Object.entries(fields).map(([key, value]) => [
								key,
								isOptional(value) ? value : Optional(value),
							]),
						),
					),

				asReadonly: () => Object(fields),

				pick: (...keys: (string | number | symbol)[]) => {
					const cloned = self.clone()
					const result: any = {}
					for (const key of keys) result[key] = fields[key]
					cloned.fields = result
					return cloned
				},

				omit: (...keys: (string | number | symbol)[]) => {
					const result: any = {}
					const existingKeys = enumerableKeysOf(fields)
					for (const key of existingKeys) if (!keys.includes(key)) result[key] = fields[key]
					return Object(result)
				},

				extend: (extension: any) => Object(globalThis.Object.assign({}, fields, extension)),

				exact: () => {
					const cloned = self.clone()
					cloned.isExact = true
					return cloned
				},
			}) as unknown as Object.Utilities<O>,
	)
}

export default Object