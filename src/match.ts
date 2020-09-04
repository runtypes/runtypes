import { Runtype as Rt, Case, Matcher } from '.';

export function match<A extends [PairCase<any, any>, ...PairCase<any, any>[]]>(
  ...cases: A
): Matcher<
  {
    [key in keyof A]: A[key] extends PairCase<infer RT, any> ? RT : unknown;
  },
  {
    [key in keyof A]: A[key] extends PairCase<any, infer Z> ? Z : unknown;
  }
> {
  return x => {
    for (const [T, f] of cases) if (T.guard(x)) return f(x);
    throw new Error('No alternatives were matched');
  };
}

export type PairCase<A extends Rt, Z> = [A, Case<A, Z>];
