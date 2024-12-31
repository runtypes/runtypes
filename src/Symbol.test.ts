import Symbol from "./Symbol.ts"
import { assert } from "@std/assert"

Deno.test("Symbol", async t => {
	await t.step("without key", async t => {
		const s = globalThis.Symbol()
		assert(Symbol.guard(s))
	})
	await t.step("with key", async t => {
		const s = globalThis.Symbol.for("key")
		assert(Symbol("key").guard(s))
	})
})