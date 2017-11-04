import { Runtype, Static, create } from '../runtype'

export interface Union1<
  A extends Runtype,
> extends Runtype<
  Static<A>
> {
  tag: 'union'
  alternatives: [A]
}

export interface Union2<
  A extends Runtype, B extends Runtype,
> extends Runtype<
  Static<A> | Static<B>
> {
  tag: 'union'
  alternatives: [A, B]
}

export interface Union3<
  A extends Runtype, B extends Runtype, C extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C>
> {
  tag: 'union'
  alternatives: [A, B, C]
}

export interface Union4<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D>
> {
  tag: 'union'
  alternatives: [A, B, C, D]
}

export interface Union5<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E]
}

export interface Union6<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F]
}

export interface Union7<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G]
}

export interface Union8<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H]
}

export interface Union9<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H, I]
}

export interface Union10<
  A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J>
> {
  tag: 'union'
  alternatives: [A, B, C, D, E, F, G, H, I, J]
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<A extends Runtype>(
  A: A,
): Union1<A>
export function Union<A extends Runtype, B extends Runtype>(
  A: A, B: B,
): Union2<A, B>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype>(
  A: A, B: B, C: C,
): Union3<A, B, C>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype>(
  A: A, B: B, C: C, D: D,
): Union4<A, B, C, D>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype>(
  A: A, B: B, C: C, D: D, E: E,
): Union5<A, B, C, D, E>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Union6<A, B, C, D, E, F>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Union7<A, B, C, D, E, F, G>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Union8<A, B, C, D, E, F, G, H>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Union9<A, B, C, D, E, F, G, H, I>
export function Union<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Union10<A, B, C, D, E, F, G, H, I, J>
export function Union(...alternatives: Runtype[]): any {
  return create(x => {
    for (const { guard } of alternatives)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  }, { tag: 'union', alternatives })
}
