import { String, Number, Record } from '..';
import { RuntypeBase } from '../runtype';

export interface StringDictionary<V extends RuntypeBase> extends Record<String, V> {}

export interface NumberDictionary<V extends RuntypeBase> extends Record<Number, V> {}

/**
 * @deprecated use Record(String, value)
 */
export function Dictionary<V extends RuntypeBase>(value: V, key?: 'string'): StringDictionary<V>;
/**
 * @deprecated use Record(Number, value)
 */
export function Dictionary<V extends RuntypeBase>(value: V, key?: 'number'): NumberDictionary<V>;
export function Dictionary<V extends RuntypeBase>(
  value: V,
  key: 'number' | 'string' = 'string',
): Record<String | Number, V> {
  return Record(key === 'number' ? Number : String, value);
}
