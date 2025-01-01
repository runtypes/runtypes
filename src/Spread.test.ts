import Array from "./Array.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import { type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import Tuple from "./Tuple.ts"
import Union from "./Union.ts"
import { assert, assertEquals, assertObjectMatch, assertThrows } from "@std/assert"

Deno.test("Spread", async t => {
	await t.step("content", async t => {
		const T = Tuple(Literal(0), Literal(1), Literal(2))
		const S = Spread(T)
		assertObjectMatch(S, { tag: "spread", content: T })
	})
	await t.step("Symbol.iterator tuple", async t => {
		const SpreadTuple = Tuple(Literal(0), ...Tuple(Literal(1), Literal(2)), Literal(3))
		type SpreadTuple = Static<typeof SpreadTuple>
		const spreadTuple: SpreadTuple = [0, 1, 2, 3]
		assert(globalThis.Array.isArray(SpreadTuple.components))
	})
	await t.step("Symbol.iterator array", async t => {
		const SpreadArray = Tuple(Literal(0), ...Array(Literal(1)), Literal(2))
		type SpreadArray = Static<typeof SpreadArray>
		const spreadArray: SpreadArray = [0, 1, 1, 1, 2]
		assert(!globalThis.Array.isArray(SpreadArray.components))
	})
	await t.step("spread tuple", async t => {
		const A = Tuple(Literal(0), Literal(1), Literal(2))
		assertObjectMatch(Spread(A), { tag: "spread", content: A })
		const B = Tuple(Literal(0), Spread(A), Literal(2))
		const C = Tuple(Literal(0), ...A, Literal(2))
		assert(globalThis.Array.isArray(B.components))
		assert(globalThis.Array.isArray(C.components))
		assertEquals(B.components.length, C.components.length)
		type B = Static<typeof B>
		const b0: B = [0, 0, 1, 2, 2]
		assert(B.guard(b0))
		// @ts-expect-error: should fail
		const b1: B = [0, 1, 2, 3]
		assert(!B.guard(b1))
	})
	await t.step("spread array", async t => {
		const A = Array(Literal(0))
		const B = Tuple(Spread(A))
		const C = Tuple(...A)
		assert(!globalThis.Array.isArray(B.components))
		assert(!globalThis.Array.isArray(C.components))
		assertEquals(B.components.rest.tag, C.components.rest.tag)
		type B = Static<typeof B>
		const b0: B = [0]
		assert(B.guard(b0))
		// @ts-expect-error: should fail
		const b1: B = [1]
		assert(!B.guard(b1))
	})
	await t.step("spread array in the middle", async t => {
		const A = Array(Literal(1))
		const B = Tuple(Literal(0), Spread(A), Literal(2))
		const C = Tuple(Literal(0), ...A, Literal(2))
		assert(!globalThis.Array.isArray(B.components))
		assert(!globalThis.Array.isArray(C.components))
		assertEquals(B.components.rest.tag, C.components.rest.tag)
		type B = Static<typeof B>
		const b0: B = [0, 1, 1, 1, 2]
		assert(B.guard(b0))
		const b1: B = [0, 2]
		assert(B.guard(b1))
		// @ts-expect-error: should fail
		const b2: B = [0, -1, 2]
		assert(!B.guard(b2))
	})
	await t.step("brand", async t => {
		const X = Tuple().withBrand("")
		const T = Tuple(Literal(0), Spread(X), Literal(1))
		const U = Tuple(Literal(0), ...X, Literal(1))
	})
	await t.step("union", async t => {
		const X = Union(Tuple())
		const T = Tuple(Literal(0), Spread(X), Literal(1))
		const U = Tuple(Literal(0), ...X, Literal(1))
	})
	await t.step("intersect", async t => {
		const X = Intersect(Tuple())
		const T = Tuple(Literal(0), Spread(X), Literal(1))
		const U = Tuple(Literal(0), ...X, Literal(1))
	})
	await t.step("complex", async t => {
		const X = Intersect(Union(Tuple())).withBrand("")
		const T = Tuple(Literal(0), Spread(X), Literal(1))
		const U = Tuple(Literal(0), ...X, Literal(1))
	})
	await t.step("unsupported", async t => {
		const X = Intersect(Union(Tuple(), Tuple()).withBrand("X"))
		// @ts-expect-error: should fail
		const T = Tuple(Literal(0), Spread(X), Literal(1))
		// @ts-expect-error: should fail
		const U = Tuple(Literal(0), ...X, Literal(1))
		assertThrows(() => T.components)
		assertThrows(() => U.components)
	})
})