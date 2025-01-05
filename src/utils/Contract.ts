import type Runtype from "../Runtype.ts"
import { type Static, type Parsed } from "../Runtype.ts"

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
	receives: O["receives"],
): EnforcedParametersParsed<O, F> => {
	return (receives ? receives.parse(received) : received) as EnforcedParametersParsed<O, F>
}

const parseReturned = <O extends Options, F extends Function>(
	returned: unknown,
	returns: O["returns"],
): EnforcedReturnTypeParsed<O, F> => {
	return (returns ? returns.parse(returned) : returned) as EnforcedReturnTypeParsed<O, F>
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
				parseReturned(f(...(parseReceived(args, receives) as any)), returns),
	} as Contract<O>
}

export default Contract