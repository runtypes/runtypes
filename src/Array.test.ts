import Array from "./Array.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import String from "./String.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertEquals } from "@std/assert"

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
		assertEquals(Array(Number).validate([0, 2, "test"]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected number[], but was incompatible",
			details: {
				2: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected number, but was string",
				},
			},
		})
	})

	await t.step("array nested", async t => {
		assertEquals(Array(Object({ name: String })).validate([{ name: "Foo" }, { name: false }]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected { name: string; }[], but was incompatible",
			details: {
				1: {
					success: false,
					code: Failcode.CONTENT_INCORRECT,
					message: "Expected { name: string; }, but was incompatible",
					details: {
						name: {
							success: false,
							code: Failcode.TYPE_INCORRECT,
							message: "Expected string, but was boolean",
						},
					},
				},
			},
		})
	})

	await t.step("array null", async t => {
		assertEquals(Array(Object({ name: String })).validate([{ name: "Foo" }, null]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected { name: string; }[], but was incompatible",
			details: {
				1: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected { name: string; }, but was null",
				},
			},
		})
	})

	await t.step("readonly array", async t => {
		assertEquals(Array(Number).asReadonly().validate([0, 2, "test"]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected number[], but was incompatible",
			details: {
				2: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected number, but was string",
				},
			},
		})
	})

	await t.step("readonly array nested", async t => {
		assertEquals(
			Array(Object({ name: String }))
				.asReadonly()
				.validate([{ name: "Foo" }, { name: false }]),
			{
				success: false,
				code: Failcode.CONTENT_INCORRECT,
				message: "Expected { name: string; }[], but was incompatible",
				details: {
					1: {
						success: false,
						code: Failcode.CONTENT_INCORRECT,
						message: "Expected { name: string; }, but was incompatible",
						details: {
							name: {
								success: false,
								code: Failcode.TYPE_INCORRECT,
								message: "Expected string, but was boolean",
							},
						},
					},
				},
			},
		)
	})

	await t.step("readonly array null", async t => {
		assertEquals(
			Array(Object({ name: String }))
				.asReadonly()
				.validate([{ name: "Foo" }, null]),
			{
				success: false,
				code: Failcode.CONTENT_INCORRECT,
				message: "Expected { name: string; }[], but was incompatible",
				details: {
					1: {
						success: false,
						code: Failcode.TYPE_INCORRECT,
						message: "Expected { name: string; }, but was null",
					},
				},
			},
		)
	})
})