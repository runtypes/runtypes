import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Boolean extends Runtype<boolean> {
	tag: "boolean"
}

/**
 * Validates that a value is a boolean.
 */
const Boolean = Runtype.create<Boolean>(
	({ received, expected }) =>
		typeof received === "boolean"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "boolean" },
)

export default Boolean