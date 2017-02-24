import { Runtype, create } from './base'
import { ValidationError } from '../validation-error'

export interface String extends Runtype<string> { tag: 'string' }

/**
 * Validates that a value is a string.
 */
export const String = create<String>(x => {
  if (typeof x !== 'string')
    throw new ValidationError(`Expected string but was ${typeof x}`)
  return x
}, { tag: 'string' })
