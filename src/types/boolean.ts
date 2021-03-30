import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export interface Boolean extends Runtype<boolean> {
  tag: 'boolean';
}

const self = ({ tag: 'boolean' } as unknown) as Reflect;

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(
  value => (typeof value === 'boolean' ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
  self,
);
