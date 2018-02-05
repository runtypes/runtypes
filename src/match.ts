import {
  Runtype as Rt,
  Case,
  Matcher10,
  Matcher9,
  Matcher8,
  Matcher7,
  Matcher6,
  Matcher5,
  Matcher4,
  Matcher3,
  Matcher1,
  Matcher2,
} from '.';
import { Runtype } from './runtype';

export function match<A extends Rt, Z>(a: PairCase<A, Z>): Matcher1<A, Z>;
export function match<A extends Rt, B extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
): Matcher2<A, B, Z>;
export function match<A extends Rt, B extends Rt, C extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
): Matcher3<A, B, C, Z>;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
): Matcher4<A, B, C, D, Z>;
export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z>(
  a: PairCase<A, Z>,
  b: PairCase<B, Z>,
  c: PairCase<C, Z>,
  d: PairCase<D, Z>,
  e: PairCase<E, Z>,
): Matcher5<A, B, C, D, E, Z>;
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
): Matcher6<A, B, C, D, E, F, Z>;
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
): Matcher7<A, B, C, D, E, F, G, Z>;
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
): Matcher8<A, B, C, D, E, F, G, H, Z>;
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
): Matcher9<A, B, C, D, E, F, G, H, I, Z>;
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
): Matcher10<A, B, C, D, E, F, G, H, I, J, Z>;
export function match<Z>(...cases: PairCase<Runtype, Z>[]): (x: any) => Z {
  interface CaseEntry {
    checks: IterableIterator<string | undefined>;
    handle: Case<Runtype, Z>;
  }

  return x => {
    const caseRecord: Record<string, CaseEntry> = {};
    cases.forEach(([type, handle], index) => {
      caseRecord[index] = { checks: type._checkIncrementally(x), handle };
    });

    while (true) {
      const keys = Object.keys(caseRecord);

      if (!keys.length) throw new Error('No alternatives were matched');

      if (keys.length === 1) return caseRecord[keys[0]].handle(x);

      let first = true;
      for (const k of keys) {
        const { checks, handle } = caseRecord[k];
        const { done, value } = checks.next();

        if (done && first) return handle(x);

        if (value !== undefined) {
          delete caseRecord[k];
          break;
        }

        first = false;
      }
    }
  };
}

export type PairCase<A extends Rt, Z> = [A, Case<A, Z>];
