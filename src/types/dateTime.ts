import { Runtype, create, validationError } from '../runtype'

export interface DateTime extends Runtype<Date> { tag: 'Date' }

/**
 * Validates that a value is a date.
 */
export const DateTime = create<DateTime>(x => {
  if (!(x instanceof Date))
    throw validationError(`Expected date but was ${typeof x}`)
  return x
}, { tag: 'Date' })
