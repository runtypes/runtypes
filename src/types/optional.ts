import { Runtype, create, Static } from '../runtype';

export interface Optional<R extends Runtype> extends Runtype<Static<R> | undefined> {
  tag: 'optional';
  underlying: R;
}

/**
 * Validates optional value.
 */
export function Optional<R extends Runtype>(runtype: R) {
  return create<Optional<R>>(
    value => (value === undefined ? { success: true, value } : runtype.validate(value)),
    { tag: 'optional', underlying: runtype },
  );
}
