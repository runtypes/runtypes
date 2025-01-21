import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import type Success from "./result/Success.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineIntrinsics from "./utils-internal/defineIntrinsics.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

interface Array<R extends Runtype.Core = Runtype.Core>
	extends Runtype<Static<R>[], Parsed<R>[]>,
		Iterable<Spread<Array<R>>> {
	tag: "array"
	element: R
}

namespace Array {
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export interface Readonly<R extends Runtype.Core = Runtype.Core>
		extends Runtype<readonly Static<R>[], readonly Parsed<R>[]>,
			Iterable<Spread<Readonly<R>>> {
		tag: "array"
		element: R
	}
}

/**
 * Constructs an array runtype from a runtype for its elements.
 */
const Array = <R extends Runtype.Core>(element: R) => {
	const base = {
		tag: "array",
		element,
	} as Runtype.Base<Array<R>>
	return Runtype.create<Array<R>>(({ received, innerValidate, expected, parsing }) => {
		if (!globalThis.Array.isArray(received)) return FAILURE.TYPE_INCORRECT({ expected, received })

		const keys = enumerableKeysOf(received).filter(isNumberLikeKey)
		const results: Result<unknown>[] = keys.map(key =>
			innerValidate({ expected: element, received: received[key], parsing }),
		)
		const details: globalThis.Record<number, Failure> = {}
		for (const key of keys) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = results[key]!
			if (!result.success) details[key] = result
		}

		if (enumerableKeysOf(details).length !== 0)
			return FAILURE.CONTENT_INCORRECT({ expected, received, details })
		else
			return SUCCESS(parsing ? (results as Success<any>[]).map(result => result.value) : received)
	}, Spread.asSpreadable(base)).with(self =>
		defineIntrinsics({}, { asReadonly: () => self as unknown as Array.Readonly<R> }),
	)
}

export default Array