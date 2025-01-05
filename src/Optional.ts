import type Runtype from "./Runtype.ts"

interface Optional<R extends Runtype.Core = Runtype.Core, D = any> {
	tag: "optional"
	underlying: R
	defaultValue?: D
}

/**
 * Constructs a pseudo-runtype that is only usable in the context of `Object` properties. This works as the runtime counterpart of optional properties.
 *
 * ```typescript
 * const O = Object({ x: Number.optional() })
 * const O = Static<typeof O> // { x?: number }
 * ```
 */
const Optional: {
	<R extends Runtype.Core>(underlying: R): Optional<R>
	<R extends Runtype.Core, D>(underlying: R, defaultValue: D): Optional<R, D>
} = <R extends Runtype.Core, D>(...args: [underlying: R, defaultValue?: D]): Optional<R, D> => ({
	tag: "optional",
	underlying: args[0],
	...(args.length === 2 ? { defaultValue: args[1] } : {}),
})

export default Optional