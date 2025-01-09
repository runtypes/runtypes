import type Runtype from "../Runtype.ts"
import { type Static, type Parsed } from "../Runtype.ts"
import { ValidationError } from "../index.ts"
import FAILURE from "../utils-internal/FAILURE.ts"

type Options = {
	receives?: Runtype.Core<readonly unknown[]> | undefined
	returns?: Runtype.Core | undefined
}

type Function = (...args: readonly any[]) => any

type EnforcedParametersStatic<
	O extends Options,
	F extends Function,
> = O["receives"] extends Runtype.Core ? Static<O["receives"]> : Parameters<F>

type EnforcedReturnTypeStatic<
	O extends Options,
	F extends Function,
> = O["returns"] extends Runtype.Core ? Static<O["returns"]> : ReturnType<F>

type EnforcedParametersParsed<
	O extends Options,
	F extends Function,
> = O["receives"] extends Runtype.Core ? Parsed<O["receives"]> : Parameters<F>

type EnforcedReturnTypeParsed<
	O extends Options,
	F extends Function,
> = O["returns"] extends Runtype.Core ? Parsed<O["returns"]> & ReturnType<F> : ReturnType<F>

type Contract<O extends Options> = O & {
	enforce: <F extends (...args: EnforcedParametersParsed<O, F>) => EnforcedReturnTypeStatic<O, F>>(
		f: F,
	) => (...args: EnforcedParametersStatic<O, F>) => EnforcedReturnTypeParsed<O, F>
}

const parseReceived = <O extends Options, F extends Function>(
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
				inner: error.failure,
			})
			throw new ValidationError(failure)
		} else throw error
	}
}

const parseReturned = <O extends Options, F extends Function>(
	returned: unknown,
	returns: (O["returns"] & Runtype) | undefined,
): EnforcedReturnTypeParsed<O, F> => {
	if (!returns) return returned as EnforcedReturnTypeParsed<O, F>
	try {
		return returns.parse(returned) as EnforcedReturnTypeParsed<O, F>
	} catch (error) {
		if (error instanceof ValidationError) {
			const failure = FAILURE.RETURN_INCORRECT({
				expected: returns,
				received: returned,
				inner: error.failure,
			})
			throw new ValidationError(failure)
		} else throw error
	}
}

/**
 * Creates an  function contract.
 */
const Contract = <O extends Options>({ receives, returns }: O): Contract<O> => {
	return {
		receives,
		returns,
		enforce:
			f =>
			(...args) =>
				parseReturned(f(...(parseReceived(args, receives as Runtype) as any)), returns as Runtype),
	} as Contract<O>
}

export default Contract