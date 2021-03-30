import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export interface Function extends Runtype<(...args: any[]) => any> {
  tag: 'function';
}

const self = ({ tag: 'function' } as unknown) as Reflect;

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(
  value => (typeof value === 'function' ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
  self,
);
