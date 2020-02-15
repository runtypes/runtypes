import { Runtype, Static, create, innerValidate } from '../runtype';
import { hasKey } from '../util';
import show from '../show';

type RecordStaticType<O extends { [_: string]: Runtype }, RO extends boolean> = RO extends true
  ? { readonly [K in keyof O]: Static<O[K]> }
  : { [K in keyof O]: Static<O[K]> };

export interface Record<O extends { [_: string]: Runtype }, RO extends boolean>
  extends Runtype<RecordStaticType<O, RO>> {
  tag: 'record';
  fields: O;
  isReadonly: RO;

  asReadonly(): Record<O, true>;
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function InternalRecord<O extends { [_: string]: Runtype }, RO extends boolean>(
  fields: O,
  isReadonly: RO,
): Record<O, RO> {
  return withExtraModifierFuncs(
    create(
      (x, visited) => {
        if (x === null || x === undefined) {
          const a = create<any>(_x => ({ success: true, value: _x }), { tag: 'record', fields });
          return { success: false, message: `Expected ${show(a)}, but was ${x}` };
        }

        for (const key in fields) {
          let validated = innerValidate(fields[key], hasKey(key, x) ? x[key] : undefined, visited);
          if (!validated.success) {
            return {
              success: false,
              message: validated.message,
              key: validated.key ? `${key}.${validated.key}` : key,
            };
          }
        }

        return { success: true, value: x };
      },
      { tag: 'record', isReadonly, fields },
    ),
  );
}

export function Record<O extends { [_: string]: Runtype }>(fields: O): Record<O, false> {
  return InternalRecord(fields, false);
}

function withExtraModifierFuncs<O extends { [_: string]: Runtype }, RO extends boolean>(
  A: any,
): Record<O, RO> {
  A.asReadonly = asReadonly;

  return A;

  function asReadonly() {
    return InternalRecord(A.fields, true);
  }
}
