import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

export interface Boolean extends Runtype<boolean> {
  tag: 'boolean';
}

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(
  value =>
    typeof value === 'boolean'
      ? SUCCESS(value)
      : FAILURE(Failcode.TYPE_INCORRECT, `Expected boolean, but was ${typeOf(value)}`),
  { tag: 'boolean' },
);
