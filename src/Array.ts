import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

interface ArrayReadonly<R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<readonly Static<R>[]>,
		Iterable<Spread<ArrayReadonly<R>>> {
	tag: "array"
	element: R
}

interface Array<R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<Static<R>[]>,
		Iterable<Spread<Array<R>>> {
	tag: "array"
	element: R
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
const Array = <R extends Runtype.Core>(element: R) => {
	const base = {
		tag: "array",
		element,
		*[Symbol.iterator]() {
			yield Spread(base as Array<R>)
		},
	} as Runtype.Base<Array<R>>
	return Runtype.create<Array<R>>((x, innerValidate, self) => {
		if (!globalThis.Array.isArray(x)) return FAILURE.TYPE_INCORRECT(self, x)

		const keys = enumerableKeysOf(x).filter(isNumberLikeKey)
		const results: Result<unknown>[] = keys.map(key => innerValidate(element, x[key]))
		const details = keys.reduce<
			globalThis.Record<
				number,
				{ [key: number]: string | Failure.Details } & (string | Failure.Details)
			>
		>((details, key) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = results[key]!
			if (!result.success) details[key] = result.details || result.message
			return details
		}, {})

		if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
		else return SUCCESS(x)
	}, base).with(self => ({ asReadonly: () => self as unknown as ArrayReadonly<R> }))
}

export default Array