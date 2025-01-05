import AsyncContract from "./AsyncContract.ts"
import Array from "../Array.ts"
import Literal from "../Literal.ts"
import Number from "../Number.ts"
import String from "../String.ts"
import Tuple from "../Tuple.ts"
import Unknown from "../Unknown.ts"
import ValidationError from "../result/ValidationError.ts"
import { assertEquals, assertRejects } from "@std/assert"

Deno.test("AsyncContract", async t => {
	await t.step("when function does not return a promise", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract({ receives: Tuple(), returns: Number }).enforce(
				() =>
					// @ts-expect-error: should fail
					7,
			)
			assertRejects(contractedFunction, ValidationError)
		})
	})
	await t.step("when a function does return a promise, but of a wrong awaited type", async t => {
		await t.step("throws a validation error asynchronously", async t => {
			const contractedFunction = AsyncContract({ receives: Tuple(), returns: Number }).enforce(() =>
				// @ts-expect-error: should fail
				Promise.resolve("hi"),
			)
			assertRejects(contractedFunction, ValidationError)
		})
	})
	await t.step("when a function does return a promise", async t => {
		await t.step("should validate successfully", async () => {
			const contractedFunction = AsyncContract({ receives: Tuple(), returns: Number }).enforce(() =>
				Promise.resolve(7),
			)
			assertEquals(await contractedFunction(), 7)
		})
	})
	await t.step("when not enough arguments are provided", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract({
				receives: Tuple(Number),
				returns: Number,
			}).enforce(n => Promise.resolve(n + 1))
			// @ts-expect-error: should fail
			assertRejects(contractedFunction, ValidationError)
		})
	})
	await t.step("infers the parameter types", async t => {
		const contractedFunction = AsyncContract({
			receives: Tuple(Literal(0)),
			returns: Unknown,
		}).enforce((...args: readonly number[]) => Promise.resolve(7 as const))
		assertEquals<7>(await contractedFunction(0), 7)
		// @ts-expect-error: should fail
		assertRejects(async () => await contractedFunction(1), ValidationError)
	})
	await t.step("infers the returned type", async t => {
		const contractedFunction = AsyncContract({
			receives: Array(Unknown),
			returns: Unknown,
		}).enforce(() => Promise.resolve(7 as const))
		assertEquals<7>(await contractedFunction(), 7)
	})
	await t.step("should parse arguments and return values", async t => {
		const ParseInt = String.withParser(parseInt)
		const contractedFunction = AsyncContract({
			receives: Array(ParseInt),
			returns: Array(ParseInt),
		}).enforce(async (...args) => args.map(globalThis.String))
		assertEquals(await contractedFunction("42", "24"), [42, 24])
	})
	await t.step("skips checking when created without runtypes", async t => {
		const contractedFunction = AsyncContract({}).enforce(async (a: 42) => a)
		assertEquals<42>(await contractedFunction(42), 42)
	})
})