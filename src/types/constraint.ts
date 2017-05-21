import { Runtype, Rt, Static, create, validationError } from '../runtype'
import { String } from './string'

export type ConstraintCheck<T> = (x: T) => boolean | string
export type ConstraintCorrection<T> = (x: T) => T
export type ConstraintRightInverse<T> = (x: T) => T

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  underlying: A,
  constraint: ConstraintCheck<A>,
  correction?: ConstraintCorrection<A>,
  rightInverse?: ConstraintRightInverse<A>
}

export function Constraint<A extends Rt>(underlying: A, constraint: ConstraintCheck<A>, correction?: ConstraintCorrection<A>, rightInverse?: ConstraintRightInverse<A>) {
  return create<Constraint<A>>(x => {
    const typed = underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result))
      throw validationError(result)
    else if (!result)
      throw validationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', underlying, correction, rightInverse })
}
