import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"

interface Intersect<R extends readonly Runtype.Core[] = readonly Runtype.Core[]>
	extends Runtype<
		// We use the fact that a union of functions is effectively an intersection of parameters
		// e.g. to safely call (({x: 1}) => unknown | ({y: 2}) => unknown) you must pass {x: 1, y: 2}
		{ [K in keyof R]: (_: Static<R[K]>) => unknown }[number] extends (_: infer I) => unknown
			? I
			: never,
		{ [K in keyof R]: (_: Parsed<R[K]>) => unknown }[number] extends (_: infer I) => unknown
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
const Intersect = <R extends readonly Runtype.Core[]>(...intersectees: R) => {
	const base = {
		tag: "intersect",
		intersectees,
	} as Runtype.Base<Intersect<R>>
	return Runtype.create<Intersect<R>>(({ value, innerValidate, self, parsing }) => {
		if (self.intersectees.length === 0) return SUCCESS(value)

		const results: Result<any>[] = []
		const details: Failure.Details = {}
		for (let i = 0; i < self.intersectees.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const intersectee = self.intersectees[i]!
			const result = innerValidate(intersectee, value, parsing)
			results.push(result)

			if (result.success) {
				/* empty */
			} else {
				details[i] = result
			}
		}

		if (enumerableKeysOf(details).length !== 0)
			return FAILURE.TYPE_INCORRECT({ expected: self, received: value, details })

		return SUCCESS(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			parsing ? results.findLast(result => result.success)!.value : value,
		)
	}, Spread.asSpreadable(base))
}

export default Intersect