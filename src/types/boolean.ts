import { Runtype, runtype, ValidationError } from './base'

export interface Boolean extends Runtype<boolean> { tag: 'boolean' }

/**
 * Validates that a value is a boolean.
 */
export const Boolean = runtype<Boolean>(x => {
  if (typeof x !== 'boolean')
    throw new ValidationError(`Expected boolean but was ${typeof x}`)
  return x
}, { tag: 'boolean' })
