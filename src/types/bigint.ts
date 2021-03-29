import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

export interface BigInt extends Runtype<bigint> {
  tag: 'bigint';
}

/**
 * Validates that a value is a bigint.
 */
export const BigInt = create<BigInt>(
  value =>
    typeof value === 'bigint'
      ? SUCCESS(value)
      : FAILURE(Failcode.TYPE_INCORRECT, `Expected bigint, but was ${typeOf(value)}`),
  { tag: 'bigint' },
);
