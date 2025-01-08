import Array from "./Array.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import String from "./String.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assert, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

Deno.test("Array", async t => {
	await t.step("guard", async t => {
		const R = Array(Number)
		assert(R.guard([42]))
	})
	await t.step("withConstraint", async t => {
		const R = Array(Number).withConstraint(array => 0 < array.length)
		assert(R.guard([42]))
	})

	await t.step("array", async t => {
		const error = assertThrows(() => Array(Number).check([0, 2, "test"]))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected number[], but was incompatible",
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

	await t.step("array nested", async t => {
		const error = assertThrows(() =>
			Array(Object({ name: String })).check([{ name: "Foo" }, { name: false }]),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected { name: string; }[], but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					1: {
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

	await t.step("array null", async t => {
		const error = assertThrows(() => Array(Object({ name: String })).check([{ name: "Foo" }, null]))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected { name: string; }[], but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					1: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})

	await t.step("readonly array", async t => {
		const error = assertThrows(() => Array(Number).asReadonly().check([0, 2, "test"]))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected number[], but was incompatible",
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

	await t.step("readonly array nested", async t => {
		const error = assertThrows(() =>
			Array(Object({ name: String }))
				.asReadonly()
				.check([{ name: "Foo" }, { name: false }]),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected { name: string; }[], but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					1: {
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

	await t.step("readonly array null", async t => {
		const error = assertThrows(() =>
			Array(Object({ name: String }))
				.asReadonly()
				.check([{ name: "Foo" }, null]),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			name: "ValidationError",
			message: "Expected { name: string; }[], but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					1: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})
})