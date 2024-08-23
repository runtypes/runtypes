import Literal from "./Literal.ts"
import Optional from "./Optional.ts"
import Record from "./Record.ts"
import String from "./String.ts"
import Static from "./utils/Static.ts"
import { assert } from "std/assert/mod.ts"

Deno.test("record", async t => {
	await t.step("works with optional properties", async t => {
		const T = Record(Literal("bar"), Optional(String))
		type T = Static<typeof T>
		type Expected = { bar?: string | undefined }
		const x: [Expected, T] extends [T, Expected] ? T : never = {}
		assert(T.guard(x))
		const y: [Expected, T] extends [T, Expected] ? T : never = { foo: true }
		assert(!T.guard(y))
		const z: [Expected, T] extends [T, Expected] ? T : never = { bar: "baz" }
		assert(T.guard(z))
	})
})