import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface String extends Runtype<string> {
  tag: 'string';
}

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  x => {
    if (typeof x !== 'string')
      throw new ValidationError(
        `Expected string, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'string' },
);
