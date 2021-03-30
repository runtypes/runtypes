import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE } from '../util';

export interface Never extends Runtype<never> {
  tag: 'never';
}

const self = ({ tag: 'never' } as unknown) as Reflect;

/**
 * Validates nothing (unknown fails).
 */
export const Never = create<Never>(FAILURE.NOTHING_EXPECTED, self);
