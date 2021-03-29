import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface String extends Runtype<string> {
  tag: 'string';
}

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  value =>
    typeof value === 'string'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected string, but was ${typeOf(value)}`,
          code: Failcode.TYPE_INCORRECT,
        },
  { tag: 'string' },
);
