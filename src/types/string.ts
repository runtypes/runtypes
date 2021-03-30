import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export interface String extends Runtype<string> {
  tag: 'string';
}

const self = ({ tag: 'string' } as unknown) as Reflect;

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  value => (typeof value === 'string' ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
  self,
);
