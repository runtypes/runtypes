import Literal from "./Literal.ts"
import { assert, assertObjectMatch } from "@std/assert"

Deno.test("Literal", async t => {
	await t.step("validates `BigInt(0)`", async t => {
		assert(Literal(BigInt(0)).guard(BigInt(0)))
	})
	await t.step("validates `42`", async t => {
		assert(Literal(42).guard(42))
	})
	await t.step("validates `false`", async t => {
		assert(Literal(false).guard(false))
	})
	await t.step("validates `null`", async t => {
		assert(Literal(null).guard(null))
	})
	await t.step("validates `undefined`", async t => {
		assert(Literal(undefined).guard(undefined))
	})
	await t.step('validates `"Hello, World!"`', async t => {
		assert(Literal("Hello, World!").guard("Hello, World!"))
	})
	await t.step("invalidates `NaN` because JavaScript", async t => {
		assertObjectMatch(Literal(NaN).validate(NaN), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `NaN`, but was `NaN`",
		})
	})
	await t.step("invalidates object", async t => {
		assertObjectMatch(Literal(null).validate({ key: "value" }), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `null`, but was `[object Object]`",
		})
	})
	await t.step("invalidates null prototype object", async t => {
		assertObjectMatch(Literal(null).validate(Object.create(null)), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `null`, but was `[object Object]`",
		})
	})
	await t.step("invalidates null prototype objects", async t => {
		const value = [Object.assign(Object.create(null), { key: "value " }), Object.create(null)]

		assertObjectMatch(Literal(null).validate(value), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `null`, but was `[object Object],[object Object]`",
		})
	})
	await t.step("invalidates symbol", async t => {
		assertObjectMatch(Literal(null).validate(Symbol()), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `null`, but was `Symbol()`",
		})
	})
	await t.step("invalidates symbols", async t => {
		assertObjectMatch(Literal(null).validate([Symbol("example"), Symbol()]), {
			success: false,
			code: "VALUE_INCORRECT",
			message: "Expected literal `null`, but was `Symbol(example),Symbol()`",
		})
	})
})