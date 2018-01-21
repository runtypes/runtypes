import { Runtype as Rt, Case } from '.';

export function match<A extends Rt, Z>(cases: [PairCase<A, Z>]): (x: any) => Z;
export function match<A extends Rt, B extends Rt, Z>(
  cases: [PairCase<A, Z>, PairCase<B, Z>],
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, Z>(
  cases: [PairCase<A, Z>, PairCase<B, Z>, PairCase<C, Z>],
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z>(
  cases: [PairCase<A, Z>, PairCase<B, Z>, PairCase<C, Z>, PairCase<D, Z>],
): (x: any) => Z;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z>(
  cases: [PairCase<A, Z>, PairCase<B, Z>, PairCase<C, Z>, PairCase<D, Z>, PairCase<E, Z>],
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
  cases: [
    PairCase<A, Z>,
    PairCase<B, Z>,
    PairCase<C, Z>,
    PairCase<D, Z>,
    PairCase<E, Z>,
    PairCase<F, Z>
  ],
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
  cases: [
    PairCase<A, Z>,
    PairCase<B, Z>,
    PairCase<C, Z>,
    PairCase<D, Z>,
    PairCase<E, Z>,
    PairCase<F, Z>,
    PairCase<G, Z>
  ],
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
  cases: [
    PairCase<A, Z>,
    PairCase<B, Z>,
    PairCase<C, Z>,
    PairCase<D, Z>,
    PairCase<E, Z>,
    PairCase<F, Z>,
    PairCase<G, Z>,
    PairCase<H, Z>
  ],
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
  cases: [
    PairCase<A, Z>,
    PairCase<B, Z>,
    PairCase<C, Z>,
    PairCase<D, Z>,
    PairCase<E, Z>,
    PairCase<F, Z>,
    PairCase<G, Z>,
    PairCase<H, Z>,
    PairCase<I, Z>
  ],
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
  cases: [
    PairCase<A, Z>,
    PairCase<B, Z>,
    PairCase<C, Z>,
    PairCase<D, Z>,
    PairCase<E, Z>,
    PairCase<F, Z>,
    PairCase<G, Z>,
    PairCase<H, Z>,
    PairCase<I, Z>,
    PairCase<J, Z>
  ],
): (x: any) => Z;
export function match<Z>(cases: PairCase<any, Z>[]): (x: any) => Z {
  return x => {
    for (const [T, f] of cases) if (T.guard(x)) return f(x);
    throw new Error('No alternatives were matched');
  };
}

export type PairCase<A extends Rt, Z> = [A, Case<A, Z>];
