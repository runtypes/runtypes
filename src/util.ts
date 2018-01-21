// Type guard to determine if an object has a given key
// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
export function hasKey<K extends string>(k: K, o: {}): o is { [_ in K]: {} } {
  return typeof o === 'object' && k in o;
}
