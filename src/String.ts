import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface String extends Runtype<string> {
	tag: "string"
}

/**
 * Validates that a value is a string.
 */
const String = Runtype.create<String>(
	({ value, self }) =>
		typeof value === "string"
			? SUCCESS(value)
			: FAILURE.TYPE_INCORRECT({ expected: self, received: value }),
	{ tag: "string" },
)

export default String