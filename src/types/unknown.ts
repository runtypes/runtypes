import { Runtype, create } from '../runtype';

export interface Unknown extends Runtype<unknown> {
  readonly tag: 'unknown';
}

/**
 * Validates anything, but provides no new type information about it.
 */
export const Unknown: Unknown = create<Unknown>(value => ({ success: true, value }), {
  tag: 'unknown',
});
