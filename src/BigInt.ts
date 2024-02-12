import Runtype, { create } from "./Runtype.ts"
import Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface BigInt extends Runtype<bigint> {
	tag: "bigint"
}

const self = { tag: "bigint" } as unknown as Reflect

/**
 * Validates that a value is a bigint.
 */
const BigInt = create<BigInt>(
	value => (typeof value === "bigint" ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
	self,
)

export default BigInt