import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a function.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-functions
 */
interface Function extends Runtype<(...args: never[]) => unknown> {
	tag: "function"
}

const Function = Runtype.create<Function>(
	({ received, expected }) =>
		typeof received === "function"
			? SUCCESS(received as (...args: never[]) => unknown)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "function" },
)

export default Function