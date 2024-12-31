import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Number extends Runtype.Common<number> {
	tag: "number"
}

/**
 * Validates that a value is a number.
 */
const Number = Runtype.create<Number>(
	(value, innerValidate, self) =>
		typeof value === "number" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value),
	{ tag: "number" },
)

export default Number