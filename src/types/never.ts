import { expected } from '../result';
import { Codec, create } from '../runtype';

export interface Never extends Codec<never> {
  readonly tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never: Never = create(
  'never',
  { p: value => expected('nothing', value), f: () => new Set() },
  {},
) as any;
