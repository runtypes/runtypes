import { Runtype, Static, create, innerValidate } from '../runtype';
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
    (x, visited) => {
      if (x === null || x === undefined) {
        const a = create<any>(_x => ({ success: true, value: _x }), { tag: 'partial', fields });
        return { success: false, message: `Expected ${show(a)}, but was ${x}` };
      }

      for (const key in fields) {
        if (hasKey(key, x) && x[key] !== undefined) {
          let validated = innerValidate(fields[key], x[key], visited);
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
    { tag: 'partial', fields },
  );
}

export { Part as Partial };
