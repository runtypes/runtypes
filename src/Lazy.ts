import { RuntypeBase, create } from "./Runtype.ts"

/**
 * Construct a possibly-recursive Runtype.
 */
const Lazy = <A extends RuntypeBase>(delayed: () => A) => {
	const data: any = {
		get tag() {
			return (getWrapped() as any)["tag"]
		},
	}

	let cached: A | undefined = undefined
	const getWrapped = () => {
		if (!cached) {
			cached = delayed()
			for (const k in cached) if (k !== "tag") data[k] = cached[k]
		}
		return cached
	}

	return create<A>(x => {
		return getWrapped().validate(x)
	}, data)
}

export default Lazy