import Unknown from "./Unknown.ts"
import { assert } from "@std/assert"

Deno.test("Constraint", async () => {
	const YourRuntype = Unknown.withConstraint(x => x === true)
	assert(YourRuntype.guard(true))
	assert(!YourRuntype.guard(false))
})