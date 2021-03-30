import { Reflect } from '../reflect';
import { Runtype, Static, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';
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
  const name = options && options.name;
  const args = options && options.args;
  const self = ({
    tag: 'constraint',
    underlying,
    constraint,
    name,
    args,
  } as unknown) as Reflect;
  return create<Constraint<A, T, K>>(value => {
    const result = underlying.validate(value);

    if (!result.success) return result;

    const message = constraint(result.value);
    if (typeof message === 'string') return FAILURE.CONSTRAINT_FAILED(self, message);
    else if (!message) return FAILURE.CONSTRAINT_FAILED(self);
    return SUCCESS(result.value as T);
  }, self);
}

export const Guard = <T, K = unknown>(
  guard: (x: unknown) => x is T,
  options?: { name?: string; args?: K },
) => Unknown.withGuard(guard, options);
