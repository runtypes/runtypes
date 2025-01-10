const copyProperties = (dst: object, src: object) => {
	globalThis.Object.defineProperties(dst, globalThis.Object.getOwnPropertyDescriptors(src))
}

export default copyProperties