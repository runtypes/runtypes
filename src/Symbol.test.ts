import Symbol from "./Symbol.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertEquals, assertObjectMatch } from "@std/assert"

Deno.test("Symbol", async t => {
	await t.step("without key", async t => {
		assert(Symbol.guard(globalThis.Symbol()))
		assert(Symbol.guard(globalThis.Symbol.for("key")))
	})
	await t.step("with key", async t => {
		assert(Symbol("key").guard(globalThis.Symbol.for("key")))
		assert(!Symbol("key").guard(globalThis.Symbol()))
	})

	await t.step("symbol", async t => {
		assertObjectMatch(Symbol, { tag: "symbol" })
		assertObjectMatch(Symbol("runtypes"), { tag: "symbol", key: "runtypes" })
		assertEquals(Symbol("runtypes?").validate(globalThis.Symbol.for("runtypes!")), {
			success: false,
			code: Failcode.VALUE_INCORRECT,
			message: 'Expected symbol for "runtypes?", but was for "runtypes!"',
		})
		assertEquals(Symbol(undefined).validate(globalThis.Symbol.for("undefined")), {
			success: false,
			code: Failcode.VALUE_INCORRECT,
			message: 'Expected unique symbol, but was for "undefined"',
		})
		assertEquals(Symbol("undefined").validate(globalThis.Symbol()), {
			success: false,
			code: Failcode.VALUE_INCORRECT,
			message: 'Expected symbol for "undefined", but was unique',
		})
	})
})