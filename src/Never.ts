import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"

interface Never extends Runtype.Common<never> {
	tag: "never"
}

/**
 * Validates nothing (unknown fails).
 */
const Never = Runtype.create<Never>(FAILURE.NOTHING_EXPECTED, { tag: "never" })

export default Never