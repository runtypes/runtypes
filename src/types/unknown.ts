import { success } from '../result';
import { Codec, create } from '../runtype';

export interface Unknown extends Codec<unknown> {
  readonly tag: 'unknown';
}

/**
 * Validates anything, but provides no new type information about it.
 */
export const Unknown: Unknown = create<Unknown>('unknown', value => success(value), {});
