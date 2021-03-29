import { Runtype, create } from '../runtype';
import { SUCCESS } from '../util';

export interface Unknown extends Runtype {
  tag: 'unknown';
}

/**
 * Validates anything, but provides no new type information about it.
 */
export const Unknown = create<Unknown>(value => SUCCESS(value), { tag: 'unknown' });
