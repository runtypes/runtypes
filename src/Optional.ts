import Runtype, { RuntypeBase, create } from "./Runtype.ts"
import Reflect from "./utils/Reflect.ts"
import Static from "./utils/Static.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Optional<R extends RuntypeBase> extends Runtype<Static<R> | undefined> {
	tag: "optional"
	underlying: R
}

/**
 * Validates optional value.
 */
const Optional = <R extends RuntypeBase>(runtype: R) => {
	const self = { tag: "optional", underlying: runtype } as unknown as Reflect
	return create<Optional<R>>(
		value => (value === undefined ? SUCCESS(value) : runtype.validate(value)),
		self,
	)
}

export default Optional