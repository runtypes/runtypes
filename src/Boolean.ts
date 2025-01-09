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
	({ value, self }) =>
		typeof value === "boolean"
			? SUCCESS(value)
			: FAILURE.TYPE_INCORRECT({ expected: self, received: value }),
	{ tag: "boolean" },
)

export default Boolean