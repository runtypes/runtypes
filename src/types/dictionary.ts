import { Runtype, create, Static, innerValidate } from '../runtype';
import { String } from './string';
import { Constraint } from './constraint';
import show from '../show';

export type DictionaryKeyType = string | number | symbol;
export type StringLiteralFor<K extends DictionaryKeyType> = K extends string
  ? 'string'
  : K extends number
  ? 'number'
  : K extends symbol
  ? 'symbol'
  : never;
export type TypeFor<K extends StringLiteralFor<DictionaryKeyType>> = K extends 'string'
  ? string
  : K extends 'number'
  ? number
  : K extends 'symbol'
  ? symbol
  : never;
export type DictionaryKeyRuntype = Runtype<string> | Runtype<number> | Runtype<symbol>;

const NumberKey = Constraint(String, s => !isNaN(+s), { name: 'number' });

export interface Dictionary<V extends Runtype, K extends DictionaryKeyType>
  extends Runtype<{ [_ in K]: Static<V> }> {
  tag: 'dictionary';
  key: StringLiteralFor<K>;
  value: V;
}

export interface StringDictionary<V extends Runtype> extends Runtype<{ [_: string]: Static<V> }> {
  tag: 'dictionary';
  key: 'string';
  value: V;
}

export interface NumberDictionary<V extends Runtype> extends Runtype<{ [_: number]: Static<V> }> {
  tag: 'dictionary';
  key: 'number';
  value: V;
}

/**
 * Construct a runtype for arbitrary dictionaries.
 * @param value - A `Runtype` for value.
 * @param [key] - A `Runtype` for key.
 */
export function Dictionary<V extends Runtype, K extends DictionaryKeyRuntype>(
  value: V,
  key?: K,
): Dictionary<V, Static<K>>;

/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export function Dictionary<V extends Runtype>(value: V, key: 'string'): StringDictionary<V>;

/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export function Dictionary<V extends Runtype>(value: V, key: 'number'): NumberDictionary<V>;

export function Dictionary<V extends Runtype, K extends DictionaryKeyRuntype | 'string' | 'number'>(
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
  return create<any>(
    (x, visited) => {
      if (x === null || x === undefined) {
        const a = create<any>(x as never, { tag: 'dictionary', key: keyString, value });
        return { success: false, message: `Expected ${show(a)}, but was ${x}` };
      }

      if (typeof x !== 'object') {
        const a = create<any>(x as never, { tag: 'dictionary', key: keyString, value });
        return { success: false, message: `Expected ${show(a.reflect)}, but was ${typeof x}` };
      }

      if (Object.getPrototypeOf(x) !== Object.prototype) {
        if (!Array.isArray(x)) {
          const a = create<any>(x as never, { tag: 'dictionary', key: keyString, value });
          return {
            success: false,
            message: `Expected ${show(a.reflect)}, but was ${Object.getPrototypeOf(x)}`,
          };
        } else if (keyString === 'string')
          return { success: false, message: 'Expected dictionary, but was array' };
      }

      for (const k of [...Object.getOwnPropertyNames(x), ...Object.getOwnPropertySymbols(x)]) {
        if (!keyRuntype.guard(k)) {
          return {
            success: false,
            message: `Expected dictionary key to be a ${keyString}, but was ${typeof k}`,
          };
        }

        const validated = innerValidate(value, x[k], visited);
        if (!validated.success) {
          return {
            success: false,
            message: validated.message,
            key: validated.key ? `${global.String(k)}.${validated.key}` : global.String(k),
          };
        }
      }

      return { success: true, value: x };
    },
    { tag: 'dictionary', key: keyString, value },
  );
}
