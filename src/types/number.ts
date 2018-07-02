import { Runtype, create, validationError } from '../runtype';
import { isNaN } from '../util';

export interface Number extends Runtype<number> {
  tag: 'number';
}

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(
  x => {
    if (typeof x !== 'number' || isNaN(x))
      throw validationError(
        `Expected number, but was ${x === null || x === undefined || isNaN(x) ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'number' },
);
