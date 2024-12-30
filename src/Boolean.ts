import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Boolean extends Runtype.Common<boolean> {
	tag: "boolean"
}

/**
 * Validates that a value is a boolean.
 */
const Boolean = Runtype.create<Boolean>(
	(value, innerValidate, self) =>
		typeof value === "boolean" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value),
	{ tag: "boolean" },
)

export default Boolean