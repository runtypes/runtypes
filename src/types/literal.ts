import { Runtype, create } from '../runtype';

/**
 * The super type of all literal types.
 */
export type LiteralBase = undefined | null | boolean | number | bigint | string;

export interface Literal<A extends LiteralBase> extends Runtype<A> {
  tag: 'literal';
  value: A;
}

/**
 * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
 */
function literal(value: unknown) {
  return Array.isArray(value)
    ? String(value.map(String))
    : typeof value === 'bigint'
    ? String(value) + 'n'
    : String(value);
}

/**
 * Construct a runtype for a type literal.
 */
export function Literal<A extends LiteralBase>(valueBase: A): Literal<A> {
  return create<Literal<A>>(
    value =>
      value === valueBase
        ? { success: true, value }
        : {
            success: false,
            message: `Expected literal '${literal(valueBase)}', but was '${literal(value)}'`,
          },
    { tag: 'literal', value: valueBase },
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
