import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface Boolean extends Runtype<boolean> {
  tag: 'boolean';
}

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(
  value =>
    typeof value === 'boolean'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected boolean, but was ${typeOf(value)}`,
        },
  { tag: 'boolean' },
);
