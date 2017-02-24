import { Runtype, create } from './base'
import { ValidationError } from '../validation-error'

export type LiteralBase = undefined | null | boolean | number | string

export interface Literal<A extends LiteralBase> extends Runtype<A> {
  tag: 'literal'
  value: A
}

/**
 * Construct a literal runtype.
 */
export function Literal<A extends LiteralBase>(value: A): Literal<A> {
  return create<Literal<A>>(x => {
    if (x !== value)
      throw new ValidationError(`Expected literal '${value}' but was '${x}'`)
    return x as A
  }, { tag: 'literal', value })
}

/**
 * Validates that a value is undefined.
 */
export const Undefined = Literal(undefined)

/**
 * Validates that a value is null.
 */
export const Null = Literal(null)
