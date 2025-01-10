import type Runtype from "../Runtype.ts"
import { type Static, type Parsed } from "../Runtype.ts"

declare const Case: unique symbol

const match =
	<C extends readonly [Case<any, any>, ...Case<any, any>[]]>(
		...cases: C
	): Matcher<
		{ [key in keyof C]: C[key] extends Case<infer RT, any> ? RT : unknown },
		{ [key in keyof C]: C[key] extends Case<any, infer Z> ? Z : unknown }[number]
	> =>
	x => {
		for (const [T, f] of cases)
			try {
				return f(T.parse(x))
			} catch (error) {
				continue
			}
		throw new Error("No alternatives were matched")
	}

type Case<R extends Runtype.Core, Y> = CaseArgs<R, Y> & {
	[Case]: "must be defined with `when` helper"
}

type CaseArgs<R extends Runtype.Core, Y> = [runtype: R, transformer: (value: Parsed<R>) => Y]

type Match<R extends readonly Runtype.Core[]> = <Z>(
	...cases: { [K in keyof R]: Case<R[K], Z>[1] }
) => Matcher<R, Z>

type Matcher<R extends readonly Runtype.Core[], Z> = (
	x: { [K in keyof R]: Static<R[K]> }[number],
) => Z

const when: {
	<R extends Runtype.Core, Y>(runtype: R, transformer: (value: Parsed<R>) => Y): Case<R, Y>
	<R extends Runtype.Core, Y>(case_: CaseArgs<R, Y>): Case<R, Y>
} = <R extends Runtype.Core, Y>(...args: [CaseArgs<R, Y>] | CaseArgs<R, Y>): Case<R, Y> =>
	(Array.isArray(args[0]) ? args[0] : [args[0], args[1]]) as Case<R, Y>

export default match
// eslint-disable-next-line import/no-named-export
export { type Case, type Match, type Matcher, when }