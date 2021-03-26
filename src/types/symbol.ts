import { Runtype, create } from '../runtype';

export interface Symbol extends Runtype<symbol> {
  tag: 'symbol';
  /**
    Validates that a value is a symbol.
    @param {string} key - Specify what key the symbol is for.
   */
  <K extends string>(key: K): SymbolFor<K>;
}

export interface SymbolFor<K extends string> extends Runtype<symbol> {
  tag: 'symbol';
  key: K;
}

const f = (key: string) =>
  create<Symbol>(
    value => {
      if (typeof value !== 'symbol') {
        return {
          success: false,
          message: `Expected symbol, but was ${
            value === 'null' ? value : Array.isArray(value) ? 'array' : typeof value
          }`,
        };
      } else {
        const keyOfValue = global.Symbol.keyFor(value);
        if (keyOfValue === undefined) {
          return {
            success: false,
            message: `Expected symbol key to be "${key}", but was undefined`,
          };
        } else if (keyOfValue !== key) {
          return {
            success: false,
            message: `Expected symbol key to be "${key}", but was "${keyOfValue}"`,
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
export const Symbol = create<Symbol>(
  value =>
    typeof value === 'symbol'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected symbol, but was ${
            value === 'null' ? value : Array.isArray(value) ? 'array' : typeof value
          }`,
        },
  Object.assign(f, { tag: 'symbol' }),
);
