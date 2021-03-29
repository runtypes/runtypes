import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface Number extends Runtype<number> {
  tag: 'number';
}

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(
  value =>
    typeof value === 'number'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected number, but was ${typeOf(value)}`,
          code: Failcode.TYPE_INCORRECT,
        },
  { tag: 'number' },
);
