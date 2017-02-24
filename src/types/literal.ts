import { Runtype, runtype, ValidationError } from './base'

export interface Undefined extends Runtype<undefined> { tag: 'undefined' }

/**
 * Validates that a value is undefined.
 */
export const Undefined = runtype<Undefined>(x => {
  if (x !== undefined)
    throw new ValidationError(`Expected undefined but was ${typeof x}`)
  return x
}, { tag: 'undefined' })

export interface Null extends Runtype<null> { tag: 'null' }

/**
 * Validates that a value is null.
 */
export const Null = runtype<Null>(x => {
  if (x !== null)
    throw new ValidationError(`Expected null but was ${typeof x}`)
  return x
}, { tag: 'null' })

export interface Void extends Runtype<void> { tag: 'void' }

/**
 * Validates that a value is void (null or undefined).
 */
export const Void = runtype<Void>(x => {
  if (x !== undefined && x !== null)
    throw new ValidationError(`Expected null but was ${typeof x}`)
  return x
}, { tag: 'void' })

export interface Literal<A extends boolean | number | string> extends Runtype<A> {
  tag: 'literal'
  value: A
}

/**
 * Construct a literal runtype.
 */
export function Literal<A extends boolean | number | string>(value: A): Literal<A> {
  return runtype<Literal<A>>(x => {
    if (x !== value)
      throw new ValidationError(`Expected literal '${value}' but was '${x}'`)
    return x as A
  }, { tag: 'literal', value })
}
