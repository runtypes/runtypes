import { RuntypeBase, Static } from './runtype';
import { Case, Matcher } from './types/union';

export function match<A extends [PairCase<any, any>, ...PairCase<any, any>[]]>(
  ...cases: A
): Matcher<
  {
    [key in keyof A]: A[key] extends PairCase<infer RT, any> ? RT : unknown;
  },
  {
    [key in keyof A]: A[key] extends PairCase<any, infer Z> ? Z : unknown;
  }[number]
> {
  return x => {
    for (const [T, f] of cases) if (T.guard(x)) return f(x);
    throw new Error('No alternatives were matched');
  };
}

export type PairCase<A extends RuntypeBase, Z> = [A, Case<A, Z>];

export function when<A extends RuntypeBase<any>, B>(
  runtype: A,
  transformer: (value: Static<A>) => B,
): PairCase<A, B> {
  return [runtype, transformer];
}
