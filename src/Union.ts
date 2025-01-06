import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import { type Match } from "./utils/match.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Union<R extends readonly Runtype.Core[] = readonly Runtype.Core[]>
	extends Runtype.Common<
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
}

namespace Union {
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Utilities<R extends readonly Runtype.Core[]> = {
		match: Match<R>
	}

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type WithUtilities<R extends readonly Runtype.Core[]> = Union<R> & Utilities<R>
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
const Union = <R extends readonly Runtype.Core[]>(...alternatives: R): Union.WithUtilities<R> => {
	const base = {
		tag: "union",
		alternatives,
		*[Symbol.iterator]() {
			yield Spread(base as any)
		},
	} as Runtype.Base<Union<R>>

	return Runtype.create<Union<R>>(
		(
			value,
			innerValidate,
			self,
			parsing,
		): Result<{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number]> => {
			if (self.alternatives.length === 0) return FAILURE.NOTHING_EXPECTED(value)
			const details: Failure.Details = {}
			for (let i = 0; i < self.alternatives.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const alternative = self.alternatives[i]!
				const result = innerValidate(alternative, value, parsing)
				if (result.success) return SUCCESS(parsing ? result.value : value)
				details[i] = result
			}
			return FAILURE.TYPE_INCORRECT(self, value, details)
		},
		base,
	).with(self => ({
		match: ((...cases: any[]) =>
			(x: any) => {
				for (let i = 0; i < self.alternatives.length; i++) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					if (self.alternatives[i]!.guard(x)) {
						return cases[i](x)
					}
				}
			}) as Match<R>,
	}))
}

export default Union