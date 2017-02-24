import { Runtype, create } from '../runtype'
import { ValidationError } from '../validation-error'

export interface Boolean extends Runtype<boolean> { tag: 'boolean' }

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(x => {
  if (typeof x !== 'boolean')
    throw new ValidationError(`Expected boolean but was ${typeof x}`)
  return x
}, { tag: 'boolean' })
