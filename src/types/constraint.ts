import { Runtype, Rt, Static, runtype, ValidationError } from './base'
import { String as Str } from './string'

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  Underlying: A
}

export function Constraint<A extends Rt>(Underlying: A, constraint: (x: A) => boolean | string) {
  return runtype<Constraint<A>>(x => {
    const typed = Underlying.check(x)
    const result = constraint(typed)
    if (Str.guard(result))
      throw new ValidationError(result)
    else if (!result)
      throw new ValidationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', Underlying })
}
