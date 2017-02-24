import { Runtype, create } from '../runtype'
import { ValidationError } from '../validation-error'

export interface Never extends Runtype<never> { tag: 'never' }

/**
 * Validates nothing (always fails).
 */
export const Never = create<Never>(() => {
  throw new ValidationError('Expected nothing but got something')
}, { tag: 'never' })
