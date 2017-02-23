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
     * Verifies that a value conforms to this runtype. If so, returns the same value,
     * statically typed. Otherwise throws an exception.
     */
    check(x: any): A;
    /**
     * Validates that a value conforms to this type, and returns a result indicating
     * success or failure (does not throw).
     */
    validate(x: any): Result<A>;
    /**
     * A type guard for this runtype.
     */
    guard(x: any): x is A;
    /**
     * Union this Runtype with another.
     */
    Or<B>(B: Runtype<B>): Runtype<A | B>;
    /**
     * Intersect this Runtype with another.
     */
    And<B>(B: Runtype<B>): Runtype<A & B>;
    /**
     * Provide a function which validates some arbitrary constraint,
     * returning true if the constraint is met, false if it failed
     * for some reason. May also return a string which indicates an
     * error and provides a descriptive message.
     */
    withConstraint(constraint: (x: A) => boolean | string): Runtype<A>;
    _falseWitness: A;
};
/**
 * Obtains the static type associated with a Runtype.
 */
export declare type Static<R extends Runtype<any>> = R['_falseWitness'];
/**
 * Validates anything, but provides no new type information about it.
 */
export declare const Always: Runtype<{} | void | null>;
/**
 * Validates nothing (always fails).
 */
export declare const Never: Runtype<never>;
/**
 * Validates that a value is undefined.
 */
export declare const Undefined: Runtype<undefined>;
/**
 * Validates that a value is null.
 */
export declare const Null: Runtype<null>;
/**
 * Validates that a value is void (null or undefined).
 */
export declare const Void: Runtype<void>;
/**
 * Validates that a value is a boolean.
 */
export declare const Boolean: Runtype<boolean>;
/**
 * Validates that a value is a number.
 */
export declare const Number: Runtype<number>;
/**
 * Validates that a value is a string.
 */
export declare const String: Runtype<string>;
/**
 * Construct a literal runtype.
 */
export declare function Literal<K extends string | number | boolean>(l: K): Runtype<K>;
/**
 * Construct an array runtype from a runtype for its elements.
 */
declare function arr<A>(v: Runtype<A>): Runtype<A[]>;
export { arr as Array };
/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export declare function Tuple<A>(a: Runtype<A>): Runtype<[A]>;
export declare function Tuple<A, B>(a: Runtype<A>, b: Runtype<B>): Runtype<[A, B]>;
export declare function Tuple<A, B, C>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>): Runtype<[A, B, C]>;
export declare function Tuple<A, B, C, D>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>): Runtype<[A, B, C, D]>;
export declare function Tuple<A, B, C, D, E>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>): Runtype<[A, B, C, D, E]>;
export declare function Tuple<A, B, C, D, E, F>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>): Runtype<[A, B, C, D, E, F]>;
export declare function Tuple<A, B, C, D, E, F, G>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>): Runtype<[A, B, C, D, E, F, G]>;
/**
 * Construct a runtype for arbitrary dictionaries. Note that unlike Record, this provides no actual
 * runtime validation of the keys or values.
 */
export declare function Dictionary<V>(keyType?: 'string'): Runtype<{
    [_: string]: V;
}>;
export declare function Dictionary<V>(keyType?: 'number'): Runtype<{
    [_: number]: V;
}>;
/**
 * Construct a record runtype from runtypes for its values.
 */
export declare function Record<O>(runtypes: {
    [K in keyof O]: Runtype<O[K]>;
}): Runtype<O>;
/**
 * Construct a runtype for records of optional values.
 */
export declare function Optional<O>(runtypes: {
    [K in keyof O]: Runtype<O[K]>;
}): Runtype<Partial<O>>;
/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export declare function Union(): Runtype<never>;
export declare function Union<A>(a: Runtype<A>): Runtype<A>;
export declare function Union<A, B>(a: Runtype<A>, b: Runtype<B>): Runtype<A | B>;
export declare function Union<A, B, C>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>): Runtype<A | B | C>;
export declare function Union<A, B, C, D>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>): Runtype<A | B | C | D>;
export declare function Union<A, B, C, D, E>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>): Runtype<A | B | C | D | E>;
export declare function Union<A, B, C, D, E, F>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>): Runtype<A | B | C | D | E | F>;
export declare function Union<A, B, C, D, E, F, G>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>): Runtype<A | B | C | D | E | F | G>;
export declare function Union<A, B, C, D, E, F, G, H>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>): Runtype<A | B | C | D | E | F | G | H>;
export declare function Union<A, B, C, D, E, F, G, H, I>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>): Runtype<A | B | C | D | E | F | G | H | I>;
export declare function Union<A, B, C, D, E, F, G, H, I, J>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>): Runtype<A | B | C | D | E | F | G | H | I | J>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>): Runtype<A | B | C | D | E | F | G | H | I | J | K>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, l: Runtype<L>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>, y: Runtype<Y>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y>;
export declare function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>, y: Runtype<Y>, z: Runtype<Z>): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z>;
/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export declare function Intersect(): Runtype<{}>;
export declare function Intersect<A>(a: Runtype<A>): Runtype<A>;
export declare function Intersect<A, B>(a: Runtype<A>, b: Runtype<B>): Runtype<A & B>;
export declare function Intersect<A, B, C>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>): Runtype<A & B & C>;
export declare function Intersect<A, B, C, D>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>): Runtype<A & B & C & D>;
export declare function Intersect<A, B, C, D, E>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>): Runtype<A & B & C & D & E>;
export declare function Intersect<A, B, C, D, E, F>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>): Runtype<A & B & C & D & E & F>;
export declare function Intersect<A, B, C, D, E, F, G>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>): Runtype<A & B & C & D & E & F & G>;
export declare function Intersect<A, B, C, D, E, F, G, H>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>): Runtype<A & B & C & D & E & F & G & H>;
export declare function Intersect<A, B, C, D, E, F, G, H, I>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>): Runtype<A & B & C & D & E & F & G & H & I>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>): Runtype<A & B & C & D & E & F & G & H & I & J>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>): Runtype<A & B & C & D & E & F & G & H & I & J & K>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, l: Runtype<L>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>, y: Runtype<Y>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y>;
export declare function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(a: Runtype<A>, b: Runtype<B>, c: Runtype<C>, d: Runtype<D>, e: Runtype<E>, f: Runtype<F>, g: Runtype<G>, h: Runtype<H>, i: Runtype<I>, j: Runtype<J>, k: Runtype<K>, m: Runtype<M>, n: Runtype<N>, o: Runtype<O>, p: Runtype<P>, q: Runtype<Q>, r: Runtype<R>, s: Runtype<S>, t: Runtype<T>, u: Runtype<U>, v: Runtype<V>, w: Runtype<W>, x: Runtype<X>, y: Runtype<Y>, z: Runtype<Z>): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y & Z>;
/**
 * Construct a runtype for functions.
 */
export declare const func: Runtype<Function>;
export { func as Function };
/**
 * Construct a possibly-recursive Runtype.
 */
export declare function Lazy<A>(fn: () => Runtype<A>): Runtype<A>;
/**
 * Create a function contract.
 */
export declare function Contract<Z>(Z: Runtype<Z>): {
    enforce: (f: () => Z) => () => Z;
};
export declare function Contract<A, Z>(A: Runtype<A>, Z: Runtype<Z>): {
    enforce: (f: (a: A) => Z) => (a: A) => Z;
};
export declare function Contract<A, B, Z>(A: Runtype<A>, B: Runtype<B>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B) => Z) => (a: A, b: B) => Z;
};
export declare function Contract<A, B, C, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C) => Z) => (a: A, b: B, c: C) => Z;
};
export declare function Contract<A, B, C, D, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C, d: D) => Z) => (a: A, b: B, c: C, d: D) => Z;
};
export declare function Contract<A, B, C, D, E, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C, d: D, e: E) => Z) => (a: A, b: B, c: C, d: D, e: E) => Z;
};
export declare function Contract<A, B, C, D, E, F, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F) => Z;
};
export declare function Contract<A, B, C, D, E, F, G, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z;
};
export declare function Contract<A, B, C, D, E, F, G, H, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, H: Runtype<H>, Z: Runtype<Z>): {
    enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z;
};
