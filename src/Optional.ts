import type Runtype from "./Runtype.ts"

interface Optional<R extends Runtype.Core = Runtype.Core> {
	tag: "optional"
	underlying: R
}

/**
 * Constructs a pseudo-runtype that is only usable in the context of `Object` properties. This works as the runtime counterpart of optional properties.
 *
 * ```typescript
 * const O = Object({ x: Number.optional() })
 * const O = Static<typeof O> // { x?: number }
 * ```
 */
const Optional = <R extends Runtype.Core>(runtype: R): Optional<R> => ({
	tag: "optional",
	underlying: runtype,
})

export default Optional