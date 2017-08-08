import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { String } from './string'

export type ConstraintCheck<A extends Rt> = (x: Static<A>) => boolean | string

export interface Constraint<A extends Rt, K> extends Runtype<Static<A>> {
  tag: 'constraint'
  underlying: A,
  constraint: ConstraintCheck<A>,
  args?: K
}

export function Constraint<A extends Rt, K>(underlying: A, constraint: ConstraintCheck<A>, args?: K) {
  return create<Constraint<A, K>>(x => {
    const typed = underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result))
      throw validationError(result)
    else if (!result)
      throw validationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', underlying, args, constraint })
}
