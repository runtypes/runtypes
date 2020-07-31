// Type guard to determine if an object has a given key
// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
export function hasKey<K extends string>(k: K, o: {}): o is { [_ in K]: {} } {
  return typeof o === 'object' && k in o;
}

export function pick<O extends Record<string, unknown>, K extends keyof O>(
  obj: O,
  keys: K[],
): Pick<O, K> {
  const result: any = {};
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

export function omit<O extends Record<string, unknown>, K extends keyof O>(
  obj: O,
  omitKeys: K[],
): Omit<O, K> {
  const result: any = {};
  const existingKeys = Object.keys(obj);
  existingKeys.forEach(key => {
    if ((omitKeys as string[]).indexOf(key) === -1) result[key] = obj[key];
  });
  return result;
}
