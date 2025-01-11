import InstanceOf from "../InstanceOf.ts"
import type Runtype from "../Runtype.ts"
import { type Static, type Parsed } from "../Runtype.ts"
import ValidationError from "../result/ValidationError.ts"
import FAILURE from "../utils-internal/FAILURE.ts"

type Options = {
	receives?: Runtype.Core<readonly unknown[]> | undefined
	returns?: Runtype.Core | undefined
}

type AsyncFunction = (...args: readonly any[]) => Promise<any>

type EnforcedParametersStatic<
	O extends Options,
	F extends AsyncFunction,
> = O["receives"] extends Runtype.Core ? Static<O["receives"]> : Parameters<F>

type EnforcedReturnTypeStatic<
	O extends Options,
	F extends AsyncFunction,
> = O["returns"] extends Runtype.Core ? Static<O["returns"]> : Awaited<ReturnType<F>>

type EnforcedParametersParsed<
	O extends Options,
	F extends AsyncFunction,
> = O["receives"] extends Runtype.Core ? Parsed<O["receives"]> : Parameters<F>

type EnforcedReturnTypeParsed<
	O extends Options,
	F extends AsyncFunction,
> = O["returns"] extends Runtype.Core
	? Parsed<O["returns"]> & Awaited<ReturnType<F>>
	: Awaited<ReturnType<F>>

type AsyncContract<O extends Options> = O & {
	enforce: <
		F extends (...args: EnforcedParametersParsed<O, F>) => Promise<EnforcedReturnTypeStatic<O, F>>,
	>(
		f: F,
	) => (...args: EnforcedParametersStatic<O, F>) => Promise<EnforcedReturnTypeParsed<O, F>>
}

const parseReceived = <O extends Options, F extends AsyncFunction>(
	received: readonly unknown[],
	receives: (O["receives"] & Runtype) | undefined,
): EnforcedParametersParsed<O, F> => {
	if (!receives) return received as EnforcedParametersParsed<O, F>
	try {
		return receives.parse(received) as EnforcedParametersParsed<O, F>
	} catch (error) {
		if (error instanceof ValidationError) {
			const failure = FAILURE.ARGUMENTS_INCORRECT({
				expected: receives,
				received,
				detail: error.failure,
			})
			throw new ValidationError(failure)
		} else throw error
	}
}

const InstanceOfPromise: InstanceOf<Promise<unknown>> = InstanceOf(Promise)

const parseReturned = async <O extends Options, F extends AsyncFunction>(
	returned: unknown,
	returns: (O["returns"] & Runtype) | undefined,
): Promise<EnforcedReturnTypeParsed<O, F>> => {
	try {
		InstanceOfPromise.assert(returned)
	} catch (error) {
		if (error instanceof ValidationError) {
			const failure = FAILURE.RETURN_INCORRECT({
				expected: InstanceOfPromise,
				received: returned,
				detail: error.failure,
			})
			throw new ValidationError(failure)
		}
	}
	const awaited = await returned
	if (!returns) return awaited as EnforcedReturnTypeParsed<O, F>
	try {
		return returns.parse(awaited) as EnforcedReturnTypeParsed<O, F>
	} catch (error) {
		if (error instanceof ValidationError) {
			const failure = FAILURE.RESOLVE_INCORRECT({
				expected: returns,
				received: awaited,
				detail: error.failure,
			})
			throw new ValidationError(failure)
		} else throw error
	}
}

/**
 * Creates an async function contract.
 */
const AsyncContract = <O extends Options>({ receives, returns }: O): AsyncContract<O> => {
	return {
		receives,
		returns,
		enforce:
			f =>
			async (...args) =>
				await parseReturned(
					f(...(parseReceived(args, receives as Runtype) as any)),
					returns as Runtype,
				),
	} as AsyncContract<O>
}

export default AsyncContract