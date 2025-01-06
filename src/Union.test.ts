import InstanceOf from "./InstanceOf.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import { assert, assertEquals, assertObjectMatch } from "@std/assert"
import outdent from "x/outdent@v0.8.0/mod.ts"

const ThreeOrString = Union(Literal(3), String)

Deno.test("union", async t => {
	await t.step("mapped literals", async t => {
		await t.step("works with its static types", async t => {
			const values = ["Unknown", "Online", "Offline"] as const
			const Values = Union(...values.map(Literal))
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

	await t.step("should never validate with the empty union", async t => {
		const ShouldNever = Union()
		assertEquals(ShouldNever.validate(true), {
			success: false,
			code: Failcode.NOTHING_EXPECTED,
			message: "Expected nothing, but was boolean",
		})
	})

	await t.step("should validate when the discriminant is a union", async t => {
		const FooBar = Object({ foo: Literal("bar") })
		const AB = Object({ type: Union(Literal("A"), Literal("B")), foobar: FooBar })
		const C = Object({ type: Literal("C"), foobar: FooBar })
		const ABC = Union(AB, C)
		type ABC = Static<typeof ABC>
		const input: ABC = {
			type: "C",
			// @ts-expect-error: should fail
			foobar: {},
		}
		assertEquals(ABC.validate(input), {
			success: false,
			code: Failcode.TYPE_INCORRECT,
			message:
				'Expected { type: "A" | "B"; foobar: { foo: "bar"; }; } | { type: "C"; foobar: { foo: "bar"; }; }, but was object',
		})
	})

	await t.step("should validate with union of the same runtype", async t => {
		const This = Object({ size: Number })
		const That = Object({ size: Number })
		const Shape = Union(This, That)
		const result = Shape.validate({ size: {} })
		assertEquals(result, {
			success: false,
			code: "TYPE_INCORRECT",
			message: "Expected { size: number; } | { size: number; }, but was object",
		})
	})

	await t.step("should validate with `Intersect`", async t => {
		const A = Object({ foo: Literal("bar") })
		const B = Intersect(A, Object({ bar: Literal("foo") }))
		const C = Intersect(A, Object({ foobar: Literal("foobar") }))
		const ABC = Union(A, B, C)
		type ABCType = Static<typeof ABC>
		// @ts-expect-error: should fail
		const input: ABCType = { bar: "foo" }
		assertEquals(ABC.validate(input), {
			success: false,
			code: Failcode.TYPE_INCORRECT,
			message:
				'Expected { foo: "bar"; } | ({ foo: "bar"; } & { bar: "foo"; }) | ({ foo: "bar"; } & { foobar: "foobar"; }), but was object',
		})
		assertEquals(A.validate(input), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: outdent`
				Validation failed:
				{
					"foo": "Expected \\"bar\\", but was missing"
				}.
				Object should match { foo: "bar"; }
			`,
			details: {
				foo: 'Expected "bar", but was missing',
			},
		})
		assertEquals(B.validate(input), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: outdent`
				Validation failed:
				{
					"foo": "Expected \\"bar\\", but was missing"
				}.
				Object should match { foo: "bar"; }
			`,
			details: {
				foo: 'Expected "bar", but was missing',
			},
		})
		assertEquals(C.validate(input), {
			success: false,
			code: Failcode.CONTENT_INCORRECT,
			message: outdent`
				Validation failed:
				{
					"foo": "Expected \\"bar\\", but was missing"
				}.
				Object should match { foo: "bar"; }
			`,
			details: {
				foo: 'Expected "bar", but was missing',
			},
		})
	})
})