import { Runtype, create, validationError } from '../runtype';

export const __global = Function('return this')();

export interface Symbol extends Runtype<symbol> {
  tag: 'symbol';
}

/**
 * Validates that a value is a symbol.
 */
export const Symbol = create<Symbol>(
  x => {
    if (typeof x !== 'symbol')
      throw validationError(
        `Expected symbol, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'symbol' },
);
