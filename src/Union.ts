import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineIntrinsics from "./utils-internal/defineIntrinsics.ts"

interface Union<R extends readonly Runtype.Core[] = readonly Runtype.Core[]>
	extends Runtype<
		{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number],
		{ [K in keyof R]: R[K] extends Runtype.Core ? Parsed<R[K]> : unknown }[number]
	> {
	tag: "union"
	alternatives: R
	[Symbol.iterator]: R["length"] extends 1
		? R[0] extends Runtype.Spreadable
			? HasSymbolIterator<R[0]> extends true
				? () => Iterator<Spread<R[0]>>
				: never
			: never
		: never
	match: Match<R>
}

type Match<R extends readonly Runtype.Core[]> = <C extends Cases<R>>(
	...cases: C
) => Matcher<R, ReturnType<C[number]>>

type Matcher<R extends readonly Runtype.Core[], Z> = (
	value: { [K in keyof R]: Static<R[K]> }[number],
) => Z

type Cases<R extends readonly Runtype.Core[]> = { [K in keyof R]: Case<R[K], any> }

type Case<R extends Runtype.Core, Y> = (value: Parsed<R>) => Y

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
const Union = <R extends readonly Runtype.Core[]>(...alternatives: R): Union<R> => {
	const base = {
		tag: "union",
		alternatives,
	} as Runtype.Base<Union<R>>
	return Runtype.create<Union<R>>(
		({
			value,
			innerValidate,
			self,
			parsing,
		}): Result<{ [K in keyof R]: R[K] extends Runtype ? Static<R[K]> : unknown }[number]> => {
			if (self.alternatives.length === 0)
				return FAILURE.NOTHING_EXPECTED({ expected: self, received: value })

			const results: Result<any>[] = []
			const details: Failure.Details = {}
			for (let i = 0; i < self.alternatives.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const alternative = self.alternatives[i]!
				const result = innerValidate(alternative, value, parsing)
				results.push(result)

				if (result.success) {
					if (!parsing) return SUCCESS(value)
				} else {
					details[i] = result
				}
			}

			const first = results.find(result => result.success)
			if (first) return SUCCESS(first.value)

			return FAILURE.TYPE_INCORRECT({ expected: self, received: value, details })
		},
		Spread.asSpreadable(base),
	).with(self =>
		defineIntrinsics(
			{},
			{
				match: ((...cases) =>
					value => {
						for (let i = 0; i < self.alternatives.length; i++)
							try {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								return cases[i]!(self.alternatives[i]!.parse(value))
							} catch (error) {
								continue
							}
						throw new Error("No alternatives were matched")
					}) satisfies Match<R>,
			},
		),
	)
}

export default Union