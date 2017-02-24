import { Runtype, runtype, ValidationError } from './base'

export interface String extends Runtype<string> { tag: 'string' }

/**
 * Validates that a value is a string.
 */
export const String = runtype<String>(x => {
  if (typeof x !== 'string')
    throw new ValidationError(`Expected string but was ${typeof x}`)
  return x
}, { tag: 'string' })
