import { Runtype, create, validationError } from '../runtype'

export interface Number extends Runtype<number> { tag: 'number' }

/**
 * Validates that a value is a number.
 */
export const Number = create<Number>(x => {
  if (typeof x !== 'number')
    throw validationError(`Expected number but was ${typeof x}`)
  return x
}, { tag: 'number' })
