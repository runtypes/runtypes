import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import type Runtype from "./Runtype.ts"
import Tuple from "./Tuple.ts"
import Union from "./Union.ts"
import { assert, assertEquals, assertObjectMatch } from "@std/assert"

Deno.test("Tuple", async t => {
	await t.step("", async t => {
		const T = Tuple(Literal(0), Literal(1))
		assertEquals(T.tag, "tuple")
		assert(globalThis.Array.isArray(T.components))
		assertObjectMatch(T.components, [
			{ tag: "literal", value: 0 },
			{ tag: "literal", value: 1 },
		] as Record<number, Runtype.Base<Literal>>)
	})
	await t.step("Lazy", async t => {
		type BarbellBall = [BarbellBall] | [true]
		const BarbellBall: Runtype.Core<BarbellBall> = Lazy(() =>
			Union(Tuple(BarbellBall), Tuple(Literal(true))),
		)
		assert(BarbellBall.guard([[[true]]]))
		assert(!BarbellBall.guard([[[]]]))
	})
})