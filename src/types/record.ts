import { Runtype, Static, createIncremental, validationError } from '../runtype';
import { hasKey } from '../util';

export interface Record<O extends { [_ in string]: Runtype }>
  extends Runtype<{ [K in keyof O]: Static<O[K]> }> {
  tag: 'record';
  fields: O;
}

/**
 * Construct a record runtype from runtypes for its values.
 */
export function Record<O extends { [_: string]: Runtype }>(fields: O) {
  return createIncremental<Record<O>>(
    function*(x) {
      if (x === null || x === undefined)
        yield `Expected a defined non-null value but was ${typeof x}`;

      for (const key in fields) if (!hasKey(key, x)) yield `Missing property ${key}`;

      const checkers = Object.keys(fields).map(key => [key, fields[key]._checker(x[key])]);

      for (const [key, checker] of checkers)
        for (const message of checker)
          yield message === undefined ? undefined : `In key ${key}: ${message}`;
    },
    { tag: 'record', fields },
  );
}
