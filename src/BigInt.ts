import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates that a value is a bigint.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-bigints
 */
interface BigInt extends Runtype<bigint> {
	tag: "bigint"
}

const BigInt = Runtype.create<BigInt>(
	({ received, expected }) =>
		typeof received === "bigint"
			? SUCCESS(received)
			: FAILURE.TYPE_INCORRECT({ expected, received }),
	{ tag: "bigint" },
)

export default BigInt