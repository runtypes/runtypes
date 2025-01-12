import Number from "./Number.ts"
import { assert } from "@std/assert"

Deno.test("Number", async t => {
	await t.step("validates `42`", async t => {
		assert(Number.guard(42))
	})
	await t.step("validates `NaN`", async t => {
		assert(Number.guard(NaN))
	})
	await t.step('invalidates `"Hello, World!"`', async t => {
		// @ts-expect-error: should fail
		assert(!Number.guard("Hello, World!"))
	})
})