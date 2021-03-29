import { Failcode } from '../result';
import { Runtype, Static, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';
import { String } from './string';
import { Unknown } from './unknown';

export type ConstraintCheck<A extends Runtype> = (x: Static<A>) => boolean | string;

export interface Constraint<A extends Runtype, T extends Static<A> = Static<A>, K = unknown>
  extends Runtype<T> {
  tag: 'constraint';
  underlying: A;
  // See: https://github.com/Microsoft/TypeScript/issues/19746 for why this isn't just
  // `constraint: ConstraintCheck<A>`
  constraint(x: Static<A>): boolean | string;
  name?: string;
  args?: K;
}

export function Constraint<A extends Runtype, T extends Static<A> = Static<A>, K = unknown>(
  underlying: A,
  constraint: ConstraintCheck<A>,
  options?: { name?: string; args?: K },
): Constraint<A, T, K> {
  return create<Constraint<A, T, K>>(
    value => {
      const name = options && options.name;
      const validated = underlying.validate(value);

      if (!validated.success) {
        return validated;
      }

      const result = constraint(validated.value);
      if (String.guard(result)) return FAILURE(Failcode.VALUE_INCORRECT, result);
      else if (!result)
        return FAILURE(Failcode.VALUE_INCORRECT, `Failed ${name || 'constraint'} check`);
      return SUCCESS(validated.value as T);
    },
    {
      tag: 'constraint',
      underlying,
      constraint,
      name: options && options.name,
      args: options && options.args,
    },
  );
}

export const Guard = <T, K = unknown>(
  guard: (x: unknown) => x is T,
  options?: { name?: string; args?: K },
) => Unknown.withGuard(guard, options);
