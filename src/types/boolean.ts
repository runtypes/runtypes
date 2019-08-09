import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface Boolean extends Runtype<boolean> {
  tag: 'boolean';
}

function guard(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(
  x => {
    if (!guard(x)) throw new ValidationError(`Expected boolean, but was ${typeof x}`);
    return x;
  },
  { tag: 'boolean', guard },
);
