import { Runtype as Rt, Case } from '.';

export function match<A extends Rt, Z>(a: PairCase<A, Z>): (x: any) => Z;
export function match<A extends Rt, B extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
): (x: any) => Z;
export function match<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  Z
>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
  f: PairCase<F, Z>,
): (x: any) => Z;
export function match<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  Z
>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
  f: PairCase<F, Z>,
  g: PairCase<G, Z>,
): (x: any) => Z;
export function match<
  A extends Rt,
  B extends Rt,
  C extends Rt,
  D extends Rt,
  E extends Rt,
  F extends Rt,
  G extends Rt,
  H extends Rt,
  Z
>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
  f: PairCase<F, Z>,
  g: PairCase<G, Z>,
  h: PairCase<H, Z>,
): (x: any) => Z;
export function match<
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
>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
  f: PairCase<F, Z>,
  g: PairCase<G, Z>,
  h: PairCase<H, Z>,
  i: PairCase<I, Z>,
): (x: any) => Z;
export function match<
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
>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
  f: PairCase<F, Z>,
  g: PairCase<G, Z>,
  h: PairCase<H, Z>,
  i: PairCase<I, Z>,
  j: PairCase<J, Z>,
): (x: any) => Z;
export function match<Z>(...cases: PairCase<any, Z>[]): (x: any) => Z {
  return x => {
    for (const [T, f] of cases) if (T.guard(x)) return f(x);
    throw new Error('No alternatives were matched');
  };
}

export type PairCase<A extends Rt, Z> = [A, Case<A, Z>];
