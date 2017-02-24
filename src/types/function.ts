import { Runtype, create } from '../runtype'
import { ValidationError } from '../validation-error'

export interface Function extends Runtype<(...args: any[]) => any> { tag: 'function' }

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(x => {
  if (typeof x !== 'function')
    throw new ValidationError(`Expected a function but was ${typeof x}`)
  return x
}, { tag: 'function' })
