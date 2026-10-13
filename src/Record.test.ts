import Array from "./Array.ts"
import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Record from "./Record.ts"
import type Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Symbol from "./Symbol.ts"
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

	await t.step("should enforce a bare literal key", async t => {
		const Dict = Record(Literal("a"), Number)
		assertEquals(Dict.guard({}), false)
		const error = assertThrows(() => Dict.check({}))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					a: {
						code: Failcode.PROPERTY_MISSING,
					},
				},
			},
		})
	})

	await t.step("should enforce a single-element union of literal as key", async t => {
		const Dict = Record(Union(Literal("a")), Number)
		assertEquals(Dict.guard({}), false)
		const error = assertThrows(() => Dict.check({}))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					a: {
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

Deno.test("Record parses its values", () => {
	const schema = Record(
		String,
		String.withParser(value => value.length),
	)
	const input = { first: "hello", second: "world!" }
	assertEquals(schema.parse(input), { first: 5, second: 6 })
	assertEquals(schema.check(input), input)
	assertEquals(input, { first: "hello", second: "world!" })
})

Deno.test("Record preserves symbol and prototype-named keys when parsing", () => {
	const key = globalThis.Symbol("key")
	const schema = Record(
		Union(String, Symbol),
		String.withParser(value => value.length),
	)
	const input = { [key]: "symbol", ["__proto__"]: "own", constructor: "constructor" }
	assertEquals(schema.parse(input), { [key]: 6, ["__proto__"]: 3, constructor: 11 })
	assertEquals(globalThis.Object.getPrototypeOf(schema.parse(input)), globalThis.Object.prototype)
})

Deno.test("Record parses arrays without changing their shape", () => {
	const schema = Record(
		Number,
		String.withParser(value => value.length),
	)
	assertEquals(schema.parse(["hello", "world!"]), [5, 6])
	const sparse = new globalThis.Array<string>(3)
	sparse[1] = "hello"
	const parsed = schema.parse(sparse)
	if (!globalThis.Array.isArray(parsed)) throw new Error("Expected an array")
	assertEquals(parsed.length, 3)
	assertEquals(0 in parsed, false)
	assertEquals(parsed[1], 5)
	assertEquals(2 in parsed, false)
})

Deno.test("Record applies parsers to array values", () => {
	const schema = Record(
		String,
		Array(String).withParser(value => new Set(value)),
	)
	assertEquals(schema.parse({ key: ["value1", "value2"] }), { key: new Set(["value1", "value2"]) })
})

Deno.test("Record preserves cycles when parsing nested objects", () => {
	type Node = { name: string; children: { [key: string]: Node } }
	const schema: Runtype.Core<Node> = Lazy(() =>
		Object({ name: String, children: Record(String, schema) }),
	)
	const input: Node = { name: "root", children: {} }
	input.children.self = input
	const parsed = schema.parse(input)
	assertEquals(parsed.children.self === parsed, true)
	assertEquals(parsed === input, false)
})
