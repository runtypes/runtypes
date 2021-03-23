import { Runtype } from './index';
import { ValidationError } from './errors';

export interface AsyncContract0<Z> {
  enforce(f: () => Promise<Z>): () => Promise<Z>;
}

export interface AsyncContract1<A, Z> {
  enforce(f: (a: A) => Promise<Z>): (a: A) => Promise<Z>;
}

export interface AsyncContract2<A, B, Z> {
  enforce(f: (a: A, b: B) => Promise<Z>): (a: A, b: B) => Promise<Z>;
}

export interface AsyncContract3<A, B, C, Z> {
  enforce(f: (a: A, b: B, c: C) => Promise<Z>): (a: A, b: B, c: C) => Promise<Z>;
}

export interface AsyncContract4<A, B, C, D, Z> {
  enforce(f: (a: A, b: B, c: C, d: D) => Promise<Z>): (a: A, b: B, c: C, d: D) => Promise<Z>;
}

export interface AsyncContract5<A, B, C, D, E, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E) => Promise<Z>;
}

export interface AsyncContract6<A, B, C, D, E, F, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E, f: F) => Promise<Z>;
}

export interface AsyncContract7<A, B, C, D, E, F, G, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Promise<Z>;
}

export interface AsyncContract8<A, B, C, D, E, F, G, H, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Promise<Z>;
}

export interface AsyncContract9<A, B, C, D, E, F, G, H, I, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Promise<Z>;
}

export interface AsyncContract10<A, B, C, D, E, F, G, H, I, J, Z> {
  enforce(
    f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Promise<Z>,
  ): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Promise<Z>;
}

/**
 * Create a function contract.
 */
export function AsyncContract<Z>(Z: Runtype<Z>): AsyncContract0<Z>;
export function AsyncContract<A, Z>(A: Runtype<A>, Z: Runtype<Z>): AsyncContract1<A, Z>;
export function AsyncContract<A, B, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  Z: Runtype<Z>,
): AsyncContract2<A, B, Z>;
export function AsyncContract<A, B, C, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  Z: Runtype<Z>,
): AsyncContract3<A, B, C, Z>;
export function AsyncContract<A, B, C, D, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  Z: Runtype<Z>,
): AsyncContract4<A, B, C, D, Z>;
export function AsyncContract<A, B, C, D, E, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  Z: Runtype<Z>,
): AsyncContract5<A, B, C, D, E, Z>;
export function AsyncContract<A, B, C, D, E, F, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  Z: Runtype<Z>,
): AsyncContract6<A, B, C, D, E, F, Z>;
export function AsyncContract<A, B, C, D, E, F, G, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  Z: Runtype<Z>,
): AsyncContract7<A, B, C, D, E, F, G, Z>;
export function AsyncContract<A, B, C, D, E, F, G, H, Z>(
  A: Runtype<A>,
  B: Runtype<B>,
  C: Runtype<C>,
  D: Runtype<D>,
  E: Runtype<E>,
  F: Runtype<F>,
  G: Runtype<G>,
  H: Runtype<H>,
  Z: Runtype<Z>,
): AsyncContract8<A, B, C, D, E, F, G, H, Z>;
export function AsyncContract<A, B, C, D, E, F, G, H, I, Z>(
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
): AsyncContract9<A, B, C, D, E, F, G, H, I, Z>;
export function AsyncContract<A, B, C, D, E, F, G, H, I, J, Z>(
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
): AsyncContract10<A, B, C, D, E, F, G, H, I, J, Z>;
export function AsyncContract(...runtypes: Runtype[]) {
  const lastIndex = runtypes.length - 1;
  const argTypes = runtypes.slice(0, lastIndex);
  const returnType = runtypes[lastIndex];
  return {
    enforce: (f: (...args: any[]) => any) => (...args: any[]) => {
      if (args.length < argTypes.length)
        throw new ValidationError(
          `Expected ${argTypes.length} arguments but only received ${args.length}`,
        );
      for (let i = 0; i < argTypes.length; i++) argTypes[i].check(args[i]);
      const returnedPromise = f(...args);
      if (!(returnedPromise instanceof Promise))
        throw new ValidationError(
          `Expected function to return a promise, but instead got ${returnedPromise}`,
        );
      return returnedPromise.then(returnType.check);
    },
  };
}
