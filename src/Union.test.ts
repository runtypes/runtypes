import InstanceOf from "./InstanceOf.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assert, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

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

		// TODO: parsers
	})

	await t.step("discriminated union", async t => {
		await t.step("should pick correct alternative with typescript docs example", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })
			const Circle = Object({ kind: Literal("circle"), radius: Number })

			const Shape = Union(Square, Rectangle, Circle)

			assertObjectMatch(Shape.inspect({ kind: "square", size: new Date() }), {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							size: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
					1: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							height: {
								code: Failcode.PROPERTY_MISSING,
							},
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							width: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
					2: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							radius: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
				},
			})

			assertObjectMatch(Shape.inspect({ kind: "rectangle", size: new Date() }), {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							size: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
					1: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							height: {
								code: Failcode.PROPERTY_MISSING,
							},
							width: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
					2: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							radius: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
				},
			})

			assertObjectMatch(Shape.inspect({ kind: "circle", size: new Date() }), {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							size: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
					1: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							height: {
								code: Failcode.PROPERTY_MISSING,
							},
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							width: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
					2: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							radius: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
				},
			})

			assertObjectMatch(
				Shape.inspect({ kind: "other", size: new Date() }),

				{
					code: Failcode.TYPE_INCORRECT,
					details: {
						0: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								kind: {
									code: Failcode.VALUE_INCORRECT,
								},
								size: {
									code: Failcode.TYPE_INCORRECT,
								},
							},
						},
						1: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								height: {
									code: Failcode.PROPERTY_MISSING,
								},
								kind: {
									code: Failcode.VALUE_INCORRECT,
								},
								width: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
						2: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								kind: {
									code: Failcode.VALUE_INCORRECT,
								},
								radius: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
					},
				},
			)
		})

		await t.step("should not pick alternative if the discriminant is not unique", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })
			const CircularSquare = Object({ kind: Literal("square"), radius: Number })

			const Shape = Union(Square, Rectangle, CircularSquare)

			assertObjectMatch(Shape.inspect({ kind: "square", size: new Date() }), {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							size: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
					1: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							height: {
								code: Failcode.PROPERTY_MISSING,
							},
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							width: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
					2: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							radius: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
				},
			})
		})

		await t.step("should not pick alternative if not all types are objects", async t => {
			const Square = Object({ kind: Literal("square"), size: Number })
			const Rectangle = Object({ kind: Literal("rectangle"), width: Number, height: Number })

			const Shape = Union(Square, Rectangle, InstanceOf(Date))

			assertObjectMatch(Shape.inspect({ kind: "square", size: new Date() }), {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							size: {
								code: Failcode.TYPE_INCORRECT,
							},
						},
					},
					1: {
						code: Failcode.CONTENT_INCORRECT,
						details: {
							height: {
								code: Failcode.PROPERTY_MISSING,
							},
							kind: {
								code: Failcode.VALUE_INCORRECT,
							},
							width: {
								code: Failcode.PROPERTY_MISSING,
							},
						},
					},
					2: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			})
		})
	})

	await t.step("should never validate with the empty union", async t => {
		const ShouldNever = Union()
		assertObjectMatch(ShouldNever.inspect(true), {
			code: Failcode.NOTHING_EXPECTED,
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
		assertObjectMatch(ABC.inspect(input), {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foobar: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								foo: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
						type: {
							code: Failcode.TYPE_INCORRECT,
							details: {
								0: {
									code: Failcode.VALUE_INCORRECT,
								},
								1: {
									code: Failcode.VALUE_INCORRECT,
								},
							},
						},
					},
				},
				1: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foobar: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								foo: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
					},
				},
			},
		})
	})

	await t.step("should validate with union of the same runtype", async t => {
		const This = Object({ size: Number })
		const That = Object({ size: Number })
		const Shape = Union(This, That)
		const result = Shape.inspect({ size: {} })
		assertObjectMatch(result, {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						size: {
							code: Failcode.TYPE_INCORRECT,
						},
					},
				},
				1: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						size: {
							code: Failcode.TYPE_INCORRECT,
						},
					},
				},
			},
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
		assertObjectMatch(ABC.inspect(input), {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foo: {
							code: Failcode.PROPERTY_MISSING,
						},
					},
				},
				1: {
					code: Failcode.TYPE_INCORRECT,
					details: {
						0: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								foo: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
					},
				},
				2: {
					code: Failcode.TYPE_INCORRECT,
					details: {
						1: {
							code: Failcode.CONTENT_INCORRECT,
							details: {
								foobar: {
									code: Failcode.PROPERTY_MISSING,
								},
							},
						},
					},
				},
			},
		})
		assertObjectMatch(A.inspect(input), {
			code: Failcode.CONTENT_INCORRECT,
			details: {
				foo: {
					code: Failcode.PROPERTY_MISSING,
				},
			},
		})
		assertObjectMatch(B.inspect(input), {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foo: {
							code: Failcode.PROPERTY_MISSING,
						},
					},
				},
			},
		})
		assertObjectMatch(C.inspect(input), {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foo: {
							code: Failcode.PROPERTY_MISSING,
						},
					},
				},
				1: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						foobar: {
							code: Failcode.PROPERTY_MISSING,
						},
					},
				},
			},
		})
	})

	await t.step("should report details #0", async t => {
		const error = assertThrows(() =>
			Union(Number, String).check(
				// @ts-expect-error: should fail
				false,
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Expected number | string, but was incompatible",
			failure: {
				code: Failcode.TYPE_INCORRECT,
				details: {
					0: {
						code: Failcode.TYPE_INCORRECT,
					},
					1: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			},
		})
	})

	await t.step("should report details #1", async t => {
		assertObjectMatch(Union(Number, String).inspect(globalThis.Object.create(null)), {
			code: Failcode.TYPE_INCORRECT,
			details: {
				0: {
					code: Failcode.TYPE_INCORRECT,
				},
				1: {
					code: Failcode.TYPE_INCORRECT,
				},
			},
		})
	})
})