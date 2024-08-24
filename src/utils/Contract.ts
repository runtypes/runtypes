import type Static from "./Static.ts"
import { type RuntypeBase } from "../Runtype.ts"
import ValidationError from "../result/ValidationError.ts"
import FAILURE from "../utils-internal/FAILURE.ts"

type Contract<A extends readonly RuntypeBase[], R extends RuntypeBase> = {
	enforce(
		f: (
			...args: {
				[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
			} & ArrayLike<unknown>
		) => Static<R>,
	): (
		...args: {
			[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
		} & ArrayLike<unknown>
	) => Static<R>
}

const Contract: {
	/**
	 * Create a function contract.
	 */
	<A extends readonly RuntypeBase[], R extends RuntypeBase>(...runtypes: [...A, R]): Contract<A, R>
} = <A extends readonly RuntypeBase[], R extends RuntypeBase>(
	...runtypes: [...A, R]
): Contract<A, R> => {
	const lastIndex = runtypes.length - 1
	const argRuntypes = runtypes.slice(0, lastIndex) as unknown as A
	const returnRuntype = runtypes[lastIndex] as R
	return {
		enforce:
			(
				f: (
					...args: {
						[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
					}
				) => Static<R>,
			) =>
			(
				...args: {
					[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
				}
			): Static<R> => {
				if (args.length < argRuntypes.length) {
					const message = `Expected ${argRuntypes.length} arguments but only received ${args.length}`
					const failure = FAILURE.ARGUMENT_INCORRECT(message)
					throw new ValidationError(failure)
				}
				for (let i = 0; i < argRuntypes.length; i++) argRuntypes[i]!.check(args[i])
				return returnRuntype.check(f(...args))
			},
	}
}

export default Contract