import { Runtype, create } from '../runtype';

export interface Optional<A> extends Runtype<A | undefined> {
  tag: 'optional';
  value: A;
}

/**
 * Validates optional value.
 */
export function Optional<V>(runtype: Runtype<V>) {
  return create<Optional<V>>(
    value => (value === undefined ? { success: true, value } : runtype.validate(value)),
    { tag: 'optional' },
  );
}
