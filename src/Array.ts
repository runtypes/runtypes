import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Reflect from "./utils/Reflect.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"

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
const withExtraModifierFuncs = <E extends RuntypeBase>(A: any): Array<E> => {
	A.asReadonly = () => A
	return A
}

export default Array