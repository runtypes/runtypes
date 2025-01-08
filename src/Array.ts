import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import type Success from "./result/Success.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

interface ArrayReadonly<R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<readonly Static<R>[], readonly Parsed<R>[]>,
		Iterable<Spread<ArrayReadonly<R>>> {
	tag: "array"
	element: R
}

interface Array<R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<Static<R>[], Parsed<R>[]>,
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
	} as Runtype.Base<Array<R>>
	return Runtype.create<Array<R>>(({ value, innerValidate, self, parsing }) => {
		if (!globalThis.Array.isArray(value))
			return FAILURE.TYPE_INCORRECT({ expected: self, received: value })

		const keys = enumerableKeysOf(value).filter(isNumberLikeKey)
		const results: Result<unknown>[] = keys.map(key => innerValidate(element, value[key], parsing))
		const details: globalThis.Record<number, Failure> = {}
		for (const key of keys) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = results[key]!
			if (!result.success) details[key] = result
		}

		if (enumerableKeysOf(details).length !== 0)
			return FAILURE.CONTENT_INCORRECT({ expected: self, received: value, details })
		else return SUCCESS(parsing ? (results as Success<any>[]).map(result => result.value) : value)
	}, Spread.asSpreadable(base)).with(self => ({
		asReadonly: () => self as unknown as ArrayReadonly<R>,
	}))
}

export default Array