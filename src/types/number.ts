import { Runtype, create } from './runtype'
import { ValidationError } from '../validation-error'

export interface Number extends Runtype<number> { tag: 'number' }

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(x => {
  if (typeof x !== 'number')
    throw new ValidationError(`Expected number but was ${typeof x}`)
  return x
}, { tag: 'number' })
