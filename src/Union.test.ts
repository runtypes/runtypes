import InstanceOf from "./InstanceOf.ts"
import Literal, { type LiteralBase } from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertObjectMatch } from "assert/mod.ts"
import outdent from "x/outdent@v0.8/mod.ts"

const ThreeOrString = Union(Literal(3), String)

Deno.test("union", async t => {
	await t.step("mapped literals", async t => {
		await t.step("works with its static types", async t => {
			const values = ["Unknown", "Online", "Offline"] as const
			type ElementOf<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never
			type LiteralOf<T extends readonly unknown[]> = {
				[K in keyof T]: T[K] extends ElementOf<T>
					? T[K] extends LiteralBase
						? Literal<T[K]>
						: never
					: never
			}
			type L = LiteralOf<typeof values>
			const literals = values.map(Literal) as unknown as L
			const Values = Union<L>(...literals)
			type Values = Static<typeof Values>
			const v: Values = "Online"
			Values.check(v)
		})
	})

	await t.step("match", async t => {
		await t.step("works with exhaustive cases", async t => {
			const match = ThreeOrString.match(
				three => three + 5,
				str => str.length * 4,
			)
			assert(match(3) === 8)
			assert(match("hello") === 20)
		})
	})

	await t.step("discriminated union", async t => {
		await t.step("should pick correct alternative with typescript docs example", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })
			const Circle = Object({ kind: Literal("circle"), radius: Number })

			const Shape = Union(Square, Rectangle, Circle)

			assertObjectMatch(Shape.validate({ kind: "square", size: new Date() }), {
				success: false,
				code: Failcode.CONTENT_INCORRECT,
				message: outdent`
					Validation failed:
					{
						"size": "Expected number, but was Date"
					}.
					Object should match { kind: "square"; size: number; }
				`,
				details: { size: "Expected number, but was Date" },
			})

			assertObjectMatch(Shape.validate({ kind: "rectangle", size: new Date() }), {
				success: false,
				code: Failcode.CONTENT_INCORRECT,
				message: outdent`
					Validation failed:
					{
						"width": "Expected number, but was missing",
						"height": "Expected number, but was missing"
					}.
					Object should match { kind: "rectangle"; width: number; height: number; }
				`,
				details: {
					width: "Expected number, but was missing",
					height: "Expected number, but was missing",
				},
			})

			assertObjectMatch(Shape.validate({ kind: "circle", size: new Date() }), {
				success: false,
				code: Failcode.CONTENT_INCORRECT,
				message: outdent`
					Validation failed:
					{
						"radius": "Expected number, but was missing"
					}.
					Object should match { kind: "circle"; radius: number; }
				`,
				details: { radius: "Expected number, but was missing" },
			})

			assert(!("key" in Shape.validate({ kind: "other", size: new Date() })))
		})

		await t.step("should not pick alternative if the discriminant is not unique", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })
			const CircularSquare = Object({ kind: Literal("square"), radius: Number })

			const Shape = Union(Square, Rectangle, CircularSquare)

			assert(!("key" in Shape.validate({ kind: "square", size: new Date() })))
		})

		await t.step("should not pick alternative if not all types are objects", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })

			const Shape = Union(Square, Rectangle, InstanceOf(Date))

			assert(!("key" in Shape.validate({ kind: "square", size: new Date() })))
		})
	})
})