import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Record from "./Record.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import { assertEquals } from "@std/assert"

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
			message: 'Expected { [_: "a" | "b"]: number }, but was incompatible',
			details: {
				b: {
					success: false,
					code: Failcode.PROPERTY_MISSING,
					message: "Expected number, but was missing",
				},
			},
		})
	})

	await t.step("should work with certain edge case number keys", async t => {
		const D = Record(Number, String)
		type D = Static<typeof D>
		const d: D = { [globalThis.Number.MAX_VALUE]: "foo" }
		assertEquals(D.validate(d), { success: true, value: d })
	})

	await t.step("record", async t => {
		assertEquals(
			Record(String, String).validate(
				// @ts-expect-error: should fail
				null,
			),
			{
				success: false,
				code: Failcode.TYPE_INCORRECT,
				message: "Expected { [_: string]: string }, but was null",
			},
		)
	})

	await t.step("record invalid type", async t => {
		assertEquals(
			Record(String, Object({ name: String })).validate(
				// @ts-expect-error: should fail
				undefined,
			),
			{
				success: false,
				code: Failcode.TYPE_INCORRECT,
				message: "Expected { [_: string]: { name: string; } }, but was undefined",
			},
		)
		assertEquals(Record(String, Object({ name: String })).validate(1), {
			success: false,
			code: Failcode.TYPE_INCORRECT,
			message: "Expected { [_: string]: { name: string; } }, but was number",
		})
	})

	await t.step("record complex", async t => {
		assertEquals(Record(String, Object({ name: String })).validate({ foo: { name: false } }), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected { [_: string]: { name: string; } }, but was incompatible",
			details: {
				foo: {
					success: false,
					code: Failcode.CONTENT_INCORRECT,
					message: "Expected { name: string; }, but was incompatible",
					details: {
						name: {
							success: false,
							code: Failcode.TYPE_INCORRECT,
							message: "Expected string, but was boolean",
						},
					},
				},
			},
		})
	})

	await t.step("string record", async t => {
		assertEquals(Record(String, String).validate({ foo: "bar", test: true }), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected { [_: string]: string }, but was incompatible",
			details: {
				test: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected string, but was boolean",
				},
			},
		})
	})

	await t.step("number record", async t => {
		assertEquals(Record(Number, String).validate({ 1: "bar", 2: 20 }), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected { [_: number]: string }, but was incompatible",
			details: {
				2: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected string, but was number",
				},
			},
		})
	})
})