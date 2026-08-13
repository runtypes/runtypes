import FAILURE from "./utils-internal/FAILURE.ts"
import Runtype from "./Runtype.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a function.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-functions
 */
interface Function<T> extends Runtype<T> {
	tag: "function"
}

const Function = <T>() => Runtype.create<Function<T>>(
	({ received, expected }) =>
		typeof received === "function"
			? SUCCESS(received as T)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "function" },
)

export default Function