import type Runtype from "../Runtype.ts"
import { type Static } from "../Runtype.ts"

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

type PairCase<A extends Runtype.Core, Z> = [A, Case<A, Z>]

type Match<A extends readonly [Runtype.Core, ...Runtype.Core[]]> = <Z>(
	...cases: { [K in keyof A]: A[K] extends Runtype.Core<any> ? Case<A[K], Z> : never }
) => Matcher<A, Z>

type Case<R extends Runtype.Core, Result> = (v: Static<R>) => Result

type Matcher<A extends readonly [Runtype.Core, ...Runtype.Core[]], Z> = (
	x: {
		[K in keyof A]: A[K] extends Runtype.Core<infer T> ? T : unknown
	}[number],
) => Z

const when = <R extends Runtype.Core<any>, B>(
	runtype: R,
	transformer: (value: Static<R>) => B,
): PairCase<R, B> => [runtype, transformer]

export default match
// eslint-disable-next-line import/no-named-export
export { type Case, type Match, type Matcher, type PairCase, when }