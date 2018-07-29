import { Runtype, Static, create, validationError } from '../runtype';
import { hasKey } from '../util';
import show from '../show';

export interface Record<O extends { [_: string]: Runtype }>
  extends Runtype<{ [K in keyof O]: Static<O[K]> }> {
  tag: 'record';
  fields: O;
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function Record<O extends { [_: string]: Runtype }>(fields: O) {
  return create<Record<O>>(
    x => {
      if (x === null || x === undefined) {
        const a = create<any>(x, { tag: 'record', fields });
        throw validationError(`Expected ${show(a)}, but was ${x}`);
      }

      // tslint:disable-next-line:forin
      for (const key in fields) {
        try {
          fields[key].check(hasKey(key, x) ? x[key] : undefined);
        } catch ({ key: nestedKey, message }) {
          throw validationError(message, nestedKey ? `${key}.${nestedKey}` : key);
        }
      }

      return x as O;
    },
    { tag: 'record', fields },
  );
}
