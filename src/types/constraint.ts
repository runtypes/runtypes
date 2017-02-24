import { Runtype, Rt, Static, create } from '../runtype'
import { String } from './string'
import { ValidationError } from '../validation-error'

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  underlying: A
}

export function Constraint<A extends Rt>(underlying: A, constraint: (x: A) => boolean | string) {
  return create<Constraint<A>>(x => {
    const typed = underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result))
      throw new ValidationError(result)
    else if (!result)
      throw new ValidationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', underlying })
}
