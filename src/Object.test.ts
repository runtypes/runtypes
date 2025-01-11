import Array from "./Array.ts"
import Literal from "./Literal.ts"
import Never from "./Never.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Optional from "./Optional.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Undefined from "./Undefined.ts"
import Failcode from "./result/Failcode.ts"
import type Failure from "./result/Failure.ts"
import ValidationError from "./result/ValidationError.ts"
import {
	assert,
	assertObjectMatch,
	assertNotStrictEquals,
	assertEquals,
	assertThrows,
	assertInstanceOf,
} from "@std/assert"

Deno.test("Object", async t => {
	const CrewMember = Object({
		name: String,
		rank: String,
		home: String,
	})

	await t.step("pick", async t => {
		await t.step("keeps only selected fields", async t => {
			const PetMember = CrewMember.pick("name", "home")
			type PetMember = Static<typeof PetMember>
			const petMember: PetMember = { name: "", home: "" }
			assertEquals(globalThis.Object.keys(PetMember.fields), ["name", "home"])
			assert(PetMember.guard(petMember))
		})
		await t.step("works with empty arguments", async t => {
			const PetMember = CrewMember.pick()
			type PetMember = Static<typeof PetMember>
			const petMember: PetMember = {}
			assertEquals(globalThis.Object.keys(PetMember.fields), [])
			assert(PetMember.guard(petMember))
		})
	})

	await t.step("omit", async t => {
		await t.step("drop selected fields", async t => {
			const PetMember = CrewMember.omit("name", "home")
			type PetMember = Static<typeof PetMember>
			const petMember: PetMember = { rank: "" }
			assertEquals(globalThis.Object.keys(PetMember.fields), ["rank"])
			assert(PetMember.guard(petMember))
		})
		await t.step("works with empty arguments", async t => {
			const PetMember = CrewMember.omit()
			type PetMember = Static<typeof PetMember>
			const petMember: PetMember = { name: "", home: "", rank: "" }
			assertEquals(globalThis.Object.keys(PetMember.fields), ["name", "rank", "home"])
			assert(PetMember.guard(petMember))
		})
	})

	await t.step("extend", async t => {
		await t.step("adds fields", async t => {
			const BaseShapeParams = Object({
				x: Number,
				y: Number,
				width: Number,
				height: Number,
				rotation: Number,
			})
			const PolygonParams = BaseShapeParams.extend({
				sides: Number,
			})
			assertEquals(globalThis.Object.keys(PolygonParams.fields), [
				"x",
				"y",
				"width",
				"height",
				"rotation",
				"sides",
			])
		})

		await t.step("overwrites with a narrower type", async t => {
			// @ts-expect-error: This should fail.
			const WrongPetMember = CrewMember.extend({ name: Optional(String) })
			const PetMember = CrewMember.extend({ name: Literal("pet") })
			type PetMember = Static<typeof PetMember>
			const petMember: PetMember = { name: "pet", home: "", rank: "" }
			const anotherMember = { name: "another", home: "", rank: "" }
			assert(PetMember.guard(petMember))
			assert(!PetMember.guard(anotherMember))
		})

		await t.step("base optional", async t => {
			const O = Object({ optional: String.optional() })
			const P = O.extend({ optional: String })
			const Q = O.extend({ optional: Literal("optional") })
			const R = O.extend({ optional: Literal("optional").optional() })
			// @ts-expect-error: should fail
			const S = O.extend({ optional: Number.optional() })
			const T = O.extend({ optional: String.optional() })
			// @ts-expect-error: should fail
			const U = O.extend({ optional: Undefined })
			const V = O.extend({ unrelated: Undefined })
		})

		await t.step("base required", async t => {
			const O = Object({ required: String })
			// @ts-expect-error: should fail
			const P = O.extend({ required: String.optional() })
			const Q = O.extend({ required: Literal("optional") })
			// @ts-expect-error: should fail
			const R = O.extend({ required: Literal("optional").optional() })
			// @ts-expect-error: should fail
			const S = O.extend({ required: Number })
			const T = O.extend({ required: String })
			// @ts-expect-error: should fail
			const U = O.extend({ required: Undefined })
			const V = O.extend({ unrelated: Undefined })
		})

		await t.step("generic", async t => {
			const NamedBook = Object({
				name: String,
				title: String,
			})
			const extendWithId = <O extends { name: String }>(r: Object.WithUtilities<O>) =>
				r.omit("name").extend({
					// @ts-expect-error: TODO: solve this
					id: String,
				})
			const Book = extendWithId(NamedBook)
			type Book = Static<typeof Book>
			const book: Book = { title: "hello", id: "world" }
		})
	})

	await t.step("optional", async t => {
		const O = Object({ optional: String.optional() })
		assert(O.guard({ optional: "optional" }))
		assert(O.guard({}))
		assert(!O.guard({ optional: undefined }))
	})

	await t.step("exact", async t => {
		const O = Object({ x: String })
		assert(!O.isExact)
		const P = O.exact()
		assert(P.isExact)
		assertNotStrictEquals(O, P)
		assert(O.guard({ x: "hello" }))
		assert(O.guard({ x: "hello", y: "world" }))
		assert(P.guard({ x: "hello" }))
		assert(!P.guard({ x: "hello", y: "world" }))
	})

	await t.step("object", async t => {
		const error = assertThrows(() =>
			Object({ name: String, age: Number }).check({ name: "Jack", age: "10" }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { name: string; age: number; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					age: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})

	await t.step("object for null prototype", () =>
		assert(
			Object({ name: String, age: Number }).guard(
				globalThis.Object.assign(globalThis.Object.create(null), { name: "Jack", age: 10 }),
			),
		),
	)

	await t.step("object missing keys", async t => {
		const error = assertThrows(() => Object({ name: String, age: Number }).check({ name: "Jack" }))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { name: string; age: number; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					age: {
						code: Failcode.PROPERTY_MISSING,
					},
				},
			},
		})
	})

	await t.step("object complex", async t => {
		const error = assertThrows(() =>
			Object({ name: String, age: Number, likes: Array(Object({ title: String })) }).check({
				name: "Jack",
				age: 10,
				likes: [{ title: false }],
			}),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message:
				"Expected { name: string; age: number; likes: { title: string; }[]; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					likes: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							0: {
								code: Failcode.CONTENT_INCORRECT,
								details: {
									title: {
										code: Failcode.TYPE_INCORRECT,
									},
								},
							},
						},
					},
				},
			},
		})
	})

	await t.step("readonly object", async t => {
		const error = assertThrows(() =>
			Object({ name: String, age: Number }).asReadonly().check({ name: "Jack", age: "10" }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected { name: string; age: number; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					age: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})

	await t.step("readonly object missing keys", async t => {
		const error = assertThrows(() =>
			Object({ name: String, age: Number }).asReadonly().check({ name: "Jack" }),
		)
		assert(error)
		assertObjectMatch(error, {
			message: "Expected { name: string; age: number; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					age: {
						code: Failcode.PROPERTY_MISSING,
					},
				},
			},
		})
	})

	await t.step("readonly object complex", async t => {
		const error = assertThrows(() =>
			Object({ name: String, age: Number, likes: Array(Object({ title: String }).asReadonly()) })
				.asReadonly()
				.check({ name: "Jack", age: 10, likes: [{ title: false }] }),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message:
				"Expected { name: string; age: number; likes: { title: string; }[]; }, but was incompatible",
			failure: {
				code: Failcode.CONTENT_INCORRECT,
				details: {
					likes: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							0: {
								code: Failcode.CONTENT_INCORRECT,
								details: {
									title: {
										code: Failcode.TYPE_INCORRECT,
									},
								},
							},
						},
					},
				},
			},
		})
	})

	// TODO: check behavior of parse when value runtype is never or optional

	await t.step("should be immune to prototype pollution", async t => {
		const Sanity = Object({ ["__proto__"]: Never.optional() })
		assertEquals(Sanity.parse({ hello: "world" }), {})
		const error = assertThrows(() =>
			Sanity.parse({
				// @ts-expect-error: should fail
				["__proto__"]: { polluted: true },
			}),
		)
		assert(ValidationError.isValidationError(error))
		assertObjectMatch(error, {
			message: "Expected { __proto__?: never; }, but was incompatible",
			failure: {
				message: "Expected { __proto__?: never; }, but was incompatible",
				code: "CONTENT_INCORRECT",
				details: {}, // <https://github.com/denoland/std/issues/6341>
			},
		})
		// <https://github.com/denoland/std/issues/6341>
		assertObjectMatch(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(error.failure as Failure & { code: typeof Failcode.CONTENT_INCORRECT }).details.__proto__!,
			{
				message: "Expected nothing, but was present",
				code: Failcode.NOTHING_EXPECTED,
			},
		)
		assertEquals(({} as any).polluted, undefined)
	})
})