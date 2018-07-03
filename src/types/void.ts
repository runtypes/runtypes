import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface Void extends Runtype<void> {
  tag: 'void';
}

/**
 * Validates that a value is void (null or undefined).
 */
export const Void = create<Void>(
  x => {
    if (x !== undefined && x !== null)
      throw new ValidationError(`Expected null, but was ${typeof x}`);
    return x;
  },
  { tag: 'void' },
);
