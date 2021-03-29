import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

export interface Function extends Runtype<(...args: any[]) => any> {
  tag: 'function';
}

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(
  value =>
    typeof value === 'function'
      ? SUCCESS(value)
      : FAILURE(Failcode.TYPE_INCORRECT, `Expected function, but was ${typeOf(value)}`),
  { tag: 'function' },
);
