import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface Number extends Runtype<number> {
  tag: 'number';
}

function guard(x: unknown): x is number {
  return typeof x === 'number';
}

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(
  x => {
    if (!guard(x))
      throw new ValidationError(
        `Expected number, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'number', guard },
);
