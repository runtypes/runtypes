import { Static, create, RuntypeBase, Codec, createValidationPlaceholder } from '../runtype';
import { hasKey } from '../util';
import show from '../show';

export type RecordFields = { readonly [_: string]: RuntypeBase<unknown> };
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
> extends Codec<RecordStaticType<O, IsPartial, IsReadonly>> {
  readonly tag: 'object';
  readonly fields: O;
  readonly isPartial: IsPartial;
  readonly isReadonly: IsReadonly;
  asPartial(): Partial<O, IsReadonly>;
  asReadonly(): IsPartial extends false ? Obj<O, true> : Partial<O, true>;
}

export { Obj as Object };
type Obj<O extends RecordFields, IsReadonly extends boolean> = InternalRecord<O, false, IsReadonly>;

export type Partial<O extends RecordFields, IsReadonly extends boolean> = InternalRecord<
  O,
  true,
  IsReadonly
>;

export function isObjectRuntype(
  runtype: RuntypeBase,
): runtype is InternalRecord<RecordFields, boolean, boolean> {
  return (
    'tag' in runtype && (runtype as InternalRecord<RecordFields, boolean, boolean>).tag === 'object'
  );
}

/**
 * Construct an object runtype from runtypes for its values.
 */
export function InternalObject<O extends RecordFields, Part extends boolean, RO extends boolean>(
  fields: O,
  isPartial: Part,
  isReadonly: RO,
): InternalRecord<O, Part, RO> {
  const runtype: InternalRecord<O, Part, RO> = create<InternalRecord<O, Part, RO>>(
    (x, innerValidate) => {
      if (x === null || x === undefined) {
        return { success: false, message: `Expected ${show(runtype)}, but was ${x}` };
      }
      if (typeof x !== 'object') {
        return { success: false, message: `Expected ${show(runtype)}, but was ${typeof x}` };
      }
      if (Array.isArray(x)) {
        return { success: false, message: `Expected ${show(runtype)}, but was an Array` };
      }

      return createValidationPlaceholder({} as any, (placeholder: any) => {
        for (const key in fields) {
          if (!isPartial || (hasKey(key, x) && x[key] !== undefined)) {
            const value = isPartial || hasKey(key, x) ? x[key] : undefined;
            let validated = innerValidate(fields[key], value);
            if (!validated.success) {
              return {
                success: false,
                message: validated.message,
                key: validated.key ? `${key}.${validated.key}` : key,
              };
            }
            placeholder[key] = validated.value;
          }
        }
      });
    },
    {
      tag: 'object',
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
    return InternalObject(runtype.fields, true, runtype.isReadonly);
  }

  function asReadonly(): any {
    return InternalObject(runtype.fields, runtype.isPartial, true);
  }
}

function Obj<O extends RecordFields>(fields: O): Obj<O, false> {
  return InternalObject(fields, false, false);
}

export function Partial<O extends RecordFields>(fields: O): Partial<O, false> {
  return InternalObject(fields, true, false);
}
