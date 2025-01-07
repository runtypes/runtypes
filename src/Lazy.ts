import Runtype from "./Runtype.ts"

/**
 * Construct a possibly-recursive runtype.
 */
const Lazy = <R extends Runtype.Core>(delayed: () => R) => {
	const self = {
		get tag() {
			return getWrapped().tag
		},
	}

	let cached: R | undefined = undefined
	const getWrapped = () => {
		if (!cached) {
			cached = delayed()
			for (const key of Reflect.ownKeys(cached)) {
				if (key !== "tag") {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const descriptor = globalThis.Object.getOwnPropertyDescriptor(cached, key)!
					globalThis.Object.defineProperty(self, key, descriptor)
				}
			}
		}
		return cached
	}

	return Runtype.create<R>(({ value }) => getWrapped().validate(value), self as Runtype.Base<R>)
}

export default Lazy