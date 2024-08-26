import isObject from "./isObject.ts"

const hasKey = <K extends string | number | symbol>(
	key: K,
	object: unknown,
): object is { [_ in K]: unknown } =>
	isObject(object) && globalThis.Object.prototype.propertyIsEnumerable.call(object, key)

export default hasKey