import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineProperty from "./utils-internal/defineProperty.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import hasEnumerableOwn from "./utils-internal/hasEnumerableOwn.ts"
import isObject from "./utils-internal/isObject.ts"
import sameValueZero from "./utils-internal/sameValueZero.ts"

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

const mergeProperties = (
	a: object,
	b: object,
	memo: WeakMap<object, object> = new WeakMap(),
): object => {
	const keysA = new Set(enumerableKeysOf(a))
	const keysB = new Set(enumerableKeysOf(b))
	const keys = keysA.union(keysB)
	const result: object = {}
	for (const key of keys) {
		if (hasEnumerableOwn(key, a)) {
			const valueA = a[key]
			if (hasEnumerableOwn(key, b)) {
				const valueB = b[key]
				if (isObject(valueA) && isObject(valueB)) {
					defineProperty(result, key, mergeProperties(valueA, valueB, memo))
				} else if (sameValueZero(valueA, valueB)) {
					defineProperty(result, key, valueB)
				} else {
					/* empty */
				}
			} else {
				defineProperty(result, key, valueA)
			}
		} else {
			if (hasEnumerableOwn(key, b)) {
				const valueB = b[key]
				defineProperty(result, key, valueB)
			} else {
				throw new Error("impossible")
			}
		}
	}
	return result
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
const Intersect = <R extends readonly Runtype.Core[]>(...intersectees: R) => {
	const base = {
		tag: "intersect",
		intersectees,
	} as Runtype.Base<Intersect<R>>
	return Runtype.create<Intersect<R>>(({ value, innerValidate, self, parsing }): Result<any> => {
		if (self.intersectees.length === 0) return SUCCESS(value)

		let success: boolean = true
		let parsed: object | undefined = parsing ? {} : undefined
		let last: unknown = undefined
		const details: Failure.Details = {}
		for (let i = 0; i < self.intersectees.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const intersectee = self.intersectees[i]!
			const result = innerValidate(intersectee, value, parsing)
			if (result.success) {
				if (parsed) {
					if (isObject(result.value)) parsed = mergeProperties(parsed, result.value)
					else parsed = undefined
				}
				last = result.value
			} else {
				details[i] = result
				parsed = undefined
				success = false
			}
		}

		if (success) return SUCCESS(parsing ? parsed || last : value)
		return FAILURE.TYPE_INCORRECT({ expected: self, received: value, details })
	}, Spread.asSpreadable(base))
}

export default Intersect