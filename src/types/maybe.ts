import { Runtype, Static } from '../runtype';
import { Union } from './union';
import { Undefined } from './literal';

export interface Maybe<A extends Runtype> extends Runtype<Static<A> | undefined> {
  tag: 'maybe';
  type: A;
}

/**
 * Construct a runtype for maybe values
 */
export const Maybe = <T extends Runtype>(type: T): Maybe<T> => {
  const base = (Union(Undefined, type) as unknown) as Maybe<T>;
  base.type = type;
  base.tag = 'maybe';
  return base;
};
