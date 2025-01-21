import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a string.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-strings
 */
interface String extends Runtype<string> {
	tag: "string"
}

const String = Runtype.create<String>(
	({ received, expected }) =>
		typeof received === "string"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "string" },
)

export default String