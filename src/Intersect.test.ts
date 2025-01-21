import Intersect from "./Intersect.ts"
import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import Object from "./Object.ts"
import type Runtype from "./Runtype.ts"
import { type Parsed, type Static } from "./Runtype.ts"
import String from "./String.ts"
import { assert, assertEquals, assertThrows } from "@std/assert"

Deno.test("Intersect", async t => {
	await t.step("should always validate with the empty intersect", async t => {
		const ShouldAlways = Intersect()
		assert(ShouldAlways.guard(true))
	})

	await t.step("should infer parsed value correctly", async t => {
		const A = Object({ a: Literal("a") })
		const B = Object({ a: String })
		const AB = A.and(B)
		type ABStatic = Static<typeof AB>
		type ABParsed = Parsed<typeof AB>
		const abStatic = { a: "a" as const } satisfies ABStatic
		const abParsed = { a: "some" as const } satisfies ABParsed
		const a = AB.parse(abStatic).a
		assertThrows(() =>
			AB.parse(
				// @ts-expect-error: should fail
				abParsed,
			),
		)
		const some: typeof a = "some"
		assertEquals(a, "a")
	})

	await t.step("should parse recursive object", async t => {
		const Ambi: Runtype.Core<Ambi, AmbiParsed> = Lazy(() =>
			Intersect(Object({ left: Ambi }), Object({ right: Ambi })),
		)
		type AmbiParsed = { right: AmbiParsed }
		type Ambi = { left: Ambi } & { right: Ambi }
		const ambi: Ambi = { left: undefined as unknown as Ambi, right: undefined as unknown as Ambi }
		ambi.left = ambi
		ambi.right = ambi
		assert(Ambi.check(ambi) === ambi)
		const ambiParsed = { right: undefined as unknown as AmbiParsed }
		ambiParsed.right = ambiParsed
		const parsed = Ambi.parse(ambi)
		assert(parsed !== ambiParsed)
		assertEquals(parsed, ambiParsed)
	})
})