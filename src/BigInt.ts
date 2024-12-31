import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface BigInt extends Runtype.Common<bigint> {
	tag: "bigint"
}

/**
 * Validates that a value is a bigint.
 */
const BigInt = Runtype.create<BigInt>(
	(value, innerValidate, self) =>
		typeof value === "bigint" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value),
	{ tag: "bigint" },
)

export default BigInt