import { expected } from '../result';
import { Codec, create } from '../runtype';

export interface Never extends Codec<never> {
  readonly tag: 'never';
}

/**
 * Validates nothing (unknown fails).
 */
export const Never: Never = create('never', value => expected('nothing', value), {}) as any;
