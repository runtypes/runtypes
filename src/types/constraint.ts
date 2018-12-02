import { Runtype, Static, create } from '../runtype';
import { String } from './string';
import { ValidationError } from '../errors';

export type ConstraintCheck<A extends Runtype> = (x: Static<A>) => boolean | string;

export interface Constraint<A extends Runtype, K> extends Runtype<Static<A>> {
  tag: 'constraint';
  underlying: A;
  // See: https://github.com/Microsoft/TypeScript/issues/19746 for why this isn't just
  // `constraint: ConstraintCheck<A>`
  constraint(x: Static<A>): boolean | string;
  args?: K;
}

export function Constraint<A extends Runtype, K>(
  underlying: A,
  constraint: ConstraintCheck<A>,
  args?: K,
) {
  return create<Constraint<A, K>>(
    x => {
      const typed = underlying.check(x);
      const result = constraint(typed);
      if (String.guard(result)) throw new ValidationError(result);
      else if (!result) throw new ValidationError('Failed constraint check');
      return typed;
    },
    { tag: 'constraint', underlying, args, constraint },
  );
}
