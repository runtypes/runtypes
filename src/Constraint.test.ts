import Literal from "./Literal.ts"
import { type Parsed, type Static } from "./Runtype.ts"
import String from "./String.ts"
import Unknown from "./Unknown.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import hasKey from "./utils-internal/hasKey.ts"
import isObject from "./utils-internal/isObject.ts"
import {
	assert,
	assertEquals,
	assertInstanceOf,
	assertObjectMatch,
	assertThrows,
} from "@std/assert"

Deno.test("Constraint", async t => {
	await t.step("withConstraint", async t => {
		const True = Literal(true)
		const YourRuntype = Unknown.withConstraint<true>(True.guard)
		type YourRuntype = Static<typeof YourRuntype>
		const x: YourRuntype = true
		// @ts-expect-error: should fail
		const y: YourRuntype = false
		assert(YourRuntype.guard(true))
		// @ts-expect-error: should fail
		assert(!YourRuntype.guard(false))
	})

	await t.step("withGuard", async t => {
		const True = Literal(true)
		const YourRuntype = Unknown.withGuard(True.guard)
		type YourRuntype = Static<typeof YourRuntype>
		const x: YourRuntype = true
		// @ts-expect-error: should fail
		const y: YourRuntype = false
		assert(YourRuntype.guard(true))
		// @ts-expect-error: should fail
		assert(!YourRuntype.guard(false))
	})

	await t.step("withAssertion", async t => {
		const True = Literal(true)
		const YourRuntype = Unknown.withAssertion(True.assert)
		type YourRuntype = Static<typeof YourRuntype>
		const x: YourRuntype = true
		// @ts-expect-error: should fail
		const y: YourRuntype = false
		assert(YourRuntype.guard(true))
		// @ts-expect-error: should fail
		assert(!YourRuntype.guard(false))
	})

	await t.step("constraint standard message", async t => {
		const error = assertThrows(() =>
			Unknown.withConstraint(
				o => isObject(o) && hasKey("n", o) && typeof o.n === "number" && o.n > 3,
			)
				.withBrand("{ n: > 3 }")
				.check({ n: 0 }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Constraint failed",
			failure: {
				code: Failcode.CONSTRAINT_FAILED,
				thrown: undefined,
			},
		})
	})

	await t.step("constraint custom message", async t => {
		const error = assertThrows(() =>
			Unknown.withConstraint(
				o =>
					(isObject(o) && hasKey("n", o) && typeof o.n === "number" && o.n > 3) || "n must be > 3",
			)
				.withBrand("{ n: > 3 }")
				.check({ n: 0 }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Constraint failed: n must be > 3",
			failure: {
				code: Failcode.CONSTRAINT_FAILED,
				thrown: "n must be > 3",
			},
		})
	})

	await t.step("with 1 parser before", async t => {
		const T = String.withParser(parseInt).withGuard(
			(x): x is 42 => typeof x === "number" && x === 42,
		)
		type TStatic = Static<typeof T>
		type TParsed = Parsed<typeof T>
		const x: TStatic = "42"
		const y: TParsed = 42
		assert(T.guard("42"))
		assert(
			!T.guard(
				// @ts-expect-error: should fail
				42,
			),
		)
		assertEquals(T.parse("42"), 42)
	})
	await t.step("with 2 parsers before", async t => {
		const T = String.withParser(parseInt)
			.withParser(globalThis.String)
			.withGuard((x): x is "42" => typeof x === "string" && x === "42")
		type TStatic = Static<typeof T>
		type TParsed = Parsed<typeof T>
		const x: TStatic = "42"
		const y: TParsed = "42"
		assert(T.guard("42"))
		assert(
			!T.guard(
				// @ts-expect-error: should fail
				42,
			),
		)
		assertEquals(T.parse("42"), "42")
	})
	await t.step("with 1 parser before and 1 parser after", async t => {
		const T = String.withParser(parseInt)
			.withGuard((x): x is 42 => typeof x === "number" && x === 42)
			.withParser(x => `${x}` as const)
		type TStatic = Static<typeof T>
		type TParsed = Parsed<typeof T>
		const x: TStatic = "42"
		const y: TParsed = "42"
		assert(T.guard("42"))
		assert(
			!T.guard(
				// @ts-expect-error: should fail
				42,
			),
		)
		assertEquals(T.parse("42"), "42")
	})
})