import { type RuntypeBase, create } from "./Runtype.ts"

/**
 * Construct a possibly-recursive runtype.
 */
const Lazy = <A extends RuntypeBase>(delayed: () => A) => {
	const self = {
		get tag() {
			return getWrapped().reflect.tag
		},
	}

	let cached: A | undefined = undefined
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

	return create<A>(x => {
		return getWrapped().validate(x)
	}, self)
}

export default Lazy