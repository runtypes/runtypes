import { Reflect } from '../reflect';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

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
  const self = ({ tag: 'literal', value: valueBase } as unknown) as Reflect;
  return create<Literal<A>>(
    value =>
      value === valueBase
        ? SUCCESS(value)
        : FAILURE.VALUE_INCORRECT('literal', `\`${literal(valueBase)}\``, `\`${literal(value)}\``),
    self,
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
