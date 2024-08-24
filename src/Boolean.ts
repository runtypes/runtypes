import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Boolean extends Runtype<boolean> {
	tag: "boolean"
}

const self = { tag: "boolean" } as unknown as Reflect

/**
 * Validates that a value is a boolean.
 */
const Boolean = create<Boolean>(
	value => (typeof value === "boolean" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	self,
)

export default Boolean