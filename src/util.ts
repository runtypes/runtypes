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
  (
    code: Failcode,
    message: string,
    received: any,
    details?: Details,
    extraDetails?: Details,
  ): Failure => ({
    success: false,
    code,
    message,
    received,
    ...(details ? { details } : {}),
    ...(extraDetails ? { extraDetails } : {}),
  }),
  {
    TYPE_INCORRECT: (self: Reflect, value: unknown) => {
      const message = `Expected ${
        self.tag === 'template' ? `string ${show(self, true)}` : show(self, false)
      }, but was ${typeOf(value)}`;
      return FAILURE(Failcode.TYPE_INCORRECT, message, value);
    },
    VALUE_INCORRECT: (name: string, expected: unknown, received: unknown) => {
      const msg = `Expected ${name} ${String(expected)}, but was ${String(received)}`;
      return FAILURE(Failcode.VALUE_INCORRECT, msg, msg);
    },
    KEY_INCORRECT: (self: Reflect, expected: Reflect, value: unknown) => {
      const msg = `Expected ${show(self, true)} key to be ${show(expected, true)}, but was ${typeOf(
        value,
      )}`;
      return FAILURE(Failcode.KEY_INCORRECT, msg, msg);
    },
    CONTENT_INCORRECT: (self: Reflect, details: Details, extraDetails: Details) => {
      const formattedDetails = JSON.stringify(details, null, 2).replace(/^ *null,\n/gm, '');
      const message = `Validation failed:\n${formattedDetails}.\nObject should match ${show(
        self,
        true,
      )}`;
      return FAILURE(Failcode.CONTENT_INCORRECT, message, '', details, extraDetails);
    },
    ARGUMENT_INCORRECT: (message: string) => {
      return FAILURE(Failcode.ARGUMENT_INCORRECT, message, message);
    },
    RETURN_INCORRECT: (message: string) => {
      return FAILURE(Failcode.RETURN_INCORRECT, message, message);
    },
    CONSTRAINT_FAILED: (self: Reflect, message?: string) => {
      const info = message ? `: ${message}` : '';
      const msg = `Failed constraint check for ${show(self, true)}${info}`;
      return FAILURE(Failcode.CONSTRAINT_FAILED, msg, msg);
    },
    PROPERTY_MISSING: (self: Reflect) => {
      const message = `Expected ${show(self, false)}, but was missing`;
      return FAILURE(Failcode.PROPERTY_MISSING, message, undefined);
    },
    PROPERTY_PRESENT: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE(Failcode.PROPERTY_PRESENT, message, message);
    },
    NOTHING_EXPECTED: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE(Failcode.NOTHING_EXPECTED, message, message);
    },
  },
);
