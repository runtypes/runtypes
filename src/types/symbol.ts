import { Runtype, create } from '../runtype';

export interface Symbol extends Runtype<symbol> {
  tag: 'symbol';
  /**
    Validates that a value is a symbol with a specific key or without any key.
    @param {string | undefined} key - Specify what key the symbol is for. If you want to ensure the validated symbol is *not* keyed, pass `undefined`.
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
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
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
