import { Runtype, Rt, Static, create } from './base'
import { Always } from './always'
import { Array as Arr } from './array'
import { ValidationError } from '../validation-error'

export interface Tuple1<
  A extends Rt,
> extends Runtype<[Static<A>]> {
  tag: 'tuple'
  Components: [A]
}

export interface Tuple2<
  A extends Rt, B extends Rt,
> extends Runtype<[
  Static<A>, Static<B>
]> {
  tag: 'tuple'
  Components: [A, B]
}

export interface Tuple3<
  A extends Rt, B extends Rt, C extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>
]> {
  tag: 'tuple'
  Components: [A, B, C]
}

export interface Tuple4<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>
]> {
  tag: 'tuple'
  Components: [A, B, C, D]
}

export interface Tuple5<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E]
}

export interface Tuple6<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F]
}

export interface Tuple7<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G]
}

export interface Tuple8<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H]
}

export interface Tuple9<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H, I]
}

export interface Tuple10<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>, Static<J>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H, I, J]
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export function Tuple<A extends Rt>(
  A: A,
): Tuple1<A>
export function Tuple<A extends Rt, B extends Rt>(
  A: A, B: B,
): Tuple2<A, B>
export function Tuple<A extends Rt, B extends Rt, C extends Rt>(
  A: A, B: B, C: C,
): Tuple3<A, B, C>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A, B: B, C: C, D: D,
): Tuple4<A, B, C, D>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A, B: B, C: C, D: D, E: E,
): Tuple5<A, B, C, D, E>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Tuple6<A, B, C, D, E, F>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Tuple7<A, B, C, D, E, F, G>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Tuple8<A, B, C, D, E, F, G, H>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Tuple9<A, B, C, D, E, F, G, H, I>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Tuple10<A, B, C, D, E, F, G, H, I, J>
export function Tuple(...Components: Runtype<any>[]) {
  return create(x => {
    const xs = Arr(Always).check(x)
    if (xs.length < Components.length)
      throw new ValidationError(`Expected array of ${Components.length} but was ${xs.length}`)
    for (let i = 0; i < Components.length; i++)
      Components[i].check(xs[i])
    return x
  }, { tag: 'tuple', Components })
}
