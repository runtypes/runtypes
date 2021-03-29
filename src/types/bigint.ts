import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface BigInt extends Runtype<bigint> {
  tag: 'bigint';
}

/**
 * Validates that a value is a bigint.
 */
export const BigInt = create<BigInt>(
  value =>
    typeof value === 'bigint'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected bigint, but was ${typeOf(value)}`,
          code: Failcode.TYPE_INCORRECT,
        },
  { tag: 'bigint' },
);
