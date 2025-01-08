import Runtype from "./Runtype.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Unknown extends Runtype<unknown> {
	tag: "unknown"
}

/**
 * Validates anything, but provides no new type information about it.
 */
const Unknown = Runtype.create<Unknown>(({ value }) => SUCCESS(value), { tag: "unknown" })

export default Unknown