import { Reflect } from '../reflect';
import { Runtype, RuntypeBase, create, Static } from '../runtype';
import { SUCCESS } from '../util';

export interface Optional<R extends RuntypeBase> extends Runtype<Static<R> | undefined> {
  tag: 'optional';
  underlying: R;
}

/**
 * Validates optional value.
 */
export function Optional<R extends RuntypeBase>(runtype: R) {
  const self = ({ tag: 'optional', underlying: runtype } as unknown) as Reflect;
  return create<Optional<R>>(
    value => (value === undefined ? SUCCESS(value) : runtype.validate(value)),
    self,
  );
}
