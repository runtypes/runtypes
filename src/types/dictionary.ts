import { Runtype, create, Static } from '../runtype';
import show from '../show';
import { ValidationError } from '../errors';

export interface StringDictionary<V extends Runtype> extends Runtype<{ [_: string]: Static<V> }> {
  tag: 'dictionary';
  key: 'string';
  value: V;
}

export interface NumberDictionary<V extends Runtype> extends Runtype<{ [_: number]: Static<V> }> {
  tag: 'dictionary';
  key: 'number';
  value: V;
}

/**
 * Construct a runtype for arbitrary dictionaries.
 */
export function Dictionary<V extends Runtype>(value: V, key?: 'string'): StringDictionary<V>;
export function Dictionary<V extends Runtype>(value: V, key?: 'number'): NumberDictionary<V>;
export function Dictionary<V extends Runtype>(value: V, key = 'string'): any {
  return create<Runtype>(
    x => {
      if (x === null || x === undefined) {
        const a = create<any>(x as never, { tag: 'dictionary', key, value });
        throw new ValidationError(`Expected ${show(a)}, but was ${x}`);
      }

      if (typeof x !== 'object') {
        const a = create<any>(x as never, { tag: 'dictionary', key, value });
        throw new ValidationError(`Expected ${show(a.reflect)}, but was ${typeof x}`);
      }

      if (Object.getPrototypeOf(x) !== Object.prototype) {
        if (!Array.isArray(x)) {
          const a = create<any>(x as never, { tag: 'dictionary', key, value });
          throw new ValidationError(
            `Expected ${show(a.reflect)}, but was ${Object.getPrototypeOf(x)}`,
          );
        } else if (key === 'string')
          throw new ValidationError(`Expected dictionary, but was array`);
      }

      for (const k in x) {
        // Object keys are unknown strings
        if (key === 'number') {
          if (isNaN(+k))
            throw new ValidationError(`Expected dictionary key to be a number, but was string`);
        }

        try {
          value.check((x as any)[k]);
        } catch (err) {
          if (!(err instanceof ValidationError)) {
            throw err;
          }
          throw new ValidationError(err.message, err.key ? `${k}.${err.key}` : k);
        }
      }

      return x;
    },
    { tag: 'dictionary', key, value },
  );
}
