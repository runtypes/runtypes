import { Runtype, create, validationError } from '../runtype'

export interface Boolean extends Runtype<boolean> { tag: 'boolean' }

/**
 * Validates that a value is a boolean.
 */
export const Boolean = create<Boolean>(x => {
  if (typeof x !== 'boolean')
    throw validationError(`Expected boolean but was ${typeof x}`)
  return x
}, { tag: 'boolean' })
