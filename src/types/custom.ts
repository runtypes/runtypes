import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { String } from './string'

export interface Custom<A extends Rt, T extends string, K> extends Runtype<Static<A>> {
  tag: T,
  underlying: A,
  args: K
}

export function Custom<A extends Rt, T extends string, K>(underlying: A, constraint: (x: Static<A>, args: K) => boolean | string, tag: T, args: K) {
  return create<Custom<A, T, K>>(x => {
    const typed = underlying.check(x)
    const result = constraint(typed, args)
    if (String.guard(result))
      throw validationError(result)
    else if (!result)
      throw validationError('Failed constraint check')
    return typed
  }, { tag, underlying, constraint, args })
}
