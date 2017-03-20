import { Runtype, create, validationError } from '../runtype'

export interface Never extends Runtype<never> { tag: 'never' }

/**
 * Validates nothing (always fails).
 */
export const Never = create<Never>(() => {
  throw validationError('Expected nothing but got something')
}, { tag: 'never' })
