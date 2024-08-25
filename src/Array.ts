import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

interface ArrayReadonly<E extends RuntypeBase> extends Runtype<readonly Static<E>[]> {
	tag: "array"
	element: E
}

interface Array<E extends RuntypeBase> extends Runtype<Static<E>[]> {
	tag: "array"
	element: E

	asReadonly(): ArrayReadonly<E>
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
const Array = <E extends RuntypeBase>(element: E): Array<E> => {
	const self = { tag: "array", element } as unknown as Reflect
	return withExtraModifierFuncs(
		create((x, innerValidate) => {
			if (!globalThis.Array.isArray(x)) return FAILURE.TYPE_INCORRECT(self, x)

			const keys = enumerableKeysOf(x).filter(isNumberLikeKey)
			const results: Result<unknown>[] = keys.map(key => innerValidate(element, x[key]))
			const details = keys.reduce<
				globalThis.Record<
					number,
					{ [key: number]: string | Failure.Details } & (string | Failure.Details)
				>
			>((details, key) => {
				const result = results[key]!
				if (!result.success) details[key] = result.details || result.message
				return details
			}, {})

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x)
		}, self),
	)
}
const withExtraModifierFuncs = <E extends RuntypeBase>(A: any): Array<E> => {
	A.asReadonly = () => A
	return A
}

export default Array