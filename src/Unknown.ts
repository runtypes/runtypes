import type Runtype from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Unknown extends Runtype<unknown> {
	tag: "unknown"
}

const self = { tag: "unknown" } as unknown as Reflect

/**
 * Validates anything, but provides no new type information about it.
 */
const Unknown = create<Unknown>(value => SUCCESS(value), self)

export default Unknown