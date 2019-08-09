import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

type TFunction = (...args: any[]) => any;

export interface Function extends Runtype<TFunction> {
  tag: 'function';
}

function guard(x: unknown): x is TFunction {
  return typeof x === 'function';
}

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(
  x => {
    if (!guard(x)) throw new ValidationError(`Expected function, but was ${typeof x}`);
    return x;
  },
  { tag: 'function', guard },
);
