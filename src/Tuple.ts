import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import isNumberLikeKey from "./utils-internal/isNumberLikeKey.ts"

type ToReadonlyImpl<A extends readonly unknown[], B extends readonly unknown[]> = A extends [
	infer A0,
	...infer A,
]
	? ToReadonlyImpl<A, readonly [...B, A0]>
	: B
type ToReadonly<A extends readonly unknown[]> = ToReadonlyImpl<A, readonly []>

interface TupleReadonly<R extends readonly Runtype.Core[] = readonly Runtype.Core[]>
	extends Runtype.Common<
		ToReadonly<{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : never }>
	> {
	tag: "tuple"
	components: R
}

interface Tuple<R extends readonly Runtype.Core[] = readonly Runtype.Core[]>
	extends Runtype.Common<{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : never }> {
	tag: "tuple"
	components: R
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
const Tuple = <T extends readonly Runtype.Core[]>(...components: T) =>
	Runtype.create<Tuple<T>>(
		(x, innerValidate, self) => {
			if (!Array.isArray(x)) return FAILURE.TYPE_INCORRECT(self, x)

			if (x.length !== components.length)
				return FAILURE.CONSTRAINT_FAILED(
					self,
					`Expected length ${components.length}, but was ${x.length}`,
				)

			const keys = enumerableKeysOf(x).filter(isNumberLikeKey)
			const results: Result<unknown>[] = keys.map(key => innerValidate(components[key]!, x[key]!))
			const details = keys.reduce<
				globalThis.Record<
					number,
					{ [key: number]: string | Failure.Details } & (string | Failure.Details)
				>
			>((details, key) => {
				const result = results[key]!
				if (!result.success) details[key] = result.details || result.message
				return details
			}, [])

			if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
			else return SUCCESS(x as Static<Tuple<T>>)
		},
		{ tag: "tuple", components },
	).with(self => ({ asReadonly: () => self as unknown as TupleReadonly<T> }))

export default Tuple