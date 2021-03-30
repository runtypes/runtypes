import {
  create,
  Static,
  RuntypeBase,
  Codec,
  createValidationPlaceholder,
  assertRuntype,
} from '../runtype';
import show from '../show';
import { String, Number } from './primative';
import { Literal } from './literal';
import { Constraint } from './constraint';
import { lazyValue } from './lazy';
import { Union } from './union';
import { expected, failure, Result } from '../result';

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
  readonly isReadonly: false;
}

export interface ReadonlyRecord<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>
  extends Codec<{ readonly [_ in Static<K>]?: Static<V> }> {
  readonly tag: 'record';
  readonly key: K;
  readonly value: V;
  readonly isReadonly: true;
}

/**
 * Construct a runtype for arbitrary dictionaries.
 */
export function Record<K extends KeyRuntypeBase, V extends RuntypeBase<unknown>>(
  key: K,
  value: V,
): Record<K, V> {
  assertRuntype(key, value);
  const expectedBaseType = lazyValue(() => getExpectedBaseType(key));
  const runtype: Record<K, V> = create<Record<K, V>>(
    'record',
    (x, innerValidate) => {
      if (x === null || x === undefined || typeof x !== 'object') {
        return expected(runtype, x);
      }

      if (Object.getPrototypeOf(x) !== Object.prototype && Object.getPrototypeOf(x) !== null) {
        if (!Array.isArray(x)) {
          return failure(`Expected ${show(runtype)}, but was ${Object.getPrototypeOf(x)}`);
        }
        return failure('Expected Record, but was Array');
      }

      return createValidationPlaceholder<{ [_ in Static<K>]?: Static<V> }>(
        Object.create(null),
        placeholder => {
          for (const k in x) {
            let keyValidation: Result<string | number> | null = null;
            if (expectedBaseType() === 'number') {
              if (isNaN(+k)) return expected(`record key to be a number`, k);
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
              return expected(`record key to be ${show(key)}`, k);
            }

            const validated = innerValidate(value, (x as any)[k]);
            if (!validated.success) {
              return failure(validated.message, {
                key: validated.key ? `${k}.${validated.key}` : k,
              });
            }
            (placeholder as any)[keyValidation.value] = validated.value;
          }
        },
      );
    },
    {
      key,
      value,
      isReadonly: false,
      show() {
        return `{ [_: ${show(key, false)}]: ${show(value, false)} }`;
      },
    },
  );
  return runtype;
}
