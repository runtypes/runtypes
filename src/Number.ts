import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a number.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-numbers
 */
interface Number extends Runtype<number> {
	tag: "number"
}

const Number: Number = Runtype.create<Number>(
	({ received, expected }) =>
		typeof received === "number"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "number" },
)

export default Number