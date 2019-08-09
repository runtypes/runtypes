import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface String extends Runtype<string> {
  tag: 'string';
}

function guard(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  x => {
    if (!guard(x))
      throw new ValidationError(
        `Expected string, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'string', guard },
);
