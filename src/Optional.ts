import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
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