import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Intersect<
	R extends readonly [Runtype.Core, ...Runtype.Core[]] = readonly [Runtype.Core, ...Runtype.Core[]],
> extends Runtype.Common<
		// We use the fact that a union of functions is effectively an intersection of parameters
		// e.g. to safely call (({x: 1}) => void | ({y: 2}) => void) you must pass {x: 1, y: 2}
		{
			[K in keyof R]: R[K] extends Runtype.Core ? (parameter: Static<R[K]>) => unknown : unknown
		}[number] extends (k: infer I) => void
			? I
			: never,
		{
			[K in keyof R]: R[K] extends Runtype.Core ? (parameter: Parsed<R[K]>) => unknown : unknown
		}[number] extends (k: infer I) => void
			? I
			: never
	> {
	tag: "intersect"
	intersectees: R
	[Symbol.iterator]: R["length"] extends 1
		? R[0] extends Runtype.Spreadable
			? HasSymbolIterator<R[0]> extends true
				? () => Iterator<Spread<R[0]>>
				: never
			: never
		: never
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
const Intersect = <R extends readonly [Runtype.Core, ...Runtype.Core[]]>(...intersectees: R) => {
	const base = {
		tag: "intersect",
		intersectees,
		*[Symbol.iterator]() {
			yield Spread(base as any)
		},
	} as Runtype.Base<Intersect<R>>

	return Runtype.create<Intersect<R>>((value, innerValidate, self, parsing) => {
		let parsed: any = undefined
		for (const runtype of self.intersectees) {
			const result = innerValidate(runtype, value, parsing)
			if (!result.success) return result
			else parsed = result.value
		}
		return SUCCESS(parsed)
	}, base)
}

export default Intersect