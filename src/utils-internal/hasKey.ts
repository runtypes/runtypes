const hasKey = <K extends string | number | symbol>(
	key: K,
	object: object,
): object is { [_ in K]: unknown } =>
	globalThis.Object.prototype.propertyIsEnumerable.call(object, key)

export default hasKey