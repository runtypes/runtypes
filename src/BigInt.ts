import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface BigInt extends Runtype<bigint> {
	tag: "bigint"
}

/**
 * Validates that a value is a bigint.
 */
const BigInt = Runtype.create<BigInt>(
	({ received, expected }) =>
		typeof received === "bigint"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "bigint" },
)

export default BigInt