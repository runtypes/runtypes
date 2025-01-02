import Number from "./Number.ts"
import Optional from "./Optional.ts"
import { assertEquals } from "@std/assert"

Deno.test("Optional", async t => {
	await t.step("", async t => {
		const OptionalNumber = Optional(Number)
		assertEquals(OptionalNumber.tag, "optional")
		assertEquals(OptionalNumber.underlying.tag, "number")
		const OptionalNumberShorthand = Number.optional()
		assertEquals(OptionalNumberShorthand.tag, "optional")
		assertEquals(OptionalNumberShorthand.underlying.tag, "number")
	})
})