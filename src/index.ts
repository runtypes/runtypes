import showType from './showType'
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
  And<B extends Rt>(B: B): Intersect2<this, B>

  /**
   * Provide a function which validates some arbitrary constraint,
   * returning true if the constraint is met, false if it failed
   * for some reason. May also return a string which indicates an
   * error and provides a descriptive message.
   */
  withConstraint(constraint: (x: A) => boolean | string): Constraint<this>

  /* @internal */ _falseWitness: A
}

/**
 * Just a convenient synonym for internal use in defining new Runtypes.
 */
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

interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
  tag: 'array'
  Element: E
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Rt>(Element: E): Arr<E> {
  return runtype<Arr<E>>(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      Element.check(x)
    return xs
  }, { tag: 'array', Element })
}
export { Arr as Array }

export interface Tuple1<
  A extends Rt,
> extends Runtype<[Static<A>]> {
  tag: 'tuple'
  Components: [A]
}

export interface Tuple2<
  A extends Rt, B extends Rt,
> extends Runtype<[
  Static<A>, Static<B>
]> {
  tag: 'tuple'
  Components: [A, B]
}

export interface Tuple3<
  A extends Rt, B extends Rt, C extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>
]> {
  tag: 'tuple'
  Components: [A, B, C]
}

export interface Tuple4<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>
]> {
  tag: 'tuple'
  Components: [A, B, C, D]
}

export interface Tuple5<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E]
}

export interface Tuple6<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F]
}

export interface Tuple7<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G]
}

export interface Tuple8<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H]
}

export interface Tuple9<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H, I]
}

export interface Tuple10<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt,
> extends Runtype<[
  Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>, Static<J>
]> {
  tag: 'tuple'
  Components: [A, B, C, D, E, F, G, H, I, J]
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
export function Tuple<A extends Rt, B extends Rt, C extends Rt>(
  A: A, B: B, C: C,
): Tuple3<A, B, C>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A, B: B, C: C, D: D,
): Tuple4<A, B, C, D>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A, B: B, C: C, D: D, E: E,
): Tuple5<A, B, C, D, E>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Tuple6<A, B, C, D, E, F>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Tuple7<A, B, C, D, E, F, G>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Tuple8<A, B, C, D, E, F, G, H>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Tuple9<A, B, C, D, E, F, G, H, I>
export function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Tuple10<A, B, C, D, E, F, G, H, I, J>
export function Tuple(...Components: Runtype<any>[]) {
  return runtype(x => {
    const xs = Arr(Always).check(x)
    if (xs.length < Components.length)
      throw new ValidationError(`Expected array of ${Components.length} but was ${xs.length}`)
    for (let i = 0; i < Components.length; i++)
      Components[i].check(xs[i])
    return x
  }, { tag: 'tuple', Components })
}

export interface Record<O extends { [_ in string]: Rt }> extends Runtype<{[K in keyof O]: Static<O[K]> }> {
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

export interface StringDictionary<V> extends Runtype<{ [_: string]: V }> {
  tag: 'dictionary'
  keyType: 'string'
}

export interface NumberDictionary<V> extends Runtype<{ [_: number]: V }> {
  tag: 'dictionary'
  keyType: 'number'
}

/**
 * Construct a runtype for arbitrary dictionaries.
 */
export function Dictionary<V>(v: Runtype<V>, keyType?: 'string'): StringDictionary<V>
export function Dictionary<V>(v: Runtype<V>, keyType?: 'number'): NumberDictionary<V>
export function Dictionary<V>(v: Runtype<V>, keyType = 'string') {
  return runtype<Rt>(x => {
    Record({}).check(x)

    if (typeof x !== 'object')
      throw new ValidationError(`Expected an object but was ${typeof x}`)

    if (Object.getPrototypeOf(x) !== Object.prototype) {
      if (!Array.isArray(x))
        throw new ValidationError(`Expected simple object but was complex`)
      else if (keyType === 'string')
        throw new ValidationError(`Expected dictionary but was array`)
    }

    for (const key in x) {
      // Object keys are always strings
      if (keyType === 'number') {
        if (isNaN(+key))
          throw new ValidationError(`Expected dictionary key to be a number but was string`)
      }
      v.check((x as any)[key])
    }

    return x
  }, { tag: 'dictionary', keyType })
}

export interface Optional<O extends {[_ in string]: Rt }> extends Runtype<{[K in keyof O]?: Static<O[K]> }> {
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

export interface Union5<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E]
}

