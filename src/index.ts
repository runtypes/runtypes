export type Success<A> = {
  success: true
  value: A
}

export type Failure = {
  success: false
  message: string
}

export type Result<A> = Success<A> | Failure

export type Validator<A> = {
  falseWitness: A
  coerce(x: {}): A
  validate(x: {}): Result<A>
  guard(x: {}): x is A
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

export const anything: Validator<{}> = validator(x => x)

export const nothing: Validator<never> = validator(x => {
  throw new ValidationError('Expected nothing but got something')
})

export const boolean: Validator<boolean> = validator(x => {
  if (typeof x !== 'boolean')
    throw new ValidationError(`Expected boolean but was ${typeof x}`)
  return x
})

export const number: Validator<number> = validator(x => {
  if (typeof x !== 'number')
    throw new ValidationError(`Expected number but was ${typeof x}`)
  return x
})

export const string: Validator<string> = validator(x => {
  if (typeof x !== 'string')
    throw new ValidationError(`Expected string but was ${typeof x}`)
  return x
})

export function literal<K extends string|number|boolean>(l: K): Validator<K> {
  return validator(x => {
    if (x !== l)
      throw new ValidationError(`Expected literal '${l}' but was '${x}'`)
    return x as K
  })
}

export function array<A>(v: Validator<A>): Validator<A[]> {
  return validator(xs => {
    if (!(xs instanceof Array))
      throw new ValidationError(`Expected array but was ${typeof xs}`)
    for (const x of xs)
      v.coerce(x)
    return xs
  })
}

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

export function record<O>(validators: { [K in keyof O]: Validator<O[K]> }): Validator<O> {
  return validator<O>(x => {
    if (typeof x !== 'object')
      throw new ValidationError(`Expected object but was ${typeof x}`)

    // tslint:disable-next-line:forin
    for (const key in validators)
      validators[key].coerce((x as any)[key])

    return x as O
  })
}

export function union(
): Validator<never>
export function union<A>(
  a: Validator<A>,
): Validator<A>
export function union<A, B>(
  a: Validator<A>,
  b: Validator<B>,
): Validator<A|B>
export function union<A, B, C>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
): Validator<A|B|C>
export function union<A, B, C, D>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
): Validator<A|B|C|D>
export function union<A, B, C, D, E>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
): Validator<A|B|C|D|E>
export function union<A, B, C, D, E, F>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
): Validator<A|B|C|D|E|F>
export function union<A, B, C, D, E, F, G>(
  a: Validator<A>,
  b: Validator<B>,
  c: Validator<C>,
  d: Validator<D>,
  e: Validator<E>,
  f: Validator<F>,
  g: Validator<G>,
): Validator<A|B|C|D|E|F|G>
export function union(...validators: Validator<any>[]) {
  return validator(x => {
    for (const { guard } of validators)
      if (guard(x))
        return x
    throw new Error('No alternatives were matched')
  })
}
