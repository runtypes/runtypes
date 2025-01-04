import Literal from "./Literal.ts"
import { type Static } from "./Runtype.ts"
import Unknown from "./Unknown.ts"
import { assert } from "@std/assert"

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
})