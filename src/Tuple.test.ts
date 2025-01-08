import Boolean from "./Boolean.ts"
import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import type Runtype from "./Runtype.ts"
import String from "./String.ts"
import Tuple from "./Tuple.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertObjectMatch } from "@std/assert"

Deno.test("Tuple", async t => {
	await t.step("", async t => {
		const T = Tuple(Literal(0), Literal(1))
		assertObjectMatch(T, { tag: "tuple" })
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

	await t.step("tuple type", async t => {
		assertObjectMatch(Tuple(Number, String, Boolean).inspect([false, "0", true]), {
			code: Failcode.CONTENT_INCORRECT,
			details: {
				0: {
					code: Failcode.TYPE_INCORRECT,
				},
			},
		})
	})

	await t.step("tuple length", async t => {
		assertObjectMatch(Tuple(Number, String, Boolean).inspect([0, "0"]), {
			code: Failcode.CONSTRAINT_FAILED,
		})
	})

	await t.step("tuple nested", async t => {
		assertObjectMatch(Tuple(Number, Object({ name: String })).inspect([0, { name: 0 }]), {
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
		})
	})

	await t.step("tuple 0", async t => {
		assert(Tuple().guard([]))
	})
})