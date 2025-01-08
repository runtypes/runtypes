import defineProperties from "./defineProperties.ts"

const defineIntrinsics = <T extends object, U extends object>(
	target: T,
	properties: U,
): { [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never } =>
	defineProperties(target, properties, { configurable: true, enumerable: false, writable: true })

export default defineIntrinsics