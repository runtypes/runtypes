import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface Never extends Runtype<never> {
  tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never = create<Never>(
  value => ({
    success: false,
    message: `Expected nothing, but was ${typeOf(value)}`,
  }),
  { tag: 'never' },
);
