import { Runtype, create } from '../runtype';

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
          message: `Expected function, but was ${value === null ? value : typeof value}`,
        },
  { tag: 'function' },
);
