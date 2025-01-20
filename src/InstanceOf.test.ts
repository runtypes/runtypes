import InstanceOf from "./InstanceOf.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

Deno.test("InstanceOf", async t => {
	await t.step("captures thrown value", async t => {
		const thrown = new Error("something's wrong!")
		const T = InstanceOf(
			class {
				static [Symbol.hasInstance]() {
					throw thrown
				}
			},
		)
		const error = assertThrows(() => T.check(42))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error.failure, {
			message: "`instanceof` failed in (Anonymous class): something's wrong!",
			code: Failcode.INSTANCEOF_FAILED,
			thrown,
		})
	})
})