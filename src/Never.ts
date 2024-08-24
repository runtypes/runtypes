import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"

interface Never extends Runtype<never> {
	tag: "never"
}

const self = { tag: "never" } as unknown as Reflect

/**
 * Validates nothing (unknown fails).
 */
const Never = create<Never>(FAILURE.NOTHING_EXPECTED, self)

export default Never