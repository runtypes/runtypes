import type Runtype from "../Runtype.ts"
import { type Static } from "../Runtype.ts"
import ValidationError from "../result/ValidationError.ts"
import FAILURE from "../utils-internal/FAILURE.ts"

type Contract<A extends readonly Runtype.Core[], R extends Runtype.Core> = {
	enforce(
		f: (
			...args: {
				[K in keyof A]: A[K] extends Runtype.Core ? Static<A[K]> : unknown
			} & ArrayLike<unknown>
		) => Static<R>,
	): (
		...args: {
			[K in keyof A]: A[K] extends Runtype.Core ? Static<A[K]> : unknown
		} & ArrayLike<unknown>
	) => Static<R>
}

const Contract: {
	/**
	 * Create a function contract.
	 */
	<P extends readonly Runtype.Core[], R extends Runtype.Core>(
		...runtypes: [...P, R]
	): Contract<P, R>
} = <P extends readonly Runtype.Core[], R extends Runtype.Core>(
	...runtypes: [...P, R]
): Contract<P, R> => {
	const lastIndex = runtypes.length - 1
	const argRuntypes = runtypes.slice(0, lastIndex) as unknown as P
	const returnRuntype = runtypes[lastIndex] as R
	return {
		enforce:
			(
				f: (
					...args: {
						[K in keyof P]: P[K] extends Runtype.Core ? Static<P[K]> : unknown
					}
				) => Static<R>,
			) =>
			(
				...args: {
					[K in keyof P]: P[K] extends Runtype.Core ? Static<P[K]> : unknown
				}
			): Static<R> => {
				if (args.length < argRuntypes.length) {
					const message = `Expected ${argRuntypes.length} arguments but only received ${args.length}`
					const failure = FAILURE.ARGUMENT_INCORRECT(message)
					throw new ValidationError(failure)
				}
				for (let i = 0; i < argRuntypes.length; i++) argRuntypes[i]!.check(args[i])
				return returnRuntype.check(f(...args)) as Static<R>
			},
	}
}

export default Contract