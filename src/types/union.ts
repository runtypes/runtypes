import { Runtype as Rt, Static, create } from '../runtype';

export interface Union1<A extends Rt> extends Rt<Static1<A>> {
  tag: 'union';
  alternatives: [A];
  match: Match1<A>;
}

export interface Union2<A extends Rt, B extends Rt> extends Rt<Static2<A, B>> {
  tag: 'union';
  alternatives: [A, B];
  match: Match2<A, B>;
}

export interface Union3<A extends Rt, B extends Rt, C extends Rt> extends Rt<Static3<A, B, C>> {
  tag: 'union';
  alternatives: [A, B, C];
  match: Match3<A, B, C>;
}

export interface Union4<A extends Rt, B extends Rt, C extends Rt, D extends Rt>
  extends Rt<Static<A> | Static<B> | Static<C> | Static<D>> {
  tag: 'union';
  alternatives: [A, B, C, D];
  match: Match4<A, B, C, D>;
}

export interface Union5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>
  extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E>> {
  tag: 'union';
  alternatives: [A, B, C, D, E];
  match: Match5<A, B, C, D, E>;
}

export interface Union6<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt
> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>> {
  tag: 'union';
  alternatives: [A, B, C, D, E, F];
  match: Match6<A, B, C, D, E, F>;
}

export interface Union7<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt
> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>> {
  tag: 'union';
  alternatives: [A, B, C, D, E, F, G];
  match: Match7<A, B, C, D, E, F, G>;
}

export interface Union8<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt
>
  extends Rt<
      Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>
    > {
  tag: 'union';
  alternatives: [A, B, C, D, E, F, G, H];
  match: Match8<A, B, C, D, E, F, G, H>;
}

export interface Union9<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt
>
  extends Rt<
      | Static<A>
      | Static<B>
      | Static<C>
      | Static<D>
      | Static<E>
      | Static<F>
      | Static<G>
      | Static<H>
      | Static<I>
    > {
  tag: 'union';
  alternatives: [A, B, C, D, E, F, G, H, I];
  match: Match9<A, B, C, D, E, F, G, H, I>;
}

export interface Union10<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt
>
  extends Rt<
      | Static<A>
      | Static<B>
      | Static<C>
      | Static<D>
      | Static<E>
      | Static<F>
      | Static<G>
      | Static<H>
      | Static<I>
      | Static<J>
    > {
  tag: 'union';
  alternatives: [A, B, C, D, E, F, G, H, I, J];
  match: Match10<A, B, C, D, E, F, G, H, I, J>;
}

export interface Union11<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt,
  K extends Rt
>
  extends Rt<
      | Static<A>
      | Static<B>
      | Static<C>
      | Static<D>
      | Static<E>
      | Static<F>
      | Static<G>
      | Static<H>
      | Static<I>
      | Static<J>
      | Static<K>
    > {
  tag: 'union';
  alternatives: [A, B, C, D, E, F, G, H, I, J, K];
  match: Match11<A, B, C, D, E, F, G, H, I, J, K>;
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<A extends Rt>(A: A): Union1<A>;
export function Union<A extends Rt, B extends Rt>(A: A, B: B): Union2<A, B>;
export function Union<A extends Rt, B extends Rt, C extends Rt>(A: A, B: B, C: C): Union3<A, B, C>;
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A,
  B: B,
  C: C,
  D: D,
): Union4<A, B, C, D>;
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A,
  B: B,
  C: C,
  D: D,
  E: E,
): Union5<A, B, C, D, E>;
export function Union<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt
>(A: A, B: B, C: C, D: D, E: E, F: F): Union6<A, B, C, D, E, F>;
export function Union<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt
>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Union7<A, B, C, D, E, F, G>;
export function Union<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt
>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Union8<A, B, C, D, E, F, G, H>;
export function Union<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt
>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Union9<A, B, C, D, E, F, G, H, I>;
export function Union<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt
>(
  A: A,
  B: B,
  C: C,
  D: D,
  E: E,
  F: F,
  G: G,
  H: H,
  I: I,
  J: J,
): Union10<A, B, C, D, E, F, G, H, I, J>;
export function Union(...alternatives: Rt[]): any {
  const match = (...cases: any[]) => (x: any) => {
    for (let i = 0; i < alternatives.length; i++) {
      if (alternatives[i].guard(x)) {
        return cases[i](x);
      }
    }
  };

  return create(
    x => {
      for (const { guard } of alternatives) if (guard(x)) return x;
      throw new Error('No alternatives were matched');
    },
    { tag: 'union', alternatives, match },
  );
}

