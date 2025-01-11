import Literal from "./Literal.ts"
import Object from "./Object.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertObjectMatch } from "@std/assert"

Deno.test("Brand", async t => {
	await t.step("validates inner", async t => {
		assert(Literal(true).withBrand("True").check(true))
	})

	await t.step("represented by the brand string in error messages", async t => {
		assertObjectMatch(Object({}).exact().withBrand("Empty").inspect({ extra: true }), {
			message: "Expected Empty, but was incompatible",
			code: Failcode.TYPE_INCORRECT,
			detail: {
				message: "Expected exact {}, but was incompatible",
				code: Failcode.CONTENT_INCORRECT,
				details: {
					extra: {
						message: "Expected nothing, but was boolean",
						code: Failcode.PROPERTY_PRESENT,
					},
				},
			},
		})
	})
})