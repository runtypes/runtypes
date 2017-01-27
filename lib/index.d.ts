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
 * A validator determines whether a value conforms to a type specification.
 */
export declare type Validator<A> = {
    /**
     * Attempts to cast a value to the type for this validator and return it.
     * Throws an exception if validation fails.
     */
    coerce(x: {}): A;
    /**
     * Validates that a value conforms to the type of this validator, and
     * returns a result indicating success or failure (does not throw).
     */
    validate(x: {}): Result<A>;
    /**
     * A type guard for the type that this validator validates.
     */
    guard(x: {}): x is A;
    /**
     * Provides a way to reference the constructed type that this validator
     * validates.
     */
    falseWitness: A;
};
/**
 * Validates anything, but provides no new type information about it.
 */
export declare const anything: Validator<{}>;
/**
 * Validates nothing (always fails).
 */
export declare const nothing: Validator<never>;
/**
 * Validates that a value is a boolean.
 */
export declare const boolean: Validator<boolean>;
/**
 * Validates that a value is a number.
 */
export declare const number: Validator<number>;
/**
 * Validates that a value is a string.
 */
export declare const string: Validator<string>;
/**
 * Construct a validator of literals.
 */
export declare function literal<K extends string | number | boolean>(l: K): Validator<K>;
/**
 * Construct a validator of arrays from a validator for its elements.
 */
export declare function array<A>(v: Validator<A>): Validator<A[]>;
/**
 * Construct a validator of tuples from validators for its elements.
 */
export declare function tuple<A>(a: Validator<A>, strict?: boolean): Validator<[A]>;
export declare function tuple<A, B>(a: Validator<A>, b: Validator<B>, strict?: boolean): Validator<[A, B]>;
export declare function tuple<A, B, C>(a: Validator<A>, b: Validator<B>, c: Validator<C>, strict?: boolean): Validator<[A, B, C]>;
export declare function tuple<A, B, C, D>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, strict?: boolean): Validator<[A, B, C, D]>;
export declare function tuple<A, B, C, D, E>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, strict?: boolean): Validator<[A, B, C, D, E]>;
export declare function tuple<A, B, C, D, E, F>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, strict?: boolean): Validator<[A, B, C, D, E, F]>;
export declare function tuple<A, B, C, D, E, F, G>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, g: Validator<G>, strict?: boolean): Validator<[A, B, C, D, E, F, G]>;
/**
 * Construct a validator of records from validators for its values.
 */
export declare function record<O>(validators: {
    [K in keyof O]: Validator<O[K]>;
}): Validator<O>;
/**
 * Construct a validator of unions from validators for its alternatives.
 */
export declare function union(): Validator<never>;
export declare function union<A>(a: Validator<A>): Validator<A>;
export declare function union<A, B>(a: Validator<A>, b: Validator<B>): Validator<A | B>;
export declare function union<A, B, C>(a: Validator<A>, b: Validator<B>, c: Validator<C>): Validator<A | B | C>;
export declare function union<A, B, C, D>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>): Validator<A | B | C | D>;
export declare function union<A, B, C, D, E>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>): Validator<A | B | C | D | E>;
export declare function union<A, B, C, D, E, F>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>): Validator<A | B | C | D | E | F>;
export declare function union<A, B, C, D, E, F, G>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, g: Validator<G>): Validator<A | B | C | D | E | F | G>;