export interface Union6<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E, F]
}

export interface Union7<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E, F, G]
}

export interface Union8<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E, F, G, H]
}

export interface Union9<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E, F, G, H, I]
}

export interface Union10<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt,
> extends Runtype<
  Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J>
> {
  tag: 'union'
  Alternatives: [A, B, C, D, E, F, G, H, I, J]
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export function Union<A extends Rt>(
  A: A,
): Union1<A>
export function Union<A extends Rt, B extends Rt>(
  A: A, B: B,
): Union2<A, B>
export function Union<A extends Rt, B extends Rt, C extends Rt>(
  A: A, B: B, C: C,
): Union3<A, B, C>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A, B: B, C: C, D: D,
): Union4<A, B, C, D>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A, B: B, C: C, D: D, E: E,
): Union5<A, B, C, D, E>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Union6<A, B, C, D, E, F>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Union7<A, B, C, D, E, F, G>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Union8<A, B, C, D, E, F, G, H>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Union9<A, B, C, D, E, F, G, H, I>
export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Union10<A, B, C, D, E, F, G, H, I, J>
export function Union(...Alternatives: Runtype<any>[]) {
  return runtype(x => {
    for (const { guard } of Alternatives)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  }, { tag: 'union', Alternatives })
}

export interface Intersect1<
  A extends Rt,
> extends Runtype<
  Static<A>
> {
  tag: 'intersect'
  Intersectees: [A]
}

export interface Intersect2<
  A extends Rt, B extends Rt,
> extends Runtype<
  Static<A> & Static<B>
> {
  tag: 'intersect'
  Intersectees: [A, B]
}
export interface Intersect3<
  A extends Rt, B extends Rt, C extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C>
> {
  tag: 'intersect'
  Intersectees: [A, B, C]
}

export interface Intersect4<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D]
}

export interface Intersect5<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E]
}

export interface Intersect6<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E, F]
}

export interface Intersect7<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E, F, G]
}

export interface Intersect8<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E, F, G, H]
}

export interface Intersect9<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E, F, G, H, I]
}

export interface Intersect10<
  A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt,
> extends Runtype<
  Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I> & Static<J>
> {
  tag: 'intersect'
  Intersectees: [A, B, C, D, E, F, G, H, I, J]
}

/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export function Intersect<A extends Rt>(
  A: A,
): Intersect1<A>
export function Intersect<A extends Rt, B extends Rt>(
  A: A, B: B,
): Intersect2<A, B>
export function Intersect<A extends Rt, B extends Rt, C extends Rt>(
  A: A, B: B, C: C,
): Intersect3<A, B, C>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(
  A: A, B: B, C: C, D: D,
): Intersect4<A, B, C, D>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(
  A: A, B: B, C: C, D: D, E: E,
): Intersect5<A, B, C, D, E>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F,
): Intersect6<A, B, C, D, E, F>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G,
): Intersect7<A, B, C, D, E, F, G>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
): Intersect8<A, B, C, D, E, F, G, H>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I,
): Intersect9<A, B, C, D, E, F, G, H, I>
export function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(
  A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J,
): Intersect10<A, B, C, D, E, F, G, H, I, J>
export function Intersect(...Intersectees: Runtype<any>[]) {
  return runtype(x => {
    for (const { check } of Intersectees)
      check(x)
    return x
  }, { tag: 'intersect', Intersectees })
}

interface Func extends Runtype<(...args: any[]) => any> { tag: 'function' }

/**
 * Construct a runtype for functions.
 */
const Func = runtype<Func>(x => {
  if (typeof x !== 'function')
    throw new ValidationError(`Expected a function but was ${typeof x}`)
  return x
}, { tag: 'function' })
export { Func as Function }

/**
 * Construct a possibly-recursive Runtype.
 */
export function Lazy<A extends Rt>(delayed: () => A) {
  const data: any = {
    get tag() { return (getWrapped() as any)['tag'] }
  }

  let cached: A
  function getWrapped() {
    if (!cached) {
      cached = delayed()
      for (const k in cached)
        if (k !== 'tag')
          data[k] = cached[k]
    }
    return cached
  }

  return runtype<A>(x => {
    return getWrapped().check(x)
  }, data)
}

export interface Constraint<A extends Rt> extends Runtype<Static<A>> {
  tag: 'constraint'
  Underlying: A
}

