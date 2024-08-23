import Optional from "./Optional.ts"
import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Static from "./utils/Static.ts"
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

type MergedObject<O extends { [_: string]: RuntypeBase }> = {
	[K in FilterRequiredKeys<O>]: Static<O[K]>
} & {
	[K in FilterOptionalKeys<O>]?: Static<O[K]>
} extends infer P
	? { [K in keyof P]: P[K] }
	: never

type MergedObjectReadonly<O extends { [_: string]: RuntypeBase }> = {
	[K in FilterRequiredKeys<O>]: Static<O[K]>
} & {
	[K in FilterOptionalKeys<O>]?: Static<O[K]>
} extends infer P
	? { readonly [K in keyof P]: P[K] }
	: never

type ObjectStaticType<
	O extends { [_: string]: RuntypeBase },
	Part extends boolean,
	RO extends boolean,
> = Part extends true
	? RO extends true
		? { readonly [K in keyof O]?: Static<O[K]> }
		: { [K in keyof O]?: Static<O[K]> }
	: RO extends true
		? MergedObjectReadonly<O>
		: MergedObject<O>

interface InternalObject<
	O extends { [_: string]: RuntypeBase },
	Part extends boolean,
	RO extends boolean,
> extends Runtype<ObjectStaticType<O, Part, RO>> {
	tag: "object"
	fields: O
	isPartial: Part
	isReadonly: RO

	asPartial(): InternalObject<O, true, RO>
	asReadonly(): InternalObject<O, Part, true>

	pick<K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Pick<O, K>, Part, RO>
	omit<K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Omit<O, K>, Part, RO>

	extend<P extends { [_: string]: RuntypeBase }>(fields: {
		[K in keyof P]: K extends keyof O
			? Static<P[K]> extends Static<O[K]>
				? P[K]
				: RuntypeBase<Static<O[K]>>
			: P[K]
	}): InternalObject<
		{ [K in keyof (O & P)]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never },
		Part,
		RO
	>
}

type Object<O extends { [_: string]: RuntypeBase }, RO extends boolean> = InternalObject<
	O,
	false,
	RO
>

type Partial<O extends { [_: string]: RuntypeBase }, RO extends boolean> = InternalObject<
	O,
	true,
	RO
>

/**
 * Construct an object runtype from runtypes for its values.
 */
const InternalObject = <
	O extends { [_: string]: RuntypeBase },
	Part extends boolean,
	RO extends boolean,
>(
	fields: O,
	isPartial: Part,
	isReadonly: RO,
): InternalObject<O, Part, RO> => {
	const self = { tag: "object", isPartial, isReadonly, fields } as any
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
						const runtype = fields[key as any]!
						const isOptional = isPartial || runtype.reflect.tag === "optional"
						if (xHasKey) {
							const value = x[key as any]
							if (isOptional && value === undefined) results[key as any] = SUCCESS(value)
							else results[key as any] = innerValidate(runtype, value, visited)
						} else {
							if (!isOptional) results[key as any] = FAILURE.PROPERTY_MISSING(runtype.reflect)
							else results[key as any] = SUCCESS(undefined)
						}
					} else if (xHasKey) {
						// TODO: exact object validation
						const value = x[key as any]
						results[key as any] = SUCCESS(value)
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
					const result = results[key as any]!
					if (!result.success) details[key as any] = result.details || result.message
					return details
				},
				{},
			)

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x)
		}, self),
	)
}

const Object = <O extends { [_: string]: RuntypeBase }>(fields: O): Object<O, false> =>
	InternalObject(fields, false, false)

const Partial = <O extends { [_: string]: RuntypeBase }>(fields: O): Partial<O, false> =>
	InternalObject(fields, true, false)

const withExtraModifierFuncs = <
	O extends { [_: string]: RuntypeBase },
	Part extends boolean,
	RO extends boolean,
>(
	A: any,
): InternalObject<O, Part, RO> => {
	const asPartial = () => InternalObject(A.fields, true, A.isReadonly)

	const asReadonly = () => InternalObject(A.fields, A.isPartial, true)

	const pick = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Pick<O, K>, Part, RO> => {
		const result: any = {}
		keys.forEach(key => {
			result[key] = A.fields[key]
		})
		return InternalObject(result, A.isPartial, A.isReadonly)
	}

	const omit = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Omit<O, K>, Part, RO> => {
		const result: any = {}
		const existingKeys = enumerableKeysOf(A.fields)
		existingKeys.forEach(key => {
			if (!(keys as (string | symbol)[]).includes(key)) result[key] = A.fields[key]
		})
		return InternalObject(result, A.isPartial, A.isReadonly) as InternalObject<Omit<O, K>, Part, RO>
	}

	const extend = (fields: any): any =>
		InternalObject(globalThis.Object.assign({}, A.fields, fields), A.isPartial, A.isReadonly)

	A.asPartial = asPartial
	A.asReadonly = asReadonly
	A.pick = pick
	A.omit = omit
	A.extend = extend

	return A
}

export default Object
// eslint-disable-next-line import/no-named-export
export { Partial }