import { RuntypeBase } from '../runtype';
import { Array as Arr, ReadonlyArray } from './array';
import { InternalRecord, RecordFields } from './Object';
import { Record, KeyRuntypeBase, ReadonlyRecord } from './Record';
import { Tuple, ReadonlyTuple } from './tuple';

export type Readonly<T extends RuntypeBase> = T extends InternalRecord<
  infer TFields,
  infer TPartial,
  false
>
  ? InternalRecord<TFields, TPartial, true>
  : T extends Arr<infer TElement>
  ? ReadonlyArray<TElement>
  : T extends Tuple<infer TElements>
  ? ReadonlyTuple<TElements>
  : T extends Record<infer K, infer V>
  ? ReadonlyRecord<K, V>
  : unknown;

export function Readonly<TFields extends RecordFields, TPartial extends boolean>(
  input: InternalRecord<TFields, TPartial, false>,
): InternalRecord<TFields, TPartial, true>;
export function Readonly<TElement extends RuntypeBase>(
  input: Arr<TElement>,
): ReadonlyArray<TElement>;
export function Readonly<
  TElements extends readonly RuntypeBase<unknown>[] = readonly RuntypeBase<unknown>[]
>(input: Tuple<TElements>): ReadonlyTuple<TElements>;
export function Readonly<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>(
  record: Record<K, V>,
): ReadonlyRecord<K, V>;
export function Readonly(input: any): any {
  const result = { ...input };
  result.isReadonly = true;
  for (const m of [`asPartial`, `pick`, `omit`]) {
    if (typeof input[m] === 'function') {
      result[m] = (...args: any[]) => Readonly(input[m](...args));
    }
  }
  return result;
}
