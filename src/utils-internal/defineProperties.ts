const defineProperties = <T extends object, U extends object>(
	target: T,
	properties: U,
	descriptor: { configurable: boolean; enumerable: boolean; writable: boolean },
): { [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never } => {
	for (const key of Reflect.ownKeys(properties)) {
		const value = properties[key as keyof typeof properties]
		globalThis.Object.defineProperty(target, key, {
			...descriptor,
			value,
		})
	}
	return target as {
		[K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never
	}
}

export default defineProperties