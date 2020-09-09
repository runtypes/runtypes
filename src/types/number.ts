import { Codec, create } from '../runtype';

export interface Number extends Codec<number> {
  readonly tag: 'number';
}

/**
 * Validates that a value is a number.
 */
export const Number: Number = create<Number>(
  value =>
    typeof value === 'number'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected number, but was ${value === null ? value : typeof value}`,
        },
  { tag: 'number' },
);
