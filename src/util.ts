// Type guard to determine if an object has a given key
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

export const enumerableKeysOf = (object: object) =>
  Reflect.ownKeys(object).filter(key => object.propertyIsEnumerable(key));
