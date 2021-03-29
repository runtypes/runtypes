import { Failcode } from '../result';
import { Runtype, create } from '../runtype';
import { FAILURE, SUCCESS, typeOf } from '../util';

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
      if (typeof value !== 'symbol')
        return FAILURE(Failcode.TYPE_INCORRECT, `Expected symbol, but was ${typeOf(value)}`);
      else {
        const keyForValue = global.Symbol.keyFor(value);
        if (keyForValue !== key)
          return FAILURE(
            Failcode.VALUE_INCORRECT,
            `Expected symbol key to be ${quoteIfPresent(key)}, but was ${quoteIfPresent(
              keyForValue,
            )}`,
          );
        else return SUCCESS(value);
      }
    },
    { tag: 'symbol', key },
  );

/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
export const Symbol = create<Symbol>(value => {
  if (typeof value !== 'symbol')
    return FAILURE(Failcode.TYPE_INCORRECT, `Expected symbol, but was ${typeOf(value)}`);
  else return SUCCESS(value);
}, Object.assign(f, { tag: 'symbol' }));

const quoteIfPresent = (key: string | undefined) => (key === undefined ? 'undefined' : `"${key}"`);
