import Never from "./Never.ts"
import Optional from "./Optional.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineIntrinsics from "./utils-internal/defineIntrinsics.ts"
import defineProperty from "./utils-internal/defineProperty.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasEnumerableOwn from "./utils-internal/hasEnumerableOwn.ts"

type OptionalKeysStatic<T> = {
	[K in keyof T]: T[K] extends Optional ? K : never
}[keyof T]

type RequiredKeysStatic<T> = {
	[K in keyof T]: T[K] extends Optional ? never : K
}[keyof T]

type OptionalKeysParsed<T> = {
	[K in keyof T]: T[K] extends Optional<any, infer X> ? ([X] extends [never] ? K : never) : never
}[keyof T]

type RequiredKeysParsed<T> = {
	[K in keyof T]: T[K] extends Optional<any, infer X> ? ([X] extends [never] ? never : K) : K
}[keyof T]

type RequiredValuesStatic<T> = T extends Runtype.Core ? Static<T> : never

type OptionalValuesStatic<T> = T extends Optional<infer OK> ? Static<OK> : never

type RequiredValuesParsed<T> =
	T extends Optional<infer OK, infer X>
		? [X] extends [never]
			? never
			: Parsed<OK> | X
		: T extends Runtype.Core
			? Parsed<T>
			: never

type OptionalValuesParsed<T> =
	T extends Optional<infer OK, infer X> ? ([X] extends [never] ? Parsed<OK> : never) : never

type ObjectStaticReadonly<O extends Object.Fields> = {
	[K in RequiredKeysStatic<O>]: RequiredValuesStatic<O[K]>
} & {
	[K in OptionalKeysStatic<O>]?: OptionalValuesStatic<O[K]>
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

type ObjectStatic<O extends Object.Fields> = {
	[K in RequiredKeysStatic<O>]: RequiredValuesStatic<O[K]>
} & {
	[K in OptionalKeysStatic<O>]?: OptionalValuesStatic<O[K]>
} extends infer P
	? { [K in keyof P]: P[K] }
	: never

type ObjectParsedReadonly<O extends Object.Fields> = {
	[K in RequiredKeysParsed<O>]: RequiredValuesParsed<O[K]>
} & {
	[K in OptionalKeysParsed<O>]?: OptionalValuesParsed<O[K]>
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

type ObjectParsed<O extends Object.Fields> = {
	[K in RequiredKeysParsed<O>]: RequiredValuesParsed<O[K]>
} & {
	[K in OptionalKeysParsed<O>]?: OptionalValuesParsed<O[K]>
} extends infer P
	? { [K in keyof P]: P[K] }
	: never

interface Object<O extends Object.Fields = Object.Fields>
	extends Runtype<ObjectStatic<O>, ObjectParsed<O>> {
	tag: "object"
	fields: O
	isExact: boolean
}

namespace Object {
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Fields = globalThis.Record<PropertyKey, Runtype.Core | Optional>

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export interface Readonly<O extends Object.Fields = Object.Fields>
		extends Runtype<ObjectStaticReadonly<O>, ObjectParsedReadonly<O>> {
		tag: "object"
		fields: O
		isExact: boolean
	}

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Utilities<O extends Object.Fields> = {
		asPartial(): Object.WithUtilities<{
			[K in keyof O]: O[K] extends Optional
				? O[K]
				: O[K] extends Runtype.Core
					? Optional<O[K]>
					: never
		}>
		asReadonly(): Object.Readonly<O>

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

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type WithUtilities<O extends Object.Fields> = Object<O> & Utilities<O>
}

const isOptional = (value: Runtype.Core | Optional): value is Optional => value.tag === "optional"

/**
 * Construct an object runtype from runtypes for its values.
 */
const Object = <O extends Object.Fields>(fields: O): Object.WithUtilities<O> => {
	return Runtype.create<Object<O>>(
		({ value: x, innerValidate, self, parsing }) => {
			if (x === null || x === undefined)
				return FAILURE.TYPE_INCORRECT({ expected: self, received: x })

			const keysOfFields = enumerableKeysOf(self.fields)
			if (keysOfFields.length !== 0 && typeof x !== "object")
				return FAILURE.TYPE_INCORRECT({ expected: self, received: x })

			const keys = [...new Set([...keysOfFields, ...enumerableKeysOf(x)])]
			const results: globalThis.Record<PropertyKey, Result<unknown>> = {}
			const parsed: any = {}
			for (const key of keys) {
				const fieldsHasKey = hasEnumerableOwn(key, self.fields)
				const xHasKey = hasEnumerableOwn(key, x)
				if (fieldsHasKey) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const runtype = self.fields[key]!
					if (xHasKey) {
						const value = x[key]
						if (isOptional(runtype)) {
							defineProperty(results, key, innerValidate(runtype.underlying, value, parsing))
						} else {
							defineProperty(results, key, innerValidate(runtype, value, parsing))
						}
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						if (results[key]!.success) defineProperty(parsed, key, results[key]!.value)
					} else {
						if (isOptional(runtype)) {
							if ("defaultValue" in runtype) {
								defineProperty(results, key, SUCCESS(runtype.defaultValue))
								defineProperty(parsed, key, runtype.defaultValue)
							} else {
								defineProperty(results, key, SUCCESS(undefined))
							}
						} else {
							defineProperty(results, key, FAILURE.PROPERTY_MISSING({ expected: runtype }))
						}
					}
				} else if (xHasKey) {
					const value = x[key]
					if (self.isExact) {
						defineProperty(
							results,
							key,
							FAILURE.PROPERTY_PRESENT({ expected: Never, received: value }),
						)
					} else {
						defineProperty(results, key, SUCCESS(value))
					}
				} else {
					throw new Error("impossible")
				}
			}

			const details: Failure.Details = {}
			for (const key of keys) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const result = results[key]!
				if (!result.success) defineProperty(details, key, result)
			}

			if (enumerableKeysOf(details).length !== 0)
				return FAILURE.CONTENT_INCORRECT({ expected: self, received: x, details })
			else return SUCCESS(parsing ? (parsed as ObjectParsed<O>) : (x as ObjectStatic<O>))
		},
		{ tag: "object", fields, isExact: false } as Runtype.Base<Object<O>>,
	).with(
		self =>
			defineIntrinsics(
				{},
				{
					asPartial: () =>
						Object(
							globalThis.Object.fromEntries(
								globalThis.Object.entries(self.fields).map(([key, value]) => [
									key,
									isOptional(value) ? value : Optional(value),
								]),
							),
						),

					asReadonly: () => Object(self.fields),

					pick: (...keys: PropertyKey[]) => {
						const cloned = self.clone()
						const result: any = {}
						for (const key of keys) defineProperty(result, key, self.fields[key])
						cloned.fields = result
						return cloned
					},

					omit: (...keys: PropertyKey[]) => {
						const result: any = {}
						const existingKeys = enumerableKeysOf(self.fields)
						for (const key of existingKeys)
							if (!keys.includes(key)) defineProperty(result, key, self.fields[key])
						return Object(result)
					},

					extend: (extension: any) => Object(globalThis.Object.assign({}, self.fields, extension)),

					exact: () => {
						const cloned = self.clone()
						cloned.isExact = true
						return cloned
					},
				},
			) as unknown as Object.Utilities<O>,
	)
}

export default Object