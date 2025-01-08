import Literal from "./Literal.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assert, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

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
	await t.step("validates `NaN`", async t => {
		assert(Literal(NaN).guard(NaN))
	})
	await t.step("validates `-0` as `0`", async t => {
		assert(Literal(-0).guard(0))
	})
	await t.step("validates `+0` as `-0`", async t => {
		assert(Literal(+0).guard(-0))
	})
	await t.step("invalidates object", async t => {
		const error = assertThrows(() =>
			Literal(null).check(
				// @ts-expect-error: should fail
				{ key: "value" },
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected null, but was object",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
	await t.step("invalidates null prototype object", async t => {
		const error = assertThrows(() => Literal(null).check(Object.create(null)))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected null, but was object",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
	await t.step("invalidates null prototype objects", async t => {
		const error = assertThrows(() =>
			Literal(null).check(
				// @ts-expect-error: should fail
				[Object.assign(Object.create(null), { key: "value " }), Object.create(null)],
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected null, but was array",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
	await t.step("invalidates symbol", async t => {
		const error = assertThrows(() =>
			Literal(null).check(
				// @ts-expect-error: should fail
				Symbol(),
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected null, but was symbol",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
	await t.step("invalidates symbols", async t => {
		const error = assertThrows(() =>
			Literal(null).check(
				// @ts-expect-error: should fail
				[Symbol("example"), Symbol()],
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected null, but was array",
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
})