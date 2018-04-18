import { Runtype, create, validationError } from '../runtype';

export interface String extends Runtype<string> {
  tag: 'string';
}

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  x => {
    if (typeof x !== 'string')
      throw validationError(
        `Expected string, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'string' },
);
