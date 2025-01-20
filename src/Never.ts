import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"

interface Never extends Runtype<never> {
	tag: "never"
}

/**
 * Validates nothing.
 */
const Never = Runtype.create<any>(
	({ received, expected }) => FAILURE.NOTHING_EXPECTED({ expected, received }),
	{ tag: "never" },
) as Never

export default Never