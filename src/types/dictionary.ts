import { Runtype, RuntypeBase, create, Static, innerValidate } from '../runtype';
import { String } from './string';
import { Constraint } from './constraint';
import show from '../show';
import { enumerableKeysOf, FAILURE, SUCCESS } from '../util';
import { Details, Result } from '../result';
import { Optional } from './optional';

type DictionaryKeyType = string | number | symbol;
type StringLiteralFor<K extends DictionaryKeyType> = K extends string
  ? 'string'
  : K extends number
  ? 'number'
  : K extends symbol
  ? 'symbol'
  : never;
type DictionaryKeyRuntype = RuntypeBase<string | number | symbol>;

const NumberKey = Constraint(String, s => !isNaN(+s), { name: 'number' });

export interface Dictionary<V extends RuntypeBase, K extends DictionaryKeyType>
  extends Runtype<V extends Optional<any> ? { [_ in K]?: Static<V> } : { [_ in K]: Static<V> }> {
  tag: 'dictionary';
  key: StringLiteralFor<K>;
  value: V;
}

export interface StringDictionary<V extends RuntypeBase>
  extends Runtype<
    V extends Optional<any> ? { [_ in string]?: Static<V> } : { [_ in string]: Static<V> }
  > {
  tag: 'dictionary';
  key: 'string';
  value: V;
}

export interface NumberDictionary<V extends RuntypeBase>
  extends Runtype<
    V extends Optional<any> ? { [_ in number]?: Static<V> } : { [_ in number]: Static<V> }
  > {
  tag: 'dictionary';
  key: 'number';
  value: V;
}

/**
 * Construct a runtype for arbitrary dictionaries.
 * @param value - A `Runtype` for value.
 * @param [key] - A `Runtype` for key.
 */
export function Dictionary<V extends RuntypeBase, K extends DictionaryKeyRuntype>(
  value: V,
  key?: K,
): Dictionary<V, Static<K>>;

/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export function Dictionary<V extends RuntypeBase>(value: V, key: 'string'): StringDictionary<V>;

/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export function Dictionary<V extends RuntypeBase>(value: V, key: 'number'): NumberDictionary<V>;

export function Dictionary<
  V extends RuntypeBase,
  K extends DictionaryKeyRuntype | 'string' | 'number'
>(
  value: V,
  key?: K,
): K extends DictionaryKeyRuntype
  ? Dictionary<V, Static<K>>
  : K extends 'string'
  ? StringDictionary<V>
  : K extends 'number'
  ? NumberDictionary<V>
  : never {
  const keyRuntype =
    key === undefined
      ? String
      : key === 'string'
      ? String
      : key === 'number'
      ? NumberKey
      : (key as Exclude<K, string>);
  const keyString = show(keyRuntype as any);
  const self = { tag: 'dictionary', key: keyString, value } as any;
  return create<any>((x, visited) => {
    if (x === null || x === undefined || typeof x !== 'object')
      return FAILURE.TYPE_INCORRECT(self, x);

    if (Object.getPrototypeOf(x) !== Object.prototype)
      if (!Array.isArray(x) || keyString === 'string') return FAILURE.TYPE_INCORRECT(self, x);

    const numberString = /^(?:NaN|-?\d+(?:\.\d+)?)$/;
    const keys = enumerableKeysOf(x);
    const results = keys.reduce<{ [key in string | number | symbol]: Result<unknown> }>(
      (results, key) => {
        // We should provide interoperability with `number` and `string` here,
        // as a user would expect JavaScript engines to convert numeric keys to
        // string keys automatically. So, if the key can be interpreted as a
        // decimal number, then test it against a `Number` OR `String` runtype.
        const isNumberLikeKey = typeof key === 'string' && numberString.test(key);
        const keyInterop = isNumberLikeKey ? globalThis.Number(key) : key;
        if (
          isNumberLikeKey
            ? !keyRuntype.guard(keyInterop) && !keyRuntype.guard(key)
            : !keyRuntype.guard(keyInterop)
        ) {
          results[key as any] = FAILURE.KEY_INCORRECT(self, keyRuntype.reflect, keyInterop);
        } else results[key as any] = innerValidate(value, x[key], visited);
        return results;
      },
      {},
    );

    const details = keys.reduce<{ [key in string | number | symbol]: string | Details }>(
      (details, key) => {
        const result = results[key as any];
        if (!result.success) details[key as any] = result.details || result.message;
        return details;
      },
      {},
    );

    if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details);
    else return SUCCESS(x);
  }, self);
}
