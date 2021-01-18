import { Runtype, create } from '../runtype';

export interface _BigInt extends Runtype<BigInt> {
  tag: 'bigint';
};

/**
 * Validates that a value is a bigint.
 */
const _BigInt = create<_BigInt>(
  value =>
    typeof value === 'bigint'
      ? { success: true, value }
      : {
        success: false,
        message: `Expected bigint, but was ${value === null ? value : typeof value}`,
      },
  { tag: 'bigint' },
);

export { _BigInt as BigInt };
