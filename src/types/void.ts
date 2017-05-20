import { Runtype, create, validationError } from '../runtype'

export interface Void extends Runtype<void> { tag: 'void' }

/**
 * Validates that a value is void (null or undefined).
 */
export const Void = create<Void>(x => {
  if (x !== undefined && x !== null)
    throw validationError(`Expected null but was ${typeof x}`)
  return x
}, { tag: 'void' })
