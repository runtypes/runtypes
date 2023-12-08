// Type guard to determine if an object has a given key

import { Reflect } from './reflect';
import { Details, Failcode, Failure, Success } from './result';
import show from './show';

// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
export function hasKey<K extends string | number | symbol>(
  key: K,
  object: unknown,
): object is { [_ in K]: unknown } {
  return typeof object === 'object' && object !== null && key in object;
}

export const typeOf = (value: unknown) =>
  typeof value === 'object'
    ? value === null
      ? 'null'
      : Array.isArray(value)
      ? 'array'
      : value.constructor?.name === 'Object'
      ? 'object'
      : value.constructor?.name ?? typeof value
    : typeof value;

export const enumerableKeysOf = (object: unknown) =>
  typeof object === 'object' && object !== null
    ? // Objects with a null prototype may not have `propertyIsEnumerable`
      Reflect.ownKeys(object).filter(key => object.propertyIsEnumerable?.(key) ?? true)
    : [];

export function SUCCESS<T extends unknown>(value: T): Success<T> {
  return { success: true, value };
}

export const FAILURE = Object.assign(
  ({
    code,
    message,
    ...rest
  }: {
    code: Failcode;
    message: string;
    details?: Details;
    thrown?: unknown;
  }): Failure => ({
    success: false,
    code,
    message,
    ...('details' in rest ? { details: rest.details } : {}),
    ...('thrown' in rest ? { thrown: rest.thrown } : {}),
  }),
  {
    TYPE_INCORRECT: (self: Reflect, value: unknown) => {
      const message = `Expected ${
        self.tag === 'template' ? `string ${show(self)}` : show(self)
      }, but was ${typeOf(value)}`;
      return FAILURE({ code: Failcode.TYPE_INCORRECT, message });
    },
    VALUE_INCORRECT: (name: string, expected: unknown, received: unknown) => {
      return FAILURE({
        code: Failcode.VALUE_INCORRECT,
        message: `Expected ${name} ${String(expected)}, but was ${String(received)}`,
      });
    },
    KEY_INCORRECT: (self: Reflect, expected: Reflect, value: unknown) => {
      return FAILURE({
        code: Failcode.KEY_INCORRECT,
        message: `Expected ${show(self)} key to be ${show(expected)}, but was ${typeOf(value)}`,
      });
    },
    CONTENT_INCORRECT: (self: Reflect, details: Details) => {
      const formattedDetails = JSON.stringify(details, null, 2).replace(/^ *null,\n/gm, '');
      const message = `Validation failed:\n${formattedDetails}.\nObject should match ${show(self)}`;
      return FAILURE({ code: Failcode.CONTENT_INCORRECT, message, details });
    },
    ARGUMENT_INCORRECT: (message: string) => {
      return FAILURE({ code: Failcode.ARGUMENT_INCORRECT, message });
    },
    RETURN_INCORRECT: (message: string) => {
      return FAILURE({ code: Failcode.RETURN_INCORRECT, message });
    },
    CONSTRAINT_FAILED: (self: Reflect, message?: string) => {
      const info = message ? `: ${message}` : '';
      return FAILURE({
        code: Failcode.CONSTRAINT_FAILED,
        message: `Failed constraint check for ${show(self)}${info}`,
      });
    },
    PROPERTY_MISSING: (self: Reflect) => {
      const message = `Expected ${show(self)}, but was missing`;
      return FAILURE({ code: Failcode.PROPERTY_MISSING, message });
    },
    PROPERTY_PRESENT: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE({ code: Failcode.PROPERTY_PRESENT, message });
    },
    NOTHING_EXPECTED: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE({ code: Failcode.NOTHING_EXPECTED, message });
    },
    TRANSFORM_FAILED: (error: unknown) => {
      const message = `Transformer threw: ${error}`;
      return FAILURE({ code: Failcode.TRANSFORM_FAILED, message, thrown: error });
    },
  },
);
