import Symbol from "./Symbol.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assert, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

Deno.test("Symbol", async t => {
	await t.step("without key", async t => {
		assert(Symbol.guard(globalThis.Symbol()))
		assert(Symbol.guard(globalThis.Symbol.for("key")))
	})
	await t.step("with key", async t => {
		assert(Symbol("key").guard(globalThis.Symbol.for("key")))
		assert(!Symbol("key").guard(globalThis.Symbol()))
	})

	await t.step("creates", async t => {
		assertObjectMatch(Symbol, { tag: "symbol" })
		assertObjectMatch(Symbol("runtypes"), { tag: "symbol", key: "runtypes" })
	})

	await t.step("with key invalidates symbol with wrong key", async t => {
		const error = assertThrows(() => Symbol("runtypes?").check(globalThis.Symbol.for("runtypes!")))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected symbol for key "runtypes?", but was for "runtypes!"',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
	})

	await t.step("with no key invalidates symbol with key", async t => {
		const error = assertThrows(() => Symbol(undefined).check(globalThis.Symbol.for("undefined")))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected unique symbol, but was for "undefined"',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
	})

	await t.step("with key invalidates symbol with no key", async t => {
		const error = assertThrows(() => Symbol("undefined").check(globalThis.Symbol()))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected symbol for key "undefined", but was unique',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
	})

	await t.step("with empty key invalidates symbol with no key", async t => {
		const error = assertThrows(() => Symbol("").check(globalThis.Symbol()))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected symbol for key "", but was unique',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
	})

	await t.step("with no key invalidates symbol with empty key", async t => {
		const error = assertThrows(() => Symbol(undefined).check(globalThis.Symbol.for("")))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected unique symbol, but was for ""',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
	})
})