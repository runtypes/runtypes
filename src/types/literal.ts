import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

/**
 * The super type of all literal types.
 */
export type LiteralBase = undefined | null | boolean | number | string;

export interface Literal<A extends LiteralBase> extends Runtype<A> {
  tag: 'literal';
  value: A;
}

/**
 * Construct a runtype for a type literal.
 */
export function Literal<A extends LiteralBase>(value: A): Literal<A> {
  const guard = (x: unknown): x is A => x === value;
  return create<Literal<A>>(
    x => {
      if (!guard(x)) throw new ValidationError(`Expected literal '${value}', but was '${x}'`);
      return x;
    },
    { tag: 'literal', value, guard },
  );
}

/**
 * An alias for Literal(undefined).
 */
export const Undefined = Literal(undefined);

/**
 * An alias for Literal(null).
 */
export const Null = Literal(null);
