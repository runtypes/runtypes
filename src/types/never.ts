import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

export interface Never extends Runtype<never> {
  tag: 'never';
}

/**
 * Validates nothing (always fails).
 */
export const Never = create<Never>(
  x => {
    throw new ValidationError(`Expected nothing, but was ${x}`);
  },
  { tag: 'never' },
);
