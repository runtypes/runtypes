// Type guard to determine if an object has a given key

import { Reflect } from './reflect';
import { Failcode, Failure, Message, Success } from './result';
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
      : value.constructor.name === 'Object'
      ? 'object'
      : value.constructor.name
    : typeof value;

export const enumerableKeysOf = (object: unknown) =>
  typeof object === 'object' && object !== null
    ? Reflect.ownKeys(object).filter(key => object.propertyIsEnumerable(key))
    : [];

export function SUCCESS<T extends unknown>(value: T): Success<T> {
  return { success: true, value };
}

export const FAILURE = Object.assign(
  (code: Failcode, message: Message): Failure => ({
    success: false,
    message,
    code,
  }),
  {
    TYPE_INCORRECT: (self: Reflect, value: unknown) => {
      const message = `Expected ${show(self)}, but was ${typeOf(value)}`;
      return FAILURE(Failcode.TYPE_INCORRECT, message);
    },
    VALUE_INCORRECT: (message: Message) => {
      return FAILURE(Failcode.VALUE_INCORRECT, message);
    },
    KEY_INCORRECT: (self: Reflect, expected: Reflect, value: unknown) => {
      return FAILURE(
        Failcode.KEY_INCORRECT,
        `Expected ${show(self)} key to be ${show(expected)}, but was ${typeOf(value)}`,
      );
    },
    CONTENT_INCORRECT: (message: Message) => {
      return FAILURE(Failcode.CONTENT_INCORRECT, message);
    },
    ARGUMENT_INCORRECT: (message: Message) => {
      return FAILURE(Failcode.ARGUMENT_INCORRECT, message);
    },
    RETURN_INCORRECT: (message: Message) => {
      return FAILURE(Failcode.RETURN_INCORRECT, message);
    },
    PROPERTY_MISSING: (self: Reflect) => {
      const message = `Expected ${show(self)}, but was missing`;
      return FAILURE(Failcode.PROPERTY_MISSING, message);
    },
    PROPERTY_PRESENT: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE(Failcode.PROPERTY_PRESENT, message);
    },
    NOTHING_EXPECTED: (value: unknown) => {
      const message = `Expected nothing, but was ${typeOf(value)}`;
      return FAILURE(Failcode.NOTHING_EXPECTED, message);
    },
  },
);
