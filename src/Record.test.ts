import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Record from "./Record.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import { assertEquals } from "@std/assert"
import outdent from "x/outdent@v0.8.0/mod.ts"

Deno.test("Record", async t => {
	await t.step("should work with keys being union of literals", async t => {
		const Key = Union(Literal("a"), Literal("b"))
		const Dict = Record(Key, Number)
		type Dict = Static<typeof Dict>
		// @ts-expect-error: should fail
		const example: Dict = {
			a: 42,
		}
		assertEquals(Dict.validate(example), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: outdent`
				Validation failed:
				{
					"b": "Expected number, but was missing"
				}.
				Object should match { [_: "a" | "b"]: number }
			`,
			details: {
				b: "Expected number, but was missing",
			},
		})
	})
	await t.step("should work with certain edge case number keys", async t => {
		const D = Record(Number, String)
		type D = Static<typeof D>
		const d: D = { [globalThis.Number.MAX_VALUE]: "foo" }
		assertEquals(D.validate(d), { success: true, value: d })
	})
})