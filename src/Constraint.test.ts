import Literal from "./Literal.ts"
import { type Static } from "./Runtype.ts"
import Unknown from "./Unknown.ts"
import Failcode from "./result/Failcode.ts"
import hasKey from "./utils-internal/hasKey.ts"
import isObject from "./utils-internal/isObject.ts"
import { assert, assertEquals } from "@std/assert"

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
		assertEquals(
			Unknown.withConstraint(
				o => isObject(o) && hasKey("n", o) && typeof o.n === "number" && o.n > 3,
			)
				.withBrand("{ n: > 3 }")
				.inspect({ n: 0 }),
			{
				success: false,
				code: Failcode.CONSTRAINT_FAILED,
				// TODO: use brand string in error messages
				message: "Failed constraint check for unknown",
			},
		)
	})

	await t.step("constraint custom message", async t => {
		assertEquals(
			Unknown.withConstraint(
				o =>
					(isObject(o) && hasKey("n", o) && typeof o.n === "number" && o.n > 3) || "n must be > 3",
			)
				.withBrand("{ n: > 3 }")
				.inspect({ n: 0 }),
			{
				success: false,
				code: Failcode.CONSTRAINT_FAILED,
				// TODO: use brand string in error messages
				message: "Failed constraint check for unknown: n must be > 3",
			},
		)
	})
})