import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
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
			: never
	> {
	tag: "intersect"
	intersectees: R
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
const Intersect = <R extends readonly [Runtype.Core, ...Runtype.Core[]]>(...intersectees: R) =>
	Runtype.create<Intersect<R>>(
		(value, innerValidate) => {
			for (const runtype of intersectees) {
				const result = innerValidate(runtype, value)
				if (!result.success) return result
			}
			return SUCCESS(value as Static<Intersect<R>>)
		},
		{ tag: "intersect", intersectees },
	)

export default Intersect