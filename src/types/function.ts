import { Runtype, create } from '../runtype';
import { typeOf } from '../util';

export interface Function extends Runtype<(...args: any[]) => any> {
  tag: 'function';
}

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(
  value =>
    typeof value === 'function'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected function, but was ${typeOf(value)}`,
        },
  { tag: 'function' },
);
