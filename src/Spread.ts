import type Runtype from "./Runtype.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"

interface Spread<R extends Runtype.Spreadable = Runtype.Spreadable> {
	tag: "spread"
	content: R
}

/**
 * Constructs a pseudo-runtype that is only usable in the context of `Tuple` arguments. This works as the runtime counterpart of variadic tuple types.
 *
 * ```typescript
 * const T = Tuple(Literal(0), Spread(Tuple(Literal(1), Literal(2))), Literal(3))
 * type T = Static<typeof T> // [0, 1, 2, 3]
 *
 * const U = Tuple(Literal(0), Spread(Array(Literal(1))), Literal(2))
 * type U = Static<typeof U> // [0, ...1[], 2]
 * ```
 *
 * `Spread` only accepts a `Tuple`, an `Array`, and trivial runtypes around them e.g. `Tuple(...).withBrand(...)` and `Union(Array(...))`. Using the spread operator `...` against those runtypes yields a `Spread` just once, so you can write `...Tuple(...)` instead of `Spread(Tuple(...))`.
 *
 * ```typescript
 * const T = Tuple(Literal(0), ...Tuple(Literal(1), Literal(2)), Literal(3))
 * type T = Static<typeof T> // [0, 1, 2, 3]

 * const U = Tuple(Literal(0), ...Array(Literal(1)), Literal(2))
 * type U = Static<typeof U> // [0, ...1[], 2]
 * ```
 */
const Spread = <R extends Runtype.Spreadable>(
	content: HasSymbolIterator<R> extends true ? R : never,
): Spread<R> => ({
	tag: "spread",
	content,
})

export default Spread