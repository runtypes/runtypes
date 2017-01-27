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
 * A validator determines whether a value conforms to a type specification.
 */
export type Validator<A> = {
  /**
   * Attempts to cast a value to the type for this validator and return it.
   * Throws an exception if validation fails.
   */
  coerce(x: {}): A

  /**
   * Validates that a value conforms to the type of this validator, and
   * returns a result indicating success or failure (does not throw).
   */
  validate(x: {}): Result<A>

  /**
   * A type guard for the type that this validator validates.
   */
  guard(x: {}): x is A

  /**
   * Provides a way to reference the constructed type that this validator
   * validates.
   */
  falseWitness: A
}

/**
 * Validates anything, but provides no new type information about it.
 */
export const anything: Validator<{}> = validator(x => x)

/**
 * Validates nothing (always fails).
 */
export const nothing: Validator<never> = validator(x => {
  throw new ValidationError('Expected nothing but got something')
})

/**
 * Validates that a value is a boolean.
 */
export const boolean: Validator<boolean> = validator(x => {
  if (typeof x !== 'boolean')
    throw new ValidationError(`Expected boolean but was ${typeof x}`)
  return x
})

/**
 * Validates that a value is a number.
 */
export const number: Validator<number> = validator(x => {
  if (typeof x !== 'number')
    throw new ValidationError(`Expected number but was ${typeof x}`)
  return x
})

/**
 * Validates that a value is a string.
 */
export const string: Validator<string> = validator(x => {
  if (typeof x !== 'string')
    throw new ValidationError(`Expected string but was ${typeof x}`)
  return x
})

/**
 * Construct a validator of literals.
 */
export function literal<K extends string | number | boolean>(l: K): Validator<K> {
  return validator(x => {
    if (x !== l)
      throw new ValidationError(`Expected literal '${l}' but was '${x}'`)
    return x as K
  })
}

/**
 * Construct a validator of arrays from a validator for its elements.
 */
export function array<A>(v: Validator<A>): Validator<A[]> {
  return validator(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      v.coerce(x)
    return xs
  })
}

/**
 * Construct a validator of tuples from validators for its elements.
 */
export function tuple<A>(
  a: Validator<A>,
  strict?: boolean
): Validator<[A]>
export function tuple<A, B>(
  a: Validator<A>,
  b: Validator<B>,
  strict?: boolean
): Validator<[A, B]>
export function tuple<A, B, C>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  strict?: boolean
): Validator<[A, B, C]>
export function tuple<A, B, C, D>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  strict?: boolean
): Validator<[A, B, C, D]>
export function tuple<A, B, C, D, E>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  strict?: boolean
): Validator<[A, B, C, D, E]>
export function tuple<A, B, C, D, E, F>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
  strict?: boolean
): Validator<[A, B, C, D, E, F]>
export function tuple<A, B, C, D, E, F, G>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
  g: Validator<G>,
  strict?: boolean
): Validator<[A, B, C, D, E, F, G]>
export function tuple(...args: any[]) {
  const lastArg = args[args.length - 1]
  let strict: boolean
  let validators: Validator<{}>[]
  if (boolean.guard(lastArg)) {
    strict = lastArg
    validators = args.slice(0, args.length - 1)
  } else {
    strict = false
    validators = args
  }
  return validator(x => {
    const xs = array(anything).coerce(x)
    if (strict ? xs.length !== validators.length : xs.length < validators.length)
      throw new ValidationError(`Expected array of ${validators.length} but was ${xs.length}`)
    for (let i = 0; i < validators.length; i++)
      validators[i].coerce(xs[i])
    return x
  })
}

/**
 * Construct a validator of records from validators for its values.
 */
export function record<O>(validators: {[K in keyof O]: Validator<O[K]> }): Validator<O> {
  return validator<O>(x => {
    if (typeof x !== 'object')
      throw new ValidationError(`Expected object but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in validators)
      validators[key].coerce((x as any)[key])

    return x as O
  })
}

/**
 * Construct a validator of unions from validators for its alternatives.
 */
export function union(
): Validator<never>
export function union<A>(
  a: Validator<A>,
): Validator<A>
export function union<A, B>(
  a: Validator<A>,
  b: Validator<B>,
): Validator<A | B>
export function union<A, B, C>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
): Validator<A | B | C>
export function union<A, B, C, D>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
): Validator<A | B | C | D>
export function union<A, B, C, D, E>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
): Validator<A | B | C | D | E>
export function union<A, B, C, D, E, F>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
): Validator<A | B | C | D | E | F>
export function union<A, B, C, D, E, F, G>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
  g: Validator<G>,
): Validator<A | B | C | D | E | F | G>
export function union(...validators: Validator<any>[]) {
  return validator(x => {
    for (const { guard } of validators)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  })
}

function validator<A>(coerce: (x: {}) => A) {
  let falseWitness: A = undefined as any as A

  return { coerce, validate, guard, falseWitness }

  function validate(value: any): Result<A> {
    try {
      coerce(value)
      return { success: true, value }
    } catch ({ message }) {
      return { success: false, message }
    }
  }

  function guard(x: any): x is A {
    return validate(x).success
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
  }
}
