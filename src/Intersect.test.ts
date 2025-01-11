import Intersect from "./Intersect.ts"
import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import Object from "./Object.ts"
import type Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import { assert, assertEquals } from "@std/assert"

Deno.test("Intersect", async t => {
	await t.step("should always validate with the empty intersect", async t => {
		const ShouldAlways = Intersect()
		assert(ShouldAlways.guard(true))
	})

	await t.step("should merge properties after parsing", async t => {
		const A = Object({ a: Literal("a") })
		const B = Object({ b: Literal("b") })
		const C = Object({ c: Literal("c") })
		const AB = A.and(B)
		const ABC = A.and(B).and(C)
		type ABC = Static<typeof ABC>
		const abc: ABC = { a: "a", b: "b", c: "c" }
		assertEquals(AB.parse(abc), { a: "a", b: "b" })
		assertEquals(ABC.parse(abc), { a: "a", b: "b", c: "c" })
	})

	await t.step("should narrow parsed value correctly", async t => {
		const A = Object({ a: Literal("a") })
		const B = Object({ a: String })
		const AB = A.and(B)
		type AB = Static<typeof AB>
		const ab: AB = { a: "a" }
		const a = AB.parse(ab).a
		// @ts-expect-error: should fail
		const b: typeof a = "b"
		assertEquals(a, "a")
	})

	await t.step("should parse recursive object", async t => {
		const Ambi: Runtype.Core<Ambi> = Lazy(() =>
			Intersect(Object({ left: Ambi }), Object({ right: Ambi })),
		)
		type Ambi = { left: Ambi } & { right: Ambi }
		const ambi: Ambi = { left: undefined as unknown as Ambi, right: undefined as unknown as Ambi }
		ambi.left = ambi
		ambi.right = ambi
		assert(Ambi.check(ambi) === ambi)
		assertEquals(ambi, ambi)
		// TODO
		// assertEquals(Ambi.parse(ambi), ambi)
	})
})