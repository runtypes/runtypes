import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Function extends Runtype.Common<(...args: never[]) => unknown> {
	tag: "function"
}

/**
 * Construct a runtype for functions.
 */
const Function = Runtype.create<Function>(
	({ value, self }) =>
		typeof value === "function"
			? SUCCESS(value as (...args: never[]) => unknown)
			: FAILURE.TYPE_INCORRECT(self, value),
	{ tag: "function" },
)

export default Function