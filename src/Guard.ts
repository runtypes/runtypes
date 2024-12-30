import Unknown from "./Unknown.ts"

/** @deprecated Use `withGuard` modifier method on a runtype. */
const Guard = <T, K = unknown>(
	guard: (x: unknown) => x is T,
	options?: { name?: string; args?: K },
) => Unknown.withGuard(guard, options)

export default Guard