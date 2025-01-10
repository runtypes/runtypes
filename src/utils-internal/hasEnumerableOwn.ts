const hasEnumerableOwn = <K extends PropertyKey>(
	key: K,
	object: object,
): object is globalThis.Record<K, unknown> =>
	globalThis.Object.prototype.propertyIsEnumerable.call(object, key)

export default hasEnumerableOwn