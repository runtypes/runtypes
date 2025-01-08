import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Record from "./Record.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assertEquals, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

Deno.test("Record", async t => {
	await t.step("should work with keys being union of literals", async t => {
		const Key = Union(Literal("a"), Literal("b"))
		const Dict = Record(Key, Number)
		type Dict = Static<typeof Dict>
		// @ts-expect-error: should fail
		const example: Dict = {
			a: 42,
		}
		const error = assertThrows(() => Dict.check(example))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected { [_: "a" | "b"]: number }, but was incompatible',
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					b: {
						code: Failcode.PROPERTY_MISSING,
					},
				},
			},
		})
	})

	await t.step("should work with certain edge case number keys", async t => {
		const D = Record(Number, String)
		type D = Static<typeof D>
		const d: D = { [globalThis.Number.MAX_VALUE]: "foo" }
		assertEquals(D.check(d), d)
	})

	await t.step("record", async t => {
		const error = assertThrows(() =>
			Record(String, String).check(
				// @ts-expect-error: should fail
				null,
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: string]: string }, but was null",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})

	await t.step("record invalid type", async t => {
		const error = assertThrows(() =>
			Record(String, Object({ name: String })).check(
				// @ts-expect-error: should fail
				undefined,
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: string]: { name: string; } }, but was undefined",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})

	await t.step("record invalid type", async t => {
		const error = assertThrows(() => Record(String, Object({ name: String })).check(1))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: string]: { name: string; } }, but was number",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})

	await t.step("record complex", async t => {
		const error = assertThrows(() =>
			Record(String, Object({ name: String })).check({ foo: { name: false } }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: string]: { name: string; } }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					foo: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							name: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
				},
			},
		})
	})

	await t.step("string record", async t => {
		const error = assertThrows(() => Record(String, String).check({ foo: "bar", test: true }))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: string]: string }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					test: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})

	await t.step("number record", async t => {
		const error = assertThrows(() => Record(Number, String).check({ 1: "bar", 2: 20 }))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { [_: number]: string }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					2: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})
})