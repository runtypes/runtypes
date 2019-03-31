import { Runtype, Static, create } from '../runtype';
import { hasKey } from '../util';
import show from '../show';
import { ValidationError } from '../errors';

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
      x => {
        if (x === null || x === undefined) {
          const a = create<any>(x, { tag: 'record', fields });
          throw new ValidationError(`Expected ${show(a)}, but was ${x}`);
        }

        // tslint:disable-next-line:forin
        for (const key in fields) {
          try {
            fields[key].check(hasKey(key, x) ? x[key] : undefined);
          } catch ({ key: nestedKey, message }) {
            throw new ValidationError(message, nestedKey ? `${key}.${nestedKey}` : key);
          }
        }

        return x;
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
