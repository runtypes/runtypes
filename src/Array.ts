import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Reflect from "./utils/Reflect.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"

type ArrayStaticType<E extends RuntypeBase, RO extends boolean> = RO extends true
	? ReadonlyArray<Static<E>>
	: Static<E>[]

interface Array<E extends RuntypeBase, RO extends boolean> extends Runtype<ArrayStaticType<E, RO>> {
	tag: "array"
	element: E
	isReadonly: RO

	asReadonly(): Array<E, true>
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
const InternalArray = <E extends RuntypeBase, RO extends boolean>(
	element: E,
	isReadonly: RO,
): Array<E, RO> => {
	const self = { tag: "array", isReadonly, element } as unknown as Reflect
	return withExtraModifierFuncs(
		create((xs, visited) => {
			if (!globalThis.Array.isArray(xs)) return FAILURE.TYPE_INCORRECT(self, xs)

			const keys = enumerableKeysOf(xs)
			const results: Result<unknown>[] = keys.map(key =>
				innerValidate(element, xs[key as any], visited),
			)
			const details = keys.reduce<
				globalThis.Record<
					number,
					{ [key: number]: string | Failure.Details } & (string | Failure.Details)
				>
			>((details, key) => {
				const result = results[key as any]!
				if (!result.success) details[key as any] = result.details || result.message
				return details
			}, {})

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(xs)
		}, self),
	)
}

const Array = <E extends RuntypeBase, RO extends boolean>(element: E): Array<E, false> =>
	InternalArray(element, false)

const withExtraModifierFuncs = <E extends RuntypeBase, RO extends boolean>(
	A: any,
): Array<E, RO> => {
	A.asReadonly = (): Array<E, true> => InternalArray(A.element, true)
	return A
}

export default Array