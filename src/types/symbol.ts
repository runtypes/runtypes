import { Runtype, create } from '../runtype';

export interface Symbol extends Runtype<symbol> {
  tag: 'symbol';
  /**
    Validates that a value is a symbol.
    @param {string} key - Specify what key the symbol is for.
   */
  <K extends string | undefined>(key: K): SymbolFor<K>;
}

export interface SymbolFor<K extends string | undefined> extends Runtype<symbol> {
  tag: 'symbol';
  key: K;
}

const f = (key: string | undefined) =>
  create<Symbol>(
    value => {
      if (typeof value !== 'symbol') {
        return {
          success: false,
          message: `Expected symbol, but was ${typeStringOf(value)}`,
        };
      } else {
        const keyForValue = global.Symbol.keyFor(value);
        if (keyForValue !== key) {
          return {
            success: false,
            message: `Expected symbol key to be ${quoteIfPresent(key)}, but was ${quoteIfPresent(
              keyForValue,
            )}`,
          };
        } else {
          return { success: true, value };
        }
      }
    },
    { tag: 'symbol', key },
  );

/**
 * Validates that a value is a symbol.
 */
export const Symbol = create<Symbol>(value => {
  if (typeof value !== 'symbol') {
    return {
      success: false,
      message: `Expected symbol, but was ${typeStringOf(value)}`,
    };
  } else {
    return { success: true, value };
  }
}, Object.assign(f, { tag: 'symbol' }));

const quoteIfPresent = (key: string | undefined) => (key === undefined ? 'undefined' : `"${key}"`);

const typeStringOf = (value: unknown) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
