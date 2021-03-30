import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export interface BigInt extends Runtype<bigint> {
  tag: 'bigint';
}

const self = ({ tag: 'bigint' } as unknown) as Reflect;

/**
 * Validates that a value is a bigint.
 */
export const BigInt = create<BigInt>(
  value => (typeof value === 'bigint' ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
  self,
);
