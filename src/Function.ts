import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Function extends Runtype<(...args: any[]) => any> {
	tag: "function"
}

const self = { tag: "function" } as unknown as Reflect

/**
 * Construct a runtype for functions.
 */
const Function = create<Function>(
	value => (typeof value === "function" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	self,
)

export default Function