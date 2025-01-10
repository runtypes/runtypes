const defineProperty = <T extends object, K extends PropertyKey, V>(
	target: T,
	key: K,
	value: V,
): { [L in keyof T | K]: L extends K ? V : L extends keyof T ? T[L] : never } => {
	globalThis.Object.defineProperty(target, key, {
		value,
		configurable: true,
		enumerable: true,
		writable: true,
	})
	return target as { [L in keyof T | K]: L extends K ? V : L extends keyof T ? T[L] : never }
}
export default defineProperty