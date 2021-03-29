import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, typeOf } from '../util';

export interface Never extends Runtype<never> {
  tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never = create<Never>(
  value => FAILURE(Failcode.NOTHING_EXPECTED, `Expected nothing, but was ${typeOf(value)}`),
  { tag: 'never' },
);
