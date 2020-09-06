import { create, Runtype } from '../runtype';

export interface String extends Runtype<string> {
  readonly tag: 'string';
}

/**
 * Validates that a value is a string.
 */
export const String: String = create<String>(
  value =>
    typeof value === 'string'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected string, but was ${value === null ? value : typeof value}`,
        },
  { tag: 'string' },
);
