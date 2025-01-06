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

	await t.step("tuple type", async t => {
		assertEquals(Tuple(Number, String, Boolean).validate([false, "0", true]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected [number, string, boolean], but was incompatible",
			details: {
				0: {
					success: false,
					code: Failcode.TYPE_INCORRECT,
					message: "Expected number, but was boolean",
				},
			},
		})
	})

	await t.step("tuple length", async t => {
		assertEquals(Tuple(Number, String, Boolean).validate([0, "0"]), {
			success: false,
			code: Failcode.CONSTRAINT_FAILED,
			message:
				"Failed constraint check for [number, string, boolean]: Expected length 3, but was 2",
		})
	})

	await t.step("tuple nested", async t => {
		assertEquals(Tuple(Number, Object({ name: String })).validate([0, { name: 0 }]), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: "Expected [number, { name: string; }], but was incompatible",
			details: {
				1: {
					success: false,
					code: Failcode.CONTENT_INCORRECT,
					message: "Expected { name: string; }, but was incompatible",
					details: {
						name: {
							success: false,
							code: Failcode.TYPE_INCORRECT,
							message: "Expected string, but was number",
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