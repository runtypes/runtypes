import Runtype, { create } from "./Runtype.ts"
import Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface String extends Runtype<string> {
	tag: "string"
}

const self = { tag: "string" } as unknown as Reflect

/**
 * Validates that a value is a string.
 */
const String = create<String>(
	value => (typeof value === "string" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	self,
)

export default String