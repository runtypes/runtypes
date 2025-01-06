import Array from "./Array.ts"
import Boolean from "./Boolean.ts"
import Intersect from "./Intersect.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import { type Parsed, type Static } from "./Runtype.ts"
import String from "./String.ts"
import Template from "./Template.ts"
import Tuple from "./Tuple.ts"
import Union from "./Union.ts"
import { assert, assertEquals, assertThrows } from "@std/assert"

Deno.test("Parser", async t => {
	const ParseInt = String.withParser(parseInt)
	const Radix16StringOfParsedInt = ParseInt.withParser(n => n.toString(16))

	await t.step("does nothing when validating", async t => {
		assertEquals(ParseInt.check("42"), "42")
	})

	await t.step("parses", async t => {
		await t.step("values into themselves without `Parser`", async t => {
			assertEquals(String.parse("42"), "42")
		})

		await t.step('`"42"` into `42`', async t => {
			assertEquals(ParseInt.parse("42"), 42)
		})

		await t.step("in chain", async t => {
			assertEquals(Radix16StringOfParsedInt.parse("42"), "2a")
		})

		const date = Date.now()
		const toString = (x: number) => new Date(x).toString()
		const DateStringFromNumber = Number.withParser(toString)
		await t.step(`\`${date}\` into \`${toString(date)}\``, async t => {
			assertEquals(DateStringFromNumber.parse(date), toString(date))
		})

		await t.step("`Object` transparently", async t => {
			await t.step("with required properties", async t => {
				const O = Object({ date: Object({ date: DateStringFromNumber }) })
				assertEquals(O.parse({ date: { date } }), { date: { date: toString(date) } })
			})

			await t.step("with optional properties", async t => {
				const O = Object({ date: DateStringFromNumber.optional() })
				assertEquals(O.parse({}), {})
			})

			await t.step("with optional properties with default values", async t => {
				const O = Object({ x: String.withParser(() => 42 as const).default(0 as const) })
				type OStatic = Static<typeof O>
				type OParsed = Parsed<typeof O>
				assertEquals(O.parse({ x: "42" }).x, 42)
				assertEquals(O.parse({}).x, 0)
				const oStatic: OStatic = { x: "hello" }
				const oParsed0: OParsed = { x: 0 }
				const oParsed42: OParsed = { x: 42 }
			})

			await t.step("while filtering out extraneous properties", async t => {
				const O = Object({ date: String.optional() })
				assertEquals(O.parse({ hello: "world" }), {})
				assert(!("hello" in O.parse({ hello: "world" })))
			})
		})

		await t.step("`Array` transparently", async t => {
			const A = Array(ParseInt)
			assertEquals(A.parse([]), [])
			assertEquals(A.parse(["0"]), [0])
			assertEquals(A.parse(["0", "1"]), [0, 1])
		})

		await t.step("`Tuple` transparently", async t => {
			const T = Tuple(ParseInt, Radix16StringOfParsedInt)
			assertEquals(T.parse(["42", "42"]), [42, "2a"])
		})

		await t.step("`Union` transparently", async t => {
			const InUnion = Number.withParser(x => {
				throw new Error()
			}).or(ParseInt)
			assertThrows(() => InUnion.parse(42))
			assertEquals(InUnion.parse("42"), 42)
		})

		await t.step("`Intersect` transparently", async t => {
			const ParseIntAndRadix16 = ParseInt.and(Radix16StringOfParsedInt)
			assertEquals(ParseIntAndRadix16.parse("42"), "2a")
			const Radix16AndParseInt = Radix16StringOfParsedInt.and(ParseInt)
			assertEquals(Radix16AndParseInt.parse("42"), 42)
		})

		await t.step("`Boolean`s", async t => {
			const Flip = Union(
				Boolean.withParser(b => !b),
				Boolean.withParser(b => !!b),
			)
			assertEquals(Flip.parse(true), false)
			const FlipFlip = Intersect(
				Boolean.withParser(b => !b),
				Boolean.withParser(b => !!b),
			)
			assertEquals(FlipFlip.parse(true), true)
		})

		await t.step("`Template` transparently", async t => {
			const TrueToFalse = Literal("true").withParser(() => "false" as const)
			const Value = Template("value: ", TrueToFalse)
			assertEquals(Value.parse("value: true"), "value: false")
		})
	})
})