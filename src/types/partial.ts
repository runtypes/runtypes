import { Runtype, Static, create } from '../runtype';
import { hasKey } from '../util';
import show from '../show';
import { ValidationError } from '../errors';

export interface Part<O extends { [_: string]: Runtype }>
  extends Runtype<{ [K in keyof O]?: Static<O[K]> }> {
  tag: 'partial';
  fields: O;
}

/**
 * Construct a runtype for partial records
 */
export function Part<O extends { [_: string]: Runtype }>(fields: O) {
  return create<Part<O>>(
    x => {
      if (x === null || x === undefined) {
        const a = create<any>(x => x, { tag: 'partial', fields });
        throw new ValidationError(`Expected ${show(a)}, but was ${x}`);
      }

      // tslint:disable-next-line:forin
      for (const key in fields) {
        if (hasKey(key, x) && x[key] !== undefined) {
          try {
            fields[key].check(x[key]);
          } catch ({ message, key: nestedKey }) {
            throw new ValidationError(message, nestedKey ? `${key}.${nestedKey}` : key);
          }
        }
      }

      return x as Partial<O>;
    },
    { tag: 'partial', fields },
  );
}

export { Part as Partial };
