import { type Static, type RuntypeBase } from "../Runtype.ts"
import { type Case, type Matcher } from "../Union.ts"

const match =
	<A extends [PairCase<any, any>, ...PairCase<any, any>[]]>(
		...cases: A
	): Matcher<
		{
			[key in keyof A]: A[key] extends PairCase<infer RT, any> ? RT : unknown
		},
		{
			[key in keyof A]: A[key] extends PairCase<any, infer Z> ? Z : unknown
		}[number]
	> =>
	x => {
		for (const [T, f] of cases) if (T.guard(x)) return f(x)
		throw new Error("No alternatives were matched")
	}

type PairCase<A extends RuntypeBase, Z> = [A, Case<A, Z>]

const when = <A extends RuntypeBase<any>, B>(
	runtype: A,
	transformer: (value: Static<A>) => B,
): PairCase<A, B> => [runtype, transformer]

export default match
// eslint-disable-next-line import/no-named-export
export { type PairCase, when }