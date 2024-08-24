import Dictionary from "./Dictionary.ts"
import Literal from "./Literal.ts"
import Optional from "./Optional.ts"
import String from "./String.ts"
import type Static from "./utils/Static.ts"
import { assert } from "std/assert/mod.ts"

Deno.test("dictionary", async t => {
	await t.step("works with optional properties", async t => {
		const T = Dictionary(Optional(String), Literal("bar"))
		type T = Static<typeof T>
		type Expected = { bar?: string | undefined }
		const x: [Expected, T] extends [T, Expected] ? T : never = {}
		assert(T.guard(x))
	})
})