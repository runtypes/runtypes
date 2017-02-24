import { Runtype, runtype, ValidationError } from './base'

export interface Number extends Runtype<number> { tag: 'number' }

/**
 * Validates that a value is a number.
 */
export const Number = runtype<Number>(x => {
  if (typeof x !== 'number')
    throw new ValidationError(`Expected number but was ${typeof x}`)
  return x
}, { tag: 'number' })