export interface Match1<A extends Rt> {
  <Z>(a: Case<A, Z>): Matcher1<A, Z>;
}
export interface Match2<A extends Rt, B extends Rt> {
  <Z>(a: Case<A, Z>, b: Case<B, Z>): Matcher2<A, B, Z>;
}
export interface Match3<A extends Rt, B extends Rt, C extends Rt> {
  <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>): Matcher3<A, B, C, Z>;
}
export interface Match4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> {
  <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>): Matcher4<A, B, C, D, Z>;
}
export interface Match5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> {
  <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>): Matcher5<
    A,
    B,
    C,
    D,
    E,
    Z
  >;
}
export interface Match6<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
  ): Matcher6<A, B, C, D, E, F, Z>;
}
export interface Match7<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
    g: Case<G, Z>,
  ): Matcher7<A, B, C, D, E, F, G, Z>;
}
export interface Match8<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
    g: Case<G, Z>,
    h: Case<H, Z>,
  ): Matcher8<A, B, C, D, E, F, G, H, Z>;
}
export interface Match9<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
    g: Case<G, Z>,
    h: Case<H, Z>,
    i: Case<I, Z>,
  ): Matcher9<A, B, C, D, E, F, G, H, I, Z>;
}
export interface Match10<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
    g: Case<G, Z>,
    h: Case<H, Z>,
    i: Case<I, Z>,
    j: Case<J, Z>,
  ): Matcher10<A, B, C, D, E, F, G, H, I, J, Z>;
}
export interface Match11<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt,
  K extends Rt
> {
  <Z>(
    a: Case<A, Z>,
    b: Case<B, Z>,
    c: Case<C, Z>,
    d: Case<D, Z>,
    e: Case<E, Z>,
    f: Case<F, Z>,
    g: Case<G, Z>,
    h: Case<H, Z>,
    i: Case<I, Z>,
    j: Case<J, Z>,
    k: Case<K, Z>,
  ): Matcher11<A, B, C, D, E, F, G, H, I, J, K, Z>;
}

export type Case<T extends Rt, Result> = (v: Static<T>) => Result;

export type Static1<A extends Rt> = Static<A>;
export type Static2<A extends Rt, B extends Rt> = Static<A> | Static<B>;
export type Static3<A extends Rt, B extends Rt, C extends Rt> = Static<A> | Static<B> | Static<C>;
export type Static4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> =
  | Static<A>
  | Static<B>
  | Static<C>
  | Static<D>;
export type Static5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> =
  | Static<A>
  | Static<B>
  | Static<C>
  | Static<D>
  | Static<E>;
export type Static6<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt
> = Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>;
export type Static7<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt
> = Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>;
export type Static8<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt
> = Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>;
export type Static9<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt
> =
  | Static<A>
  | Static<B>
  | Static<C>
  | Static<D>
  | Static<E>
  | Static<F>
  | Static<G>
  | Static<H>
  | Static<I>;
export type Static10<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt
> =
  | Static<A>
  | Static<B>
  | Static<C>
  | Static<D>
  | Static<E>
  | Static<F>
  | Static<G>
  | Static<H>
  | Static<I>
  | Static<J>;
export type Static11<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt,
  K extends Rt
> =
  | Static<A>
  | Static<B>
  | Static<C>
  | Static<D>
  | Static<E>
  | Static<F>
  | Static<G>
  | Static<H>
  | Static<I>
  | Static<J>
  | Static<K>;

export type Matcher1<A extends Rt, Z> = (x: Static1<A>) => Z;
export type Matcher2<A extends Rt, B extends Rt, Z> = (x: Static2<A, B>) => Z;
export type Matcher3<A extends Rt, B extends Rt, C extends Rt, Z> = (x: Static3<A, B, C>) => Z;
export type Matcher4<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z> = (
  x: Static4<A, B, C, D>,
) => Z;
export type Matcher5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z> = (
  x: Static5<A, B, C, D, E>,
) => Z;
export type Matcher6<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  Z
> = (x: Static6<A, B, C, D, E, F>) => Z;
export type Matcher7<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  Z
> = (x: Static7<A, B, C, D, E, F, G>) => Z;
export type Matcher8<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  Z
> = (x: Static8<A, B, C, D, E, F, G, H>) => Z;
export type Matcher9<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  Z
> = (x: Static9<A, B, C, D, E, F, G, H, I>) => Z;
export type Matcher10<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt,
  Z
> = (x: Static10<A, B, C, D, E, F, G, H, I, J>) => Z;
export type Matcher11<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  I extends Rt,
  J extends Rt,
  K extends Rt,
  Z
> = (x: Static11<A, B, C, D, E, F, G, H, I, J, K>) => Z;
