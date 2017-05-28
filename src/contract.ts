import { Runtype, Tuple, ConstraintCheck, ConstraintCorrection, ConstraintRightInverse } from './index'
import { validationError } from './runtype'


export interface Contract0<Z> {
  enforce(
    f: () => Z
  ): () => Z,
  withConstraint(constraint: ConstraintCheck<void>): Contract0<Z>
}

export interface Contract1<A, Z> {
  enforce(
    f: (a: A) => Z
  ): (a: A) => Z,
  withConstraint(constraint: ConstraintCheck<[A]>, correction?: ConstraintCorrection<[A]>, rightInverse?: ConstraintRightInverse<[A]>): Contract1<A, Z>
}

export interface Contract2<A, B, Z> {
  enforce(
    f: (a: A, b: B) => Z
  ): (a: A, b: B) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B]>, correction?: ConstraintCorrection<[A, B]>, rightInverse?: ConstraintRightInverse<[A, B]>): Contract2<A, B, Z>
}

export interface Contract3<A, B, C, Z> {
  enforce(
    f: (a: A, b: B, c: C) => Z
  ): (a: A, b: B, c: C) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C]>): Contract3<A, B, C, Z>

}

export interface Contract4<A, B, C, D, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D) => Z
  ): (a: A, b: B, c: C, d: D) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D]>, correction?: ConstraintCorrection<[A, B, C, D]>, rightInverse?: ConstraintRightInverse<[A, B, C, D]>): Contract4<A, B, C, D, Z>
}

export interface Contract5<A, B, C, D, E, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E) => Z
  ): (a: A, b: B, c: C, d: D, e: E) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E]>, correction?: ConstraintCorrection<[A, B, C, D, E]>, rightInverse?: ConstraintRightInverse<[A, B, C, D, E]>): Contract5<A, B, C, D, E, Z>
}

export interface Contract6<A, B, C, D, E, F, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E, F]>): Contract6<A, B, C, D, E, F, Z>
}

export interface Contract7<A, B, C, D, E, F, G, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E, F, G]>, correction?: ConstraintCorrection<[A, B, C, D, E, F, G]>, rightInverse?: ConstraintRightInverse<[A, B, C, D, E, F, G]>): Contract7<A, B, C, D, E, F, G, Z>
}

export interface Contract8<A, B, C, D, E, F, G, H, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E, F, G, H]>): Contract8<A, B, C, D, E, F, G, H, Z>
}

export interface Contract9<A, B, C, D, E, F, G, H, I, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E, F, G, H, I]>, correction?: ConstraintCorrection<[A, B, C, D, E, F, G, H, I]>, rightInverse?: ConstraintRightInverse<[A, B, C, D, E, F, G, H, I]>): Contract9<A, B, C, D, E, F, G, H, I, Z>
}

export interface Contract10<A, B, C, D, E, F, G, H, I, J, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z,
  withConstraint(constraint: ConstraintCheck<[A, B, C, D, E, F, G, H, I, J]>, correction?: ConstraintCorrection<[A, B, C, D, E, F, G, H, I, J]>, rightInverse?: ConstraintRightInverse<[A, B, C, D, E, F, G, H, I, J]>): Contract10<A, B, C, D, E, F, G, H, I, J, Z>
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
  let argsTuple = Tuple.apply(null, argTypes)

  const result = {
    tag: 'contract',
    argTypes: argsTuple,
    returnType,
    withConstraint: (...args: any[]) => {
      argsTuple = argsTuple.withConstraint(...args)
      result.argTypes = argsTuple
      return result;
    },
    enforce: (f: (...args: any[]) => any) => (...args: any[]) => {
      if (args.length < argTypes.length)
        throw validationError(`Expected ${argTypes.length} arguments but only received ${args.length}`)
      argsTuple.check(args);
      return returnType.check(f(...args))
    }
  }
  return result;
}

