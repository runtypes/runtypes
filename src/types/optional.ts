import { Reflect } from '../reflect';
import { Runtype, create, Static } from '../runtype';
import { SUCCESS } from '../util';

export interface Optional<R extends Runtype> extends Runtype<Static<R> | undefined> {
  tag: 'optional';
  underlying: R;
}

/**
 * Validates optional value.
 */
export function Optional<R extends Runtype>(runtype: R) {
  const self = ({ tag: 'optional', underlying: runtype } as unknown) as Reflect;
  return create<Optional<R>>(
    value => (value === undefined ? SUCCESS(value) : runtype.validate(value)),
    self,
  );
}
