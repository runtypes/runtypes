import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Optional from "./Optional.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Undefined from "./Undefined.ts"
import { assert, assertEquals, assertNotStrictEquals } from "@std/assert"

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
})