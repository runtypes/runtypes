import { Static, create, innerValidate, RuntypeBase, Runtype } from '../runtype';
import { hasKey } from '../util';
import show from '../show';

type RecordFields = { readonly [_: string]: RuntypeBase<unknown> };
type RecordStaticType<
  O extends RecordFields,
  IsPartial extends boolean,
  IsReadonly extends boolean
> = IsPartial extends false
  ? IsReadonly extends false
    ? { -readonly [K in keyof O]: Static<O[K]> }
    : { readonly [K in keyof O]: Static<O[K]> }
  : IsReadonly extends false
  ? { -readonly [K in keyof O]?: Static<O[K]> }
  : { readonly [K in keyof O]?: Static<O[K]> };

export interface InternalRecord<
  O extends RecordFields,
  IsPartial extends boolean,
  IsReadonly extends boolean
> extends Runtype<RecordStaticType<O, IsPartial, IsReadonly>> {
  readonly tag: 'record';
  readonly fields: O;
  readonly isPartial: IsPartial;
  readonly isReadonly: IsReadonly;
  asPartial(): Partial<O, IsReadonly>;
  asReadonly(): IsPartial extends false ? Record<O, true> : Partial<O, true>;
}

export type Record<O extends RecordFields, IsReadonly extends boolean> = InternalRecord<
  O,
  false,
  IsReadonly
>;

export type Partial<O extends RecordFields, IsReadonly extends boolean> = InternalRecord<
  O,
  true,
  IsReadonly
>;

export function isRecordRuntype(
  runtype: RuntypeBase,
): runtype is InternalRecord<RecordFields, boolean, boolean> {
  return (
    'tag' in runtype && (runtype as InternalRecord<RecordFields, boolean, boolean>).tag === 'record'
  );
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function InternalRecord<O extends RecordFields, Part extends boolean, RO extends boolean>(
  fields: O,
  isPartial: Part,
  isReadonly: RO,
): InternalRecord<O, Part, RO> {
  const runtype: InternalRecord<O, Part, RO> = create<InternalRecord<O, Part, RO>>(
    (x, visited) => {
      if (x === null || x === undefined) {
        return { success: false, message: `Expected ${show(runtype)}, but was ${x}` };
      }
      if (typeof x !== 'object') {
        return { success: false, message: `Expected ${show(runtype)}, but was ${typeof x}` };
      }
      if (Array.isArray(x)) {
        return { success: false, message: `Expected ${show(runtype)}, but was an Array` };
      }

      for (const key in fields) {
        if (!isPartial || (hasKey(key, x) && x[key] !== undefined)) {
          const value = isPartial || hasKey(key, x) ? x[key] : undefined;
          let validated = innerValidate(fields[key], value, visited);
          if (!validated.success) {
            return {
              success: false,
              message: validated.message,
              key: validated.key ? `${key}.${validated.key}` : key,
            };
          }
        }
      }

      return { success: true, value: x };
    },
    {
      tag: 'record',
      isPartial,
      isReadonly,
      fields,
      asPartial,
      asReadonly,
      show({ showChild }) {
        const keys = Object.keys(fields);
        return keys.length
          ? `{ ${keys
              .map(
                k =>
                  `${isReadonly ? 'readonly ' : ''}${k}${isPartial ? '?' : ''}: ${showChild(
                    fields[k],
                    false,
                  )};`,
              )
              .join(' ')} }`
          : '{}';
      },
    },
  );

  return runtype;

  function asPartial() {
    return InternalRecord(runtype.fields, true, runtype.isReadonly);
  }

  function asReadonly(): any {
    return InternalRecord(runtype.fields, runtype.isPartial, true);
  }
}

export function Record<O extends RecordFields>(fields: O): Record<O, false> {
  return InternalRecord(fields, false, false);
}

export function Partial<O extends RecordFields>(fields: O): Partial<O, false> {
  return InternalRecord(fields, true, false);
}
