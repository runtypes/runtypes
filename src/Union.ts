import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import { type Match } from "./utils/match.ts"
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
			const details: Failure.Details = {}
			for (let i = 0; i < self.alternatives.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const alternative = self.alternatives[i]!
				const result = innerValidate(alternative, value, parsing)
				if (result.success) return SUCCESS(parsing ? result.value : value)
				details[i] = result
			}
			return FAILURE.TYPE_INCORRECT({ expected: self, received: value, details })
		},
		Spread.asSpreadable(base) as any,
	).with(self =>
		defineIntrinsics(
			{},
			{
				match: ((...cases: any[]) =>
					(x: any) => {
						for (let i = 0; i < self.alternatives.length; i++) {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							if (self.alternatives[i]!.guard(x)) {
								return cases[i](x)
							}
						}
					}) satisfies Match<R>,
			},
		),
	)
}

export default Union