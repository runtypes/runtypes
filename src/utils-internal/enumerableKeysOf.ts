const enumerableKeysOf = (object: unknown) =>
	typeof object === "object" && object !== null
		? // Objects with a null prototype may not have `propertyIsEnumerable`
			Reflect.ownKeys(object).filter(key => Object.prototype.propertyIsEnumerable.call(object, key))
		: []

export default enumerableKeysOf