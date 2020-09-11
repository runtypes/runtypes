import { create, Codec } from '../runtype';

export interface Boolean extends Codec<boolean> {
  readonly tag: 'boolean';
}

/**
 * Validates that a value is a boolean.
 */
export const Boolean: Boolean = create<Boolean>(
  value =>
    typeof value === 'boolean'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected boolean, but was ${value === null ? value : typeof value}`,
        },
  { tag: 'boolean' },
);