export function Constraint<A extends Rt>(Underlying: A, constraint: (x: A) => boolean | string) {
  return runtype<Constraint<A>>(x => {
    const typed = Underlying.check(x)
    const result = constraint(typed)
    if (String.guard(result))
      throw new ValidationError(result)
    else if (!result)
      throw new ValidationError('Failed constraint check')
    return typed
  }, { tag: 'constraint', Underlying })
}

export interface Contract0<Z> {
  enforce(
    f: () => Z
  ): () => Z
}

export interface Contract1<A, Z> {
  enforce(
    f: (a: A) => Z
  ): (a: A) => Z
}

export interface Contract2<A, B, Z> {
  enforce(
    f: (a: A, b: B) => Z
  ): (a: A, b: B) => Z
}

export interface Contract3<A, B, C, Z> {
  enforce(
    f: (a: A, b: B, c: C) => Z
  ): (a: A, b: B, c: C) => Z
}

export interface Contract4<A, B, C, D, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D) => Z
  ): (a: A, b: B, c: C, d: D) => Z
}

export interface Contract5<A, B, C, D, E, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E) => Z
  ): (a: A, b: B, c: C, d: D, e: E) => Z
}

export interface Contract6<A, B, C, D, E, F, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F) => Z
}

export interface Contract7<A, B, C, D, E, F, G, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z
}

export interface Contract8<A, B, C, D, E, F, G, H, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z
}

export interface Contract9<A, B, C, D, E, F, G, H, I, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z
}

export interface Contract10<A, B, C, D, E, F, G, H, I, J, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z
}

/**
 * Create a function contract.
 */
export function Contract<Z>(
  Z: Runtype<Z>,
): Contract0<Z>
export function Contract<A, Z>(
  A: Runtype<A>,
  Z: Runtype<Z>,
): Contract1<A, Z>
export function Contract<A, B, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  Z: Runtype<Z>,
): Contract2<A, B, Z>
export function Contract<A, B, C, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  Z: Runtype<Z>,
): Contract3<A, B, C, Z>
export function Contract<A, B, C, D, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  Z: Runtype<Z>,
): Contract4<A, B, C, D, Z>
export function Contract<A, B, C, D, E, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  Z: Runtype<Z>,
): Contract5<A, B, C, D, E, Z>
export function Contract<A, B, C, D, E, F, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  Z: Runtype<Z>,
): Contract6<A, B, C, D, E, F, Z>
export function Contract<A, B, C, D, E, F, G, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  Z: Runtype<Z>,
): Contract7<A, B, C, D, E, F, G, Z>
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
): Contract8<A, B, C, D, E, F, G, H, Z>
export function Contract<A, B, C, D, E, F, G, H, I, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  H: Runtype<H>,
  I: Runtype<I>,
  Z: Runtype<Z>,
): Contract9<A, B, C, D, E, F, G, H, I, Z>
export function Contract<A, B, C, D, E, F, G, H, I, J, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  H: Runtype<H>,
  I: Runtype<I>,
  J: Runtype<J>,
  Z: Runtype<Z>,
): Contract10<A, B, C, D, E, F, G, H, I, J, Z>
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

export type Extract<O extends { [x: string]: any }> = O['x']

export type AnyRuntype =
  | Always
  | Never
  | Undefined
  | Null
  | Void
  | Boolean
  | Number
  | String
  | Literal<boolean | number | string>
  | { tag: 'array'; Element: AnyRuntype } & Runtype<always[]>
  | StringDictionary<any>
  | NumberDictionary<any>
  | Record<{ [_ in string]: AnyRuntype }>
  | Optional<{ [_ in string]: AnyRuntype }>
  | { tag: 'tuple'; Components: AnyRuntype[] } & Runtype<[always]>
  | { tag: 'union'; Alternatives: AnyRuntype[] } & Runtype<always>
  | { tag: 'intersect'; Intersectees: AnyRuntype[] } & Runtype<always>
  | Func
  | { tag: 'constraint'; Underlying: AnyRuntype } & Runtype<always>

function runtype<A extends Rt>(check: (x: {}) => Static<A>, A: any): A {

  A.check = check
  A.validate = validate
  A.guard = guard
  A.Or = Or
  A.And = And
  A.withConstraint = withConstraint
  A.toString = () => showType(A)

  return A

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

  function And<B extends Rt>(B: B): Intersect2<A, B> {
    return Intersect(A, B)
  }

  function withConstraint(constraint: (x: A) => boolean | string): Constraint<A> {
    return Constraint(A, constraint)
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
