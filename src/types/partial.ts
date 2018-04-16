import { Runtype, Static, create, validationError } from '../runtype';
import { Union } from '../index';
import { Undefined } from './literal';
import { hasKey } from '../util';
import show from '../show';

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
        const a = create<any>(x, { tag: 'partial', fields });
        throw validationError(`Expected a ${show(a)} value but was ${x}`);
      }

      // tslint:disable-next-line:forin
      for (const key in fields)
        if (hasKey(key, x)) {
          let FieldType = Union(fields[key], Undefined);
          try {
            FieldType.check(x[key]);
          } catch ({ key: nestedKey }) {
            throw validationError(
              `Expected ${show(FieldType.reflect)}, got ${JSON.stringify(x[key])}`,
              nestedKey ? `${key}.${nestedKey}` : key,
            );
          }
        }

      return x as Partial<O>;
    },
    { tag: 'partial', fields },
  );
}

export { Part as Partial };
