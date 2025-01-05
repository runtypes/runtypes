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
	receives: O["receives"],
): EnforcedParametersParsed<O, F> => {
	return (receives ? receives.parse(received) : received) as EnforcedParametersParsed<O, F>
}

const parseReturned = async <O extends Options, F extends AsyncFunction>(
	returned: Promise<unknown>,
	returns: O["returns"],
): Promise<EnforcedReturnTypeParsed<O, F>> => {
	if (!(returned instanceof Promise)) {
		const message = `Expected function to return a promise, but instead got ${returned}`
		const failure = FAILURE.RETURN_INCORRECT(message)
		throw new ValidationError(failure)
	}
	const awaited = await returned
	return (returns ? returns.parse(awaited) : awaited) as EnforcedReturnTypeParsed<O, F>
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
				await parseReturned(f(...(parseReceived(args, receives) as any)), returns),
	} as AsyncContract<O>
}

export default AsyncContract