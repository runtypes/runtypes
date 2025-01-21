import Runtype from "./Runtype.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Validates anything.
 */
interface Unknown extends Runtype<unknown> {
	tag: "unknown"
}

const Unknown = Runtype.create<Unknown>(({ received }) => SUCCESS(received), { tag: "unknown" })

export default Unknown