import Runtype, { create } from "./Runtype.ts"
import Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Number extends Runtype<number> {
	tag: "number"
}

const self = { tag: "number" } as unknown as Reflect

/**
 * Validates that a value is a number.
 */
const Number = create<Number>(
	value => (typeof value === "number" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	self,
)

export default Number