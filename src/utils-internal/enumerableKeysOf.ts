import isObject from "./isObject.ts"

const enumerableKeysOf = (object: unknown) =>
	isObject(object)
		? Reflect.ownKeys(object).filter(key =>
				globalThis.Object.prototype.propertyIsEnumerable.call(object, key),
			)
		: []

export default enumerableKeysOf