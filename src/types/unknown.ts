import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { SUCCESS } from '../util';

export interface Unknown extends Runtype {
  tag: 'unknown';
}

const self = ({ tag: 'unknown' } as unknown) as Reflect;

/**
 * Validates anything, but provides no new type information about it.
 */
export const Unknown = create<Unknown>(value => SUCCESS(value), self);
