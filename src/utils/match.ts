import type Runtype from "../Runtype.ts"
import { type Static, type Parsed } from "../Runtype.ts"

declare const Case: unique symbol

const match =
	<C extends readonly [Case<any, any>, ...Case<any, any>[]]>(
		...cases: C
	): Matcher<
		{ [K in keyof C]: C[K] extends Case<infer R, any> ? R : unknown },
		{ [K in keyof C]: C[K] extends Case<any, infer Y> ? Y : unknown }[number]
	> =>
	value => {
		for (const [T, f] of cases)
			try {
				return f(T.parse(value))
			} catch (error) {
				continue
			}
		throw new Error("No alternatives were matched")
	}

type Case<R extends Runtype.Core, Y> = CaseArgs<R, Y> & {
	[Case]: "must be defined with `when` helper"
}

type CaseArgs<R extends Runtype.Core, Y> = [runtype: R, transformer: (value: Parsed<R>) => Y]

type Matcher<R extends readonly Runtype.Core[], Z> = (
	value: { [K in keyof R]: Static<R[K]> }[number],
) => Z

const when: {
	<R extends Runtype.Core, Y>(runtype: R, transformer: (value: Parsed<R>) => Y): Case<R, Y>
	<R extends Runtype.Core, Y>(case_: CaseArgs<R, Y>): Case<R, Y>
} = <R extends Runtype.Core, Y>(...args: [CaseArgs<R, Y>] | CaseArgs<R, Y>): Case<R, Y> =>
	(Array.isArray(args[0]) ? args[0] : [args[0], args[1]]) as Case<R, Y>

export default match
// eslint-disable-next-line import/no-named-export
export { when }