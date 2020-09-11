import { create, Static, RuntypeBase, Codec, createValidationPlaceholder } from '../runtype';
import show from '../show';
import { String } from './string';
import { Number } from './number';
import { Literal } from './literal';
import { Constraint } from './constraint';
import { lazyValue } from './lazy';
import { Union } from './union';
import { Result } from '../result';
import { RecordFields, Object as ObjectType } from './Object';

export type KeyRuntypeBaseWithoutUnion =
  | Pick<String, keyof RuntypeBase>
  | Pick<Number, keyof RuntypeBase>
  | Pick<Literal<string | number>, 'value' | keyof RuntypeBase>
  | Pick<Constraint<KeyRuntypeBase, string | number>, 'underlying' | keyof RuntypeBase>;

export type KeyRuntypeBase =
  | KeyRuntypeBaseWithoutUnion
  | Pick<Union<KeyRuntypeBaseWithoutUnion[]>, 'alternatives' | keyof RuntypeBase>;

function getExpectedBaseType(key: KeyRuntypeBase): 'string' | 'number' | 'mixed' {
  switch (key.tag) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'literal':
      return typeof key.value as 'string' | 'number';
    case 'union':
      const baseTypes = key.alternatives.map(getExpectedBaseType);
      return baseTypes.reduce((a, b) => (a === b ? a : 'mixed'), baseTypes[0]);
    case 'constraint':
      return getExpectedBaseType(key.underlying);
  }
}

export interface Record<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>
  extends Codec<{ [_ in Static<K>]?: Static<V> }> {
  readonly tag: 'record';
  readonly key: K;
  readonly value: V;
}

/**
 * Construct a runtype for arbitrary dictionaries.
 */
export function Record<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>(
  key: K,
  value: V,
): Record<K, V>;
/**
 * @deprecated Use Object instead
 */
export function Record<O extends RecordFields>(fields: O): ObjectType<O, false>;
export function Record(...args: any[]): any {
  if (args.length === 1 && args[0] && typeof args[0] === 'object') {
    return ObjectType(args[0]);
  }
  return RecordInternal(args[0], args[1]);
}
function RecordInternal<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>(
  key: K,
  value: V,
): Record<K, V> {
  const expectedBaseType = lazyValue(() => getExpectedBaseType(key));
  const runtype: Record<K, V> = create<Record<K, V>>(
    (x, innerValidate) => {
      if (x === null || x === undefined) {
        return { success: false, message: `Expected ${show(runtype)}, but was ${x}` };
      }

      if (typeof x !== 'object') {
        return { success: false, message: `Expected ${show(runtype)}, but was ${typeof x}` };
      }

      if (Object.getPrototypeOf(x) !== Object.prototype) {
        if (!Array.isArray(x)) {
          return {
            success: false,
            message: `Expected ${show(runtype)}, but was ${Object.getPrototypeOf(x)}`,
          };
        }
        return { success: false, message: 'Expected record, but was array' };
      }

      return createValidationPlaceholder<{ [_ in Static<K>]?: Static<V> }>({}, placeholder => {
        for (const k in x) {
          let keyValidation: Result<string | number> | null = null;
          if (expectedBaseType() === 'number') {
            if (isNaN(+k))
              return {
                success: false,
                message: `Expected record key to be a number, but was '${k}'`,
              };
            keyValidation = innerValidate(key, +k);
          } else if (expectedBaseType() === 'string') {
            keyValidation = innerValidate(key, k);
          } else {
            keyValidation = innerValidate(key, k);
            if (!keyValidation.success && !isNaN(+k)) {
              keyValidation = innerValidate(key, +k);
            }
          }
          if (!keyValidation.success) {
            return {
              success: false,
              message: `Expected record key to be ${show(key)}, but was '${k}'`,
            };
          }

          const validated = innerValidate(value, (x as any)[k]);
          if (!validated.success) {
            return {
              success: false,
              message: validated.message,
              key: validated.key ? `${k}.${validated.key}` : k,
            };
          }
          (placeholder as any)[keyValidation.value] = validated.value;
        }
      });
    },
    {
      tag: 'record',
      key,
      value,
      show({ showChild }) {
        return `{ [_: ${showChild(key, false)}]: ${showChild(value, false)} }`;
      },
    },
  );
  return runtype;
}
