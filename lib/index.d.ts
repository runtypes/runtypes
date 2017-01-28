/**
 * A successful validation result.
 */
export declare type Success<A> = {
    /**
     * A tag indicating success.
     */
    success: true;
    /**
     * The original value, cast to its validated type.
     */
    value: A;
};
/**
 * A failed validation result.
 */
export declare type Failure = {
    /**
     * A tag indicating failure.
     */
    success: false;
    /**
     * A message indicating the reason validation failed.
     */
    message: string;
};
/**
 * The result of a type validation.
 */
export declare type Result<A> = Success<A> | Failure;
/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export declare type Runtype<A> = {
    /**
     * Attempts to cast a value to the type for this runtype and return it.
     * Throws an exception if validation fails.
     */
    coerce(x: {}): A;
    /**
     * Validates that a value conforms to this type, and returns a result indicating
     * success or failure (does not throw).
     */
    validate(x: {}): Result<A>;
    /**
     * A type guard for this runtype.
     */
    guard(x: {}): x is A;
    /**
     * Provides a way to reference the constructed type that this runtype
     * validates.
     */
    falseWitness: A;
};
/**
 * Validates anything, but provides no new type information about it.
 */
export declare const anything: Runtype<{}>;
/**
 * Validates nothing (always fails).
 */
export declare const nothing: Runtype<never>;
/**
 * Validates that a value is a boolean.
 */
export declare const boolean: Runtype<boolean>;
/**
 * Validates that a value is a number.
 */
export declare const number: Runtype<number>;
/**
 * Validates that a value is a string.
 */
export declare const string: Runtype<string>;
/**
 * Construct a literal runtype.
 */
export declare function literal<K extends string | number | boolean>(l: K): Runtype<K>;
/**
 * Construct an array runtype from a runtype for its elements.
 */
export declare function array<A>(v: Runtype<A>): Runtype<A[]>;
/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export declare function tuple<A>(a: Runtype<A>, strict?: boolean): Runtype<[A]>;
export declare function tuple<A, B>(a: Runtype<A>, b: Runtype<B>, strict?: boolean): Runtype<[A, B]>;
export declare function tuple<A, B, C>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, strict?: boolean): Runtype<[A, B, C]>;
export declare function tuple<A, B, C, D>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, strict?: boolean): Runtype<[A, B, C, D]>;
export declare function tuple<A, B, C, D, E>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, strict?: boolean): Runtype<[A, B, C, D, E]>;
export declare function tuple<A, B, C, D, E, F>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, strict?: boolean): Runtype<[A, B, C, D, E, F]>;
export declare function tuple<A, B, C, D, E, F, G>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, strict?: boolean): Runtype<[A, B, C, D, E, F, G]>;
/**
 * Construct a record runtype from runtypes for its values.
 */
export declare function record<O>(runtypes: {
    [K in keyof O]: Runtype<O[K]>;
}): Runtype<O>;
/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export declare function union(): Runtype<never>;
export declare function union<A>(a: Runtype<A>): Runtype<A>;
export declare function union<A, B>(a: Runtype<A>, b: Runtype<B>): Runtype<A | B>;
export declare function union<A, B, C>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>): Runtype<A | B | C>;
export declare function union<A, B, C, D>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>): Runtype<A | B | C | D>;
export declare function union<A, B, C, D, E>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>): Runtype<A | B | C | D | E>;
export declare function union<A, B, C, D, E, F>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>): Runtype<A | B | C | D | E | F>;
export declare function union<A, B, C, D, E, F, G>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>): Runtype<A | B | C | D | E | F | G>;
