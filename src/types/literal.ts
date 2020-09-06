import { RuntypeBase, create, Runtype } from '../runtype';

/**
 * The super type of all literal types.
 */
export type LiteralValue = undefined | null | boolean | number | string;

export interface Literal<TLiteralValue extends LiteralValue = LiteralValue>
  extends Runtype<TLiteralValue> {
  readonly tag: 'literal';
  readonly value: TLiteralValue;
}

/**
 * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
 */
function literal(value: unknown) {
  return Array.isArray(value) ? String(value.map(String)) : String(value);
}

export function isLiteralRuntype(runtype: RuntypeBase): runtype is Literal {
  return 'tag' in runtype && (runtype as Literal).tag === 'literal';
}

/**
 * Construct a runtype for a type literal.
 */
export function Literal<A extends LiteralValue>(valueBase: A): Literal<A> {
  return create<Literal<A>>(
    value =>
      value === valueBase
        ? { success: true, value }
        : {
            success: false,
            message: `Expected literal '${literal(valueBase)}', but was '${literal(value)}'`,
          },
    {
      tag: 'literal',
      value: valueBase,
      show() {
        return typeof valueBase === 'string' ? `"${valueBase}"` : String(valueBase);
      },
    },
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
