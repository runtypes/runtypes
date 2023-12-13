import Static from "./Static.ts"
import { RuntypeBase } from "../Runtype.ts"
import ValidationError from "../result/ValidationError.ts"
import FAILURE from "../utils-internal/FAILURE.ts"

type AsyncContract<A extends readonly RuntypeBase[], R extends RuntypeBase> = {
	enforce(
		f: (
			...args: {
				[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
			} & ArrayLike<unknown>
		) => Promise<Static<R>>,
	): (
		...args: {
			[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
		} & ArrayLike<unknown>
	) => Promise<Static<R>>
}

const AsyncContract: {
	/**
	 * Create a function contract.
	 */
	<A extends readonly RuntypeBase[], R extends RuntypeBase>(
		...runtypes: [...A, R]
	): AsyncContract<A, R>
} = <A extends readonly RuntypeBase[], R extends RuntypeBase>(
	...runtypes: [...A, R]
): AsyncContract<A, R> => {
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
				) => Promise<Static<R>>,
			) =>
			(
				...args: {
					[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
				}
			): Promise<Static<R>> => {
				if (args.length < argRuntypes.length) {
					const message = `Expected ${argRuntypes.length} arguments but only received ${args.length}`
					const failure = FAILURE.ARGUMENT_INCORRECT(message)
					throw new ValidationError(failure)
				}
				for (let i = 0; i < argRuntypes.length; i++) argRuntypes[i]!.check(args[i])
				const returnedPromise = f(...args)
				if (!(returnedPromise instanceof Promise)) {
					const message = `Expected function to return a promise, but instead got ${returnedPromise}`
					const failure = FAILURE.RETURN_INCORRECT(message)
					throw new ValidationError(failure)
				}
				return returnedPromise.then(returnRuntype.check)
			},
	}
}

export default AsyncContract