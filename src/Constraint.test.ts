import Unknown from "./Unknown.ts"
import { assert } from "assert/mod.ts"

Deno.test("Constraint", async () => {
	const YourRuntype = Unknown.withConstraint(x => x === true, { name: "YourRuntype" })
	assert(YourRuntype.name === "YourRuntype")
	assert(YourRuntype.guard(true))
	assert(!YourRuntype.guard(false))
})