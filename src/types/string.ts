import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

export interface String extends Runtype<string> {
  tag: 'string';
}

/**
 * Validates that a value is a string.
 */
export const String = create<String>(
  value =>
    typeof value === 'string'
      ? SUCCESS(value)
      : FAILURE(Failcode.TYPE_INCORRECT, `Expected string, but was ${typeOf(value)}`),
  { tag: 'string' },
);
