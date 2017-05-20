import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { String } from './string'

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  underlying: A,
  correction?: (x: A) => A
}

export function Constraint<A extends Rt>(underlying: A, constraint: (x: A) => boolean | string, correction?: (x: A) => A) {
  return create<Constraint<A>>(x => {
    const typed = underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result) || !result || (correction && correction(typed) !== typed)) {
      if (String.guard(result))
        throw validationError(result)
      else
        throw validationError('Failed constraint check')
    }
    return typed
  }, { tag: 'constraint', underlying, correction })
}
