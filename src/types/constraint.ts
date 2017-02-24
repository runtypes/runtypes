import { Runtype, Rt, Static, create } from './base'
import { String } from './string'
import { ValidationError } from '../validation-error'

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  Underlying: A
}

export function Constraint<A extends Rt>(Underlying: A, constraint: (x: A) => boolean | string) {
  return create<Constraint<A>>(x => {
    const typed = Underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result))
      throw new ValidationError(result)
    else if (!result)
      throw new ValidationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', Underlying })
}
