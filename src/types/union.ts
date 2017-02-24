import { Runtype, Rt, Static, create } from '../runtype'

export interface Union1<
  A extends Rt,
> extends Runtype<
  Static<A>
> {
  tag: 'union'
  alternatives: [A]
}

export interface Union2<
  A extends Rt, B extends Rt,
> extends Runtype<
  Static<A> | Static<B>
> {
  tag: 'union'
  alternatives: [A, B]
}

export interface Union3<
  A extends Rt, B extends Rt, C extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C>
> {
  tag: 'union'
  alternatives: [A, B, C]
}

export interface Union4<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D>
> {
  tag: 'union'
  alternatives: [A, B, C, D]
}

export interface Union5<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E]
}

export interface Union6<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F]
}

export interface Union7<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G]
}

export interface Union8<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H]
}

export interface Union9<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H, I]
}

export interface Union10<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H, I, J]
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<A extends Rt>(
  A: A,
): Union1<A>
export function Union<A extends Rt, B extends Rt>(
  A: A, B: B,
): Union2<A, B>
export function Union<A extends Rt, B extends Rt, C extends Rt>(
  A: A, B: B, C: C,
): Union3<A, B, C>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A, B: B, C: C, D: D,
): Union4<A, B, C, D>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A, B: B, C: C, D: D, E: E,
): Union5<A, B, C, D, E>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Union6<A, B, C, D, E, F>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Union7<A, B, C, D, E, F, G>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Union8<A, B, C, D, E, F, G, H>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Union9<A, B, C, D, E, F, G, H, I>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Union10<A, B, C, D, E, F, G, H, I, J>
export function Union(...alternatives: Runtype<any>[]) {
  return create(x => {
    for (const { guard } of alternatives)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  }, { tag: 'union', alternatives })
}
