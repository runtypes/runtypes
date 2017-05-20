import { Runtype, create, validationError } from '../runtype'

/**
 * The super type of all literal types.
 */
export type LiteralBase = undefined | null | boolean | number | string

export interface Literal<A extends LiteralBase> extends Runtype<A> {
  tag: 'literal'
  value: A
}

/**
 * Construct a runtype for a type literal.
 */
export function Literal<A extends LiteralBase>(value: A): Literal<A> {
  return create<Literal<A>>(x => {
    if (x !== value)
      throw validationError(`Expected literal '${value}' but was '${x}'`)
    return x as A
  }, { tag: 'literal', value })
}

/**
 * An alias for Literal(undefined).
 */
export const Undefined = Literal(undefined)

/**
 * An alias for Literal(null).
 */
export const Null = Literal(null)
