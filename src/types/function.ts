import { Runtype, create, validationError } from '../runtype'

export interface Function extends Runtype<(...args: any[]) => any> { tag: 'function' }

/**
 * Construct a runtype for functions.
 */
export const Function = create<Function>(x => {
  if (typeof x !== 'function')
    throw validationError(`Expected a function but was ${typeof x}`)
  return x
}, { tag: 'function' })
