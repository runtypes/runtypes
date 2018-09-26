import { Runtype, create } from '../runtype';

export interface Unknown extends Runtype {
  tag: 'unknown';
}

/**
 * Validates anything, but provides no new type information about it.
 */
export const Unknown = create<Unknown>(x => x, { tag: 'unknown' });
