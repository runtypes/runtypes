import { Codec, create } from '../runtype';

export interface Never extends Codec<never> {
  readonly tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never: Never = create(
  value => ({
    success: false,
    message: `Expected nothing, but was ${value === null ? value : typeof value}`,
  }),
  { tag: 'never' },
) as any;
