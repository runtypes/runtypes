import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

export interface Number extends Runtype<number> {
  tag: 'number';
}

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(
  value =>
    typeof value === 'number'
      ? SUCCESS(value)
      : FAILURE(Failcode.TYPE_INCORRECT, `Expected number, but was ${typeOf(value)}`),
  { tag: 'number' },
);
