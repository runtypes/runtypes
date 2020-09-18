import { failure, success } from '../result';
import { RuntypeBase, create, Codec } from '../runtype';
import showValue from '../showValue';

/**
 * The super type of all literal types.
 */
export type LiteralValue = undefined | null | boolean | number | string;

export interface Literal<TLiteralValue extends LiteralValue = LiteralValue>
  extends Codec<TLiteralValue> {
  readonly tag: 'literal';
  readonly value: TLiteralValue;
}

export function isLiteralRuntype(runtype: RuntypeBase): runtype is Literal {
  return 'tag' in runtype && (runtype as Literal).tag === 'literal';
}

/**
 * Construct a runtype for a type literal.
 */
export function Literal<A extends LiteralValue>(valueBase: A): Literal<A> {
  return create<Literal<A>>(
    'literal',
    value =>
      value === valueBase
        ? success(value)
        : failure(
            `Expected literal ${showValue(valueBase)}, but was ${showValue(value)}${
              typeof value !== typeof valueBase ? ` (i.e. a ${typeof value})` : ``
            }`,
          ),
    {
      value: valueBase,
      show() {
        return showValue(valueBase);
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
