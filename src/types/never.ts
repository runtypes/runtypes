import { Runtype, create } from '../runtype';

export interface Never extends Runtype<never> {
  tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never = create<Never>(
  value => ({
    success: false,
    message: `Expected nothing, but was ${value === null ? value : typeof value}`,
  }),
  { tag: 'never' },
);
