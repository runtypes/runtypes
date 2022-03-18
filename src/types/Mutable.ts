import { RuntypeBase } from '../runtype';
import { Array as Arr, ReadonlyArray } from './array';
import { InternalRecord, RecordFields } from './Object';
import { Record, KeyRuntypeBase, ReadonlyRecord } from './Record';
import { Tuple, ReadonlyTuple } from './tuple';

export type Mutable<T extends RuntypeBase> = T extends InternalRecord<
  infer TFields,
  infer TPartial,
  true
>
  ? InternalRecord<TFields, TPartial, false>
  : T extends ReadonlyArray<infer TElement>
  ? Arr<TElement>
  : T extends ReadonlyTuple<infer TElements>
  ? Tuple<TElements>
  : T extends ReadonlyRecord<infer K, infer V>
  ? Record<K, V>
  : unknown;

export function Mutable<TFields extends RecordFields, TPartial extends boolean>(
  input: InternalRecord<TFields, TPartial, true>,
): InternalRecord<TFields, TPartial, false>;
export function Mutable<TElement extends RuntypeBase>(
  input: ReadonlyArray<TElement>,
): Arr<TElement>;
export function Mutable<TElements extends RuntypeBase<unknown>[] = RuntypeBase<unknown>[]>(
  input: ReadonlyTuple<TElements>,
): Tuple<TElements>;
export function Mutable<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>(
  record: ReadonlyRecord<K, V>,
): Record<K, V>;
export function Mutable(input: any): any {
  const result = { ...input };
  result.isReadonly = false;
  for (const m of [`asPartial`, `pick`, `omit`]) {
    if (typeof input[m] === 'function') {
      result[m] = (...args: any[]) => Mutable(input[m](...args));
    }
  }
  return result;
}
