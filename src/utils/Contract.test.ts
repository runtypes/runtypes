import Contract from "./Contract.ts"
import Array from "../Array.ts"
import Boolean from "../Boolean.ts"
import Literal from "../Literal.ts"
import Number from "../Number.ts"
import String from "../String.ts"
import Tuple from "../Tuple.ts"
import Unknown from "../Unknown.ts"
import ValidationError from "../result/ValidationError.ts"
import { assertEquals, assertThrows } from "@std/assert"

Deno.test("Contract", async t => {
	await t.step("when a function does return a value of a wrong type", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = Contract({ receives: Tuple(), returns: Number }).enforce(
				() =>
					// @ts-expect-error: should fail
					"hi",
			)
			assertThrows(contractedFunction, ValidationError)
		})
	})
	await t.step("when a function does return a promise", async t => {
		await t.step("should validate successfully", async () => {
			const contractedFunction = Contract({ receives: Tuple(), returns: Number }).enforce(() => 7)
			assertEquals(contractedFunction(), 7)
		})
	})
	await t.step("when not enough arguments are provided", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = Contract({
				receives: Tuple(Number),
				returns: Number,
			}).enforce(n => n + 1)
			// @ts-expect-error: should fail
			assertThrows(contractedFunction, ValidationError)
		})
	})
	await t.step("infers the parameter types", async t => {
		const contractedFunction = Contract({
			receives: Tuple(Literal(0)),
			returns: Unknown,
		}).enforce((...args: readonly number[]) => 7 as const)
		assertEquals<7>(contractedFunction(0), 7)
		// @ts-expect-error: should fail
		assertThrows(() => contractedFunction(1), ValidationError)
	})
	await t.step("infers the returned type", async t => {
		const contractedFunction = Contract({
			receives: Array(Unknown),
			returns: Unknown,
		}).enforce(() => 7 as const)
		assertEquals<7>(contractedFunction(), 7)
	})
	await t.step("should parse arguments and return values", async t => {
		const ParseInt = String.withParser(parseInt)
		const contractedFunction = Contract({
			receives: Array(ParseInt),
			returns: Array(ParseInt),
		}).enforce((...args) => args.map(globalThis.String))
		assertEquals(contractedFunction("42", "24"), [42, 24])
	})
	await t.step("skips checking when created without runtypes", async t => {
		const contractedFunction = Contract({}).enforce((a: 42) => a)
		assertEquals<42>(contractedFunction(42), 42)
	})

	await t.step("0 args", async t => {
		const f = () => 3 as const
		assertEquals(Contract({ receives: Tuple(), returns: Number }).enforce(f)(), 3)
		assertThrows(
			() =>
				Contract({ receives: Tuple(), returns: String }).enforce(
					// @ts-expect-error: should fail
					f,
				)(),
			ValidationError,
		)
	})

	await t.step("1 arg", async t => {
		const f = (x: string) => x.length
		const C = Contract({ receives: Tuple(String), returns: Number })
		assertEquals(C.enforce(f)("hel"), 3)
		assertThrows(
			() =>
				C.enforce(f)(
					// @ts-expect-error: should fail
					3,
				),
			ValidationError,
		)
	})

	await t.step("2 args", async t => {
		const f = (x: string, y: boolean) => (y ? x.length : 4)
		const C = Contract({ receives: Tuple(String, Boolean), returns: Number })
		assertEquals(C.enforce(f)("hello", false), 4)
		assertThrows(
			() =>
				// @ts-expect-error: should fail
				C.enforce(f)("hello"),
			ValidationError,
		)
	})
})