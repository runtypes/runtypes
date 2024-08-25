import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Intersect<A extends readonly [RuntypeBase, ...RuntypeBase[]]>
	extends Runtype<
		// We use the fact that a union of functions is effectively an intersection of parameters
		// e.g. to safely call (({x: 1}) => void | ({y: 2}) => void) you must pass {x: 1, y: 2}
		{
			[K in keyof A]: A[K] extends RuntypeBase ? (parameter: Static<A[K]>) => unknown : unknown
		}[number] extends (k: infer I) => void
			? I
			: never
	> {
	tag: "intersect"
	intersectees: A
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
const Intersect = <A extends readonly [RuntypeBase, ...RuntypeBase[]]>(
	...intersectees: A
): Intersect<A> => {
	const self = { tag: "intersect", intersectees } as unknown as Reflect
	return create((value, innerValidate) => {
		for (const runtype of intersectees) {
			const result = innerValidate(runtype, value)
			if (!result.success) return result
		}
		return SUCCESS(value as Static<Intersect<A>>)
	}, self)
}

export default Intersect