import { Runtype, create, validationError } from '../runtype';

export interface Never extends Runtype<never> {
  tag: 'never';
}

/**
 * Validates nothing (always fails).
 */
export const Never = create<Never>(
  x => {
    throw validationError(`Expected nothing, but was ${x}`);
  },
  { tag: 'never' },
);
