const typeOf = (value: unknown) => {
	const type = typeof value
	if (type === "object") {
		if (value === null) return "null"
		if (Array.isArray(value)) return "array"
		const prototype = globalThis.Object.getPrototypeOf(value)
		if (prototype === null) return "object"
		if (prototype.constructor.name === "Object") return "object"
		return prototype.constructor.name
	}
	return type
}

export default typeOf