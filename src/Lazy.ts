import { type RuntypeBase, create } from "./Runtype.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"

/**
 * Construct a possibly-recursive Runtype.
 */
const Lazy = <A extends RuntypeBase>(delayed: () => A) => {
	const data = {
		get tag() {
			return getWrapped().reflect.tag
		},
	}

	let cached: A | undefined = undefined
	const getWrapped = () => {
		if (!cached) {
			cached = delayed()
			for (const key of enumerableKeysOf(cached))
				if (key !== "tag")
					globalThis.Object.defineProperty(data, key, { value: cached[key as keyof A] })
		}
		return cached
	}

	return create<A>(x => {
		return getWrapped().validate(x)
	}, data)
}

export default Lazy