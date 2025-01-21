import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"

/**
 * Validates nothing.
 *
 * Possible failures:
 *
 * - `NOTHING_EXPECTED` for any value
 */
interface Never extends Runtype<never> {
	tag: "never"
}
const Never: Never = Runtype.create<any>(
	({ received, expected }) => FAILURE.NOTHING_EXPECTED({ expected, received }),
	{ tag: "never" },
) as Never

export default Never