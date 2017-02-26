import { Runtype } from '../runtype';
/**
 * The super type of all literal types.
 */
export declare type LiteralBase = undefined | null | boolean | number | string;
export interface Literal<A extends LiteralBase> extends Runtype<A> {
    tag: 'literal';
    value: A;
}
/**
 * Construct a runtype for a type literal.
 */
export declare function Literal<A extends LiteralBase>(value: A): Literal<A>;
/**
 * An alias for Literal(undefined).
 */
export declare const Undefined: Literal<undefined>;
/**
 * An alias for Literal(null).
 */
export declare const Null: Literal<null>;
