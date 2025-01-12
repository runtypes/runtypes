import Intersect from "./Intersect.ts"
import { assert } from "@std/assert"

Deno.test("Intersect", async t => {
	await t.step("should always validate with the empty intersect", async t => {
		const ShouldAlways = Intersect()
		assert(ShouldAlways.guard(true))
	})
})