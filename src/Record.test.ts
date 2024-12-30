import Literal from "./Literal.ts"
import Optional from "./Optional.ts"
import Record from "./Record.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import { assert } from "assert/mod.ts"

Deno.test("record", async t => {
	await t.step("works with optional properties", async t => {
		const T = Record(Literal("bar"), Optional(String))
		type T = Static<typeof T>
		type Expected = { bar?: string }
		type Unexpected = { bar?: string | undefined }
		const isExpected: [Expected, T] extends [T, Expected] ? true : false = true
		const isNotUnexpected: [Unexpected, T] extends [T, Unexpected] ? false : true = true
		const x: T = {}
		assert(T.guard(x))
		// @ts-expect-error: must not be undefined
		const y: T = { bar: undefined }
		assert(!T.guard(y))
		const z: T = { bar: "baz" }
		assert(T.guard(z))
	})
})