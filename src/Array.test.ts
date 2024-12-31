import Array from "./Array.ts"
import Number from "./Number.ts"
import { assert } from "@std/assert"

Deno.test("Array", async t => {
	await t.step("guard", async t => {
		const R = Array(Number)
		assert(R.guard([42]))
	})
	await t.step("withConstraint", async t => {
		const R = Array(Number).withConstraint(array => 0 < array.length)
		assert(R.guard([42]))
	})
})