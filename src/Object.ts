import Optional from "./Optional.ts"
import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasKey from "./utils-internal/hasKey.ts"

type ObjectStaticType<O extends { [_: string]: RuntypeBase }, RO extends boolean> = RO extends true
	? { readonly [K in keyof O]: Static<O[K]> }
	: { [K in keyof O]: Static<O[K]> }

interface InternalObject<O extends { [_: string]: RuntypeBase }, RO extends boolean>
	extends Runtype<ObjectStaticType<O, RO>> {
	tag: "object"
	fields: O
	isReadonly: RO

	asPartial(): InternalObject<O extends infer P ? { [K in keyof P]?: P[K] } : never, RO>
	asReadonly(): InternalObject<O, true>

	pick<K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Pick<O, K>, RO>
	omit<K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Omit<O, K>, RO>

	extend<P extends { [_: string]: RuntypeBase }>(fields: {
		[K in keyof P]: K extends keyof O
			? Static<P[K]> extends Static<O[K]>
				? P[K]
				: RuntypeBase<Static<O[K]>>
			: P[K]
	}): InternalObject<
		{ [K in keyof (O & P)]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never },
		RO
	>
}

type Object<O extends { [_: string]: RuntypeBase }, RO extends boolean> = InternalObject<O, RO>

/**
 * Construct an object runtype from runtypes for its values.
 */
const InternalObject = <O extends { [_: string]: RuntypeBase }, RO extends boolean>(
	fields: O,
	isReadonly: RO,
): InternalObject<O, RO> => {
	const self = { tag: "object", isReadonly, fields } as any
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
						const isOptional = runtype.reflect.tag === "optional"
						if (xHasKey) {
							const value = x[key as any]
							if (isOptional)
								results[key as any] = innerValidate(runtype.reflect.underlying, value, visited)
							else results[key as any] = innerValidate(runtype, value, visited)
						} else {
							if (isOptional) results[key as any] = SUCCESS(undefined)
							else results[key as any] = FAILURE.PROPERTY_MISSING(runtype.reflect)
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
	InternalObject(fields, false)

const withExtraModifierFuncs = <O extends { [_: string]: RuntypeBase }, RO extends boolean>(
	A: any,
): InternalObject<O, RO> => {
	const asPartial = () =>
		InternalObject(
			globalThis.Object.fromEntries(
				globalThis.Object.entries(A.fields).map(([key, value]) => [
					key,
					Optional(value as RuntypeBase),
				]),
			),
			A.isReadonly,
		)

	const asReadonly = () => InternalObject(A.fields, true)

	const pick = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Pick<O, K>, RO> => {
		const result: any = {}
		keys.forEach(key => {
			result[key] = A.fields[key]
		})
		return InternalObject(result, A.isReadonly)
	}

	const omit = <K extends keyof O>(
		...keys: K[] extends (keyof O)[] ? K[] : never[]
	): InternalObject<Omit<O, K>, RO> => {
		const result: any = {}
		const existingKeys = enumerableKeysOf(A.fields)
		existingKeys.forEach(key => {
			if (!(keys as (string | symbol)[]).includes(key)) result[key] = A.fields[key]
		})
		return InternalObject(result, A.isReadonly) as InternalObject<Omit<O, K>, RO>
	}

	const extend = (fields: any): any =>
		InternalObject(globalThis.Object.assign({}, A.fields, fields), A.isReadonly)

	A.asPartial = asPartial
	A.asReadonly = asReadonly
	A.pick = pick
	A.omit = omit
	A.extend = extend

	return A
}

export default Object