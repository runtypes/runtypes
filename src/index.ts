/**
 * A successful validation result.
 */
export type Success<A> = {
  /**
   * A tag indicating success.
   */
  success: true

  /**
   * The original value, cast to its validated type.
   */
  value: A
}

/**
 * A failed validation result.
 */
export type Failure = {
  /**
   * A tag indicating failure.
   */
  success: false

  /**
   * A message indicating the reason validation failed.
   */
  message: string
}

/**
 * The result of a type validation.
 */
export type Result<A> = Success<A> | Failure

/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A> {
  /**
   * Verifies that a value conforms to this runtype. If so, returns the same value,
   * statically typed. Otherwise throws an exception.
   */
  check(x: any): A

  /**
   * Validates that a value conforms to this type, and returns a result indicating
   * success or failure (does not throw).
   */
  validate(x: any): Result<A>

  /**
   * A type guard for this runtype.
   */
  guard(x: any): x is A

  /**
   * Union this Runtype with another.
   */
  Or<B extends Rt>(B: B): Union2<this, B>

  /**
   * Intersect this Runtype with another.
   */
  And<B>(B: Runtype<B>): Runtype<A & B>

  /**
   * Provide a function which validates some arbitrary constraint,
   * returning true if the constraint is met, false if it failed
   * for some reason. May also return a string which indicates an
   * error and provides a descriptive message.
   */
  withConstraint(constraint: (x: A) => boolean | string): Runtype<A>

  /* @internal */ _falseWitness: A
}

export type Rt = Runtype<any>

/**
 * Obtains the static type associated with a Runtype.
 */
export type Static<R extends Rt> = R['_falseWitness']

export interface Always extends Runtype<{} | void | null> { tag: 'always' }

/**
 * Validates anything, but provides no new type information about it.
 */
export const Always = runtype<Always>(x => x, { tag: 'always' })

export type always = Static<typeof Always>

export interface Never extends Runtype<never> { tag: 'never' }

/**
 * Validates nothing (always fails).
 */
export const Never = runtype<Never>(x => {
  throw new ValidationError('Expected nothing but got something')
}, { tag: 'never' })

export interface Undefined extends Runtype<undefined> { tag: 'undefined' }

/**
 * Validates that a value is undefined.
 */
export const Undefined = runtype<Undefined>(x => {
  if (x !== undefined)
    throw new ValidationError(`Expected undefined but was ${typeof x}`)
  return x
}, { tag: 'undefined' })

export interface Null extends Runtype<null> { tag: 'null' }

/**
 * Validates that a value is null.
 */
export const Null = runtype<Null>(x => {
  if (x !== null)
    throw new ValidationError(`Expected null but was ${typeof x}`)
  return x
}, { tag: 'null' })

export interface Void extends Runtype<void> { tag: 'void' }

/**
 * Validates that a value is void (null or undefined).
 */
export const Void = runtype<Void>(x => {
  if (x !== undefined && x !== null)
    throw new ValidationError(`Expected null but was ${typeof x}`)
  return x
}, { tag: 'void' })

export interface Boolean extends Runtype<boolean> { tag: 'boolean' }

/**
 * Validates that a value is a boolean.
 */
export const Boolean = runtype<Boolean>(x => {
  if (typeof x !== 'boolean')
    throw new ValidationError(`Expected boolean but was ${typeof x}`)
  return x
}, { tag: 'boolean' })

export interface Number extends Runtype<number> { tag: 'number' }

/**
 * Validates that a value is a number.
 */
export const Number = runtype<Number>(x => {
  if (typeof x !== 'number')
    throw new ValidationError(`Expected number but was ${typeof x}`)
  return x
}, { tag: 'number' })

export interface String extends Runtype<string> { tag: 'string' }

/**
 * Validates that a value is a string.
 */
export const String = runtype<String>(x => {
  if (typeof x !== 'string')
    throw new ValidationError(`Expected string but was ${typeof x}`)
  return x
}, { tag: 'string' })

export interface Literal<A extends boolean | number | string> extends Runtype<A> {
  tag: 'literal'
  value: A
}

/**
 * Construct a literal runtype.
 */
export function Literal<A extends boolean | number | string>(value: A): Literal<A> {
  return runtype<Literal<A>>(x => {
    if (x !== value)
      throw new ValidationError(`Expected literal '${value}' but was '${x}'`)
    return x as A
  }, { tag: 'literal', value })
}

export interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
  tag: 'array'
  Element: E
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function arr<E extends Rt>(Element: E): Arr<E> {
  return runtype<Arr<E>>(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      Element.check(x)
    return xs
  }, { tag: 'array', Element })
}
export { arr as Array }

export interface Tuple1<
  A extends Rt,
> extends Runtype<[Static<A>]> {
  tag: 'tuple'
  Components: [A]
}

export interface Tuple2<
  A extends Rt,
  B extends Rt,
> extends Runtype<[Static<A>, Static<B>]> {
  tag: 'tuple'
  Components: [A, B]
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export function Tuple<A extends Rt>(
  A: A,
): Tuple1<A>
export function Tuple<A extends Rt, B extends Rt>(
  A: A, B: B,
): Tuple2<A, B>
export function Tuple<A, B, C>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
): Runtype<[A, B, C]>
export function Tuple<A, B, C, D>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
): Runtype<[A, B, C, D]>
export function Tuple<A, B, C, D, E>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
): Runtype<[A, B, C, D, E]>
export function Tuple<A, B, C, D, E, F>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
): Runtype<[A, B, C, D, E, F]>
export function Tuple<A, B, C, D, E, F, G>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
): Runtype<[A, B, C, D, E, F, G]>
export function Tuple(...Components: Runtype<any>[]) {
  return runtype(x => {
    const xs = arr(Always).check(x)
    if (xs.length < Components.length)
      throw new ValidationError(`Expected array of ${Components.length} but was ${xs.length}`)
    for (let i = 0; i < Components.length; i++)
      Components[i].check(xs[i])
    return x
  }, { tag: 'tuple', Components })
}

export interface Record<O extends { [_ in string]: Rt }> extends Runtype<{ [K in keyof O]: Static<O[K]> }> {
  tag: 'record'
  Fields: O
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function Record<O extends { [_: string]: Rt }>(Fields: O) {
  return runtype<Record<O>>(x => {
    if (x === null || x === undefined)
      throw new ValidationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in Fields) {
      if (hasKey(key, x))
        Fields[key].check(x[key])
      else
        throw new ValidationError(`Missing property ${key}`)
    }

    return x as O
  }, { tag: 'record', Fields })
}

export interface Optional<O extends { [_ in string]: Rt }> extends Runtype<{ [K in keyof O]?: Static<O[K]> }> {
  tag: 'optional'
  Fields: O
}

/**
 * Construct a runtype for records of optional values.
 */
export function Optional<O extends { [_: string]: Rt }>(Fields: O) {
  return runtype<Optional<O>>(x => {
    if (x === null || x === undefined)
      throw new ValidationError(`Expected a defined non-null value but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in Fields)
      if (hasKey(key, x))
        Union(Fields[key], Undefined).check(x[key])

    return x as Partial<O>
  }, { tag: 'optional', Fields })
}

export interface Union1<
  A extends Rt,
> extends Runtype<
  Static<A>
> {
  tag: 'union'
  Alternatives: [A]
}

export interface Union2<
  A extends Rt, B extends Rt,
> extends Runtype<
  Static<A> | Static<B>
> {
  tag: 'union'
  Alternatives: [A, B]
}

export interface Union3<
  A extends Rt, B extends Rt, C extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C>
> {
  tag: 'union'
  Alternatives: [A, B, C]
}

export interface Union4<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D>
> {
  tag: 'union'
  Alternatives: [A, B, C, D]
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<A extends Rt>(
  a: A,
): Union1<A>
export function Union<A extends Rt, B extends Rt>(
  a: A, b: B,
): Union2<A, B>
export function Union<A extends Rt, B extends Rt, C extends Rt>(
  a: A, b: B, c: C,
): Union3<A, B, C>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  a: A, b: B, c: C, d: D
): Union4<A, B, C, D>
export function Union<A, B, C, D, E>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
): Runtype<A | B | C | D | E>
export function Union<A, B, C, D, E, F>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
): Runtype<A | B | C | D | E | F>
export function Union<A, B, C, D, E, F, G>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
): Runtype<A | B | C | D | E | F | G>
export function Union<A, B, C, D, E, F, G, H>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
): Runtype<A | B | C | D | E | F | G | H>
export function Union<A, B, C, D, E, F, G, H, I>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
): Runtype<A | B | C | D | E | F | G | H | I>
export function Union<A, B, C, D, E, F, G, H, I, J>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
): Runtype<A | B | C | D | E | F | G | H | I | J>
export function Union<A, B, C, D, E, F, G, H, I, J, K>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  l: Runtype<L>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
  y: Runtype<Y>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y>
export function Union<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
  y: Runtype<Y>,
  z: Runtype<Z>,
): Runtype<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z>
export function Union(...Alternatives: Runtype<any>[]) {
  return runtype(x => {
    for (const { guard } of Alternatives)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  }, { tag: 'union', Alternatives })
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export function Intersect(
): Runtype<{}>
export function Intersect<A>(
  a: Runtype<A>,
): Runtype<A>
export function Intersect<A, B>(
  a: Runtype<A>,
  b: Runtype<B>,
): Runtype<A & B>
export function Intersect<A, B, C>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
): Runtype<A & B & C>
export function Intersect<A, B, C, D>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
): Runtype<A & B & C & D>
export function Intersect<A, B, C, D, E>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
): Runtype<A & B & C & D & E>
export function Intersect<A, B, C, D, E, F>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
): Runtype<A & B & C & D & E & F>
export function Intersect<A, B, C, D, E, F, G>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
): Runtype<A & B & C & D & E & F & G>
export function Intersect<A, B, C, D, E, F, G, H>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
): Runtype<A & B & C & D & E & F & G & H>
export function Intersect<A, B, C, D, E, F, G, H, I>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
): Runtype<A & B & C & D & E & F & G & H & I>
export function Intersect<A, B, C, D, E, F, G, H, I, J>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
): Runtype<A & B & C & D & E & F & G & H & I & J>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  l: Runtype<L>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
  y: Runtype<Y>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y>
export function Intersect<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(
  a: Runtype<A>,
  b: Runtype<B>,
  c: Runtype<C>,
  d: Runtype<D>,
  e: Runtype<E>,
  f: Runtype<F>,
  g: Runtype<G>,
  h: Runtype<H>,
  i: Runtype<I>,
  j: Runtype<J>,
  k: Runtype<K>,
  m: Runtype<M>,
  n: Runtype<N>,
  o: Runtype<O>,
  p: Runtype<P>,
  q: Runtype<Q>,
  r: Runtype<R>,
  s: Runtype<S>,
  t: Runtype<T>,
  u: Runtype<U>,
  v: Runtype<V>,
  w: Runtype<W>,
  x: Runtype<X>,
  y: Runtype<Y>,
  z: Runtype<Z>,
): Runtype<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y & Z>
export function Intersect(...runtypes: Runtype<any>[]) {
  return runtype(x => {
    for (const { check } of runtypes)
      check(x)
    return x
  })
}

/**
 * Construct a runtype for functions.
 */
export const func: Runtype<Function> = runtype(x => {
  if (typeof x !== 'function')
    throw new ValidationError(`Expected a function but was ${typeof x}`)
  return x
})
export { func as Function }

/**
 * Construct a possibly-recursive Runtype.
 */
export function Lazy<A>(fn: () => Runtype<A>): Runtype<A> {
  let cached: Runtype<A>
  return runtype(x => {
    if (!cached)
      cached = fn()
    return cached.check(x)
  })
}

/**
 * Create a function contract.
 */
export function Contract<Z>(
  Z: Runtype<Z>,
): { enforce: (f: () => Z) => () => Z }
export function Contract<A, Z>(
  A: Runtype<A>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A) => Z) => (a: A) => Z }
export function Contract<A, B, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B) => Z) => (a: A, b: B) => Z }
export function Contract<A, B, C, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C) => Z) => (a: A, b: B, c: C) => Z }
export function Contract<A, B, C, D, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C, d: D) => Z) => (a: A, b: B, c: C, d: D) => Z }
export function Contract<A, B, C, D, E, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C, d: D, e: E) => Z) => (a: A, b: B, c: C, d: D, e: E) => Z }
export function Contract<A, B, C, D, E, F, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F) => Z }
export function Contract<A, B, C, D, E, F, G, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z }
export function Contract<A, B, C, D, E, F, G, H, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  H: Runtype<H>,
  Z: Runtype<Z>,
): { enforce: (f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z) => (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z }
export function Contract(...runtypes: Runtype<any>[]) {
  const lastIndex = runtypes.length - 1
  const argTypes = runtypes.slice(0, lastIndex)
  const returnType = runtypes[lastIndex]
  return {
    enforce: (f: (...args: any[]) => any) => (...args: any[]) => {
      if (args.length < argTypes.length)
        throw new ValidationError(`Expected ${argTypes.length} arguments but only received ${args.length}`)
      for (let i = 0; i < argTypes.length; i++)
        argTypes[i].check(args[i])
      return returnType.check(f(...args))
      }
  }
}

function runtype<A extends Rt>(check: (x: {}) => Static<A>, info: any): A {

  const A = {
    check,
    validate,
    guard,
    Or,
    And,
    withConstraint,
    _falseWitness: undefined as any as A,
  } as A

  if (info)
    for (const k in info)
      (A as any)[k] = info[k]

  return A as any as A

  function validate(value: any): Result<A> {
    try {
      check(value)
      return { success: true, value }
    } catch ({ message }) {
      return { success: false, message }
    }
  }

  function guard(x: any): x is A {
    return validate(x).success
  }

  function Or<B extends Rt>(B: B): Union2<A, B> {
    return Union(A, B)
  }

  function And<B>(B: Runtype<B>): Runtype<A & B> {
    return Intersect(A, B)
  }

  function withConstraint(constraint: (x: A) => boolean | string) {
    return runtype(x => {
      const typed = check(x)
      const result = constraint(typed)
      if (String.guard(result))
        throw new ValidationError(result)
      else if (!result)
        throw new ValidationError('Failed constraint check')
      return typed
    }, info)
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
  }
}

// Type guard to determine if an object has a given key
// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
function hasKey<K extends string>(k: K, o: {}): o is {[_ in K]: {} } {
  return typeof o === 'object' && k in o
}
