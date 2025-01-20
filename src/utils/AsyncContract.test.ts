import AsyncContract from "./AsyncContract.ts"
import Array from "../Array.ts"
import Literal from "../Literal.ts"
import Number from "../Number.ts"
import String from "../String.ts"
import Tuple from "../Tuple.ts"
import Unknown from "../Unknown.ts"
import Failcode from "../result/Failcode.ts"
import ValidationError from "../result/ValidationError.ts"
import { assertEquals, assertInstanceOf, assertObjectMatch, assertRejects } from "@std/assert"

Deno.test("AsyncContract", async t => {
	await t.step("when function does not return a promise", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract({ receives: Tuple(), resolves: Number }).enforce(
				() =>
					// @ts-expect-error: should fail
					7,
			)
			const error = await assertRejects(contractedFunction)
			assertInstanceOf(error, ValidationError)
			assertObjectMatch(error, {
				message: "Returned unexpected value: Expected Promise, but was number",
				failure: {
					code: Failcode.RETURN_INCORRECT,
					detail: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			})
		})
	})
	await t.step("when a function does return a promise, but of a wrong awaited type", async t => {
		await t.step("throws a validation error asynchronously", async t => {
			const contractedFunction = AsyncContract({ receives: Tuple(), resolves: Number }).enforce(
				() =>
					// @ts-expect-error: should fail
					Promise.resolve("hi"),
			)
			const error = await assertRejects(contractedFunction)
			assertInstanceOf(error, ValidationError)
			assertObjectMatch(error, {
				message: "Resolved unexpected value: Expected number, but was string",
				failure: {
					code: Failcode.RESOLVE_INCORRECT,
					detail: {
						code: Failcode.TYPE_INCORRECT,
					},
				},
			})
		})
	})
	await t.step("when a function does return a promise", async t => {
		await t.step("should validate successfully", async () => {
			const contractedFunction = AsyncContract({ receives: Tuple(), resolves: Number }).enforce(
				() => Promise.resolve(7),
			)
			assertEquals(await contractedFunction(), 7)
		})
	})
	await t.step("when not enough arguments are provided", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract({
				receives: Tuple(Number),
				resolves: Number,
			}).enforce(n => Promise.resolve(n + 1))
			const error = await assertRejects(
				// @ts-expect-error: should fail
				contractedFunction,
			)
			assertInstanceOf(error, ValidationError)
			assertObjectMatch(error, {
				message: "Received unexpected arguments: Constraint failed: Expected length 1, but was 0",
				failure: {
					code: Failcode.ARGUMENTS_INCORRECT,
					detail: {
						code: Failcode.CONSTRAINT_FAILED,
						thrown: "Expected length 1, but was 0",
					},
				},
			})
		})
	})
	await t.step("infers the parameter types", async t => {
		const contractedFunction = AsyncContract({
			receives: Tuple(Literal(0)),
			resolves: Unknown,
		}).enforce((...args: readonly number[]) => Promise.resolve(7 as const))
		assertEquals<7>(await contractedFunction(0), 7)
		// @ts-expect-error: should fail
		const error = await assertRejects(async () => await contractedFunction(1))
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: "Received unexpected arguments: Expected [0], but was incompatible",
			failure: {
				code: Failcode.ARGUMENTS_INCORRECT,
				detail: {
					code: Failcode.CONTENT_INCORRECT,
					details: {
						0: {
							code: Failcode.VALUE_INCORRECT,
						},
					},
				},
			},
		})
	})
	await t.step("infers the returned type", async t => {
		const contractedFunction = AsyncContract({
			receives: Array(Unknown),
			resolves: Unknown,
		}).enforce(() => Promise.resolve(7 as const))
		assertEquals<7>(await contractedFunction(), 7)
	})
	await t.step("should parse arguments and return values", async t => {
		const ParseInt = String.withParser(parseInt)
		const contractedFunction = AsyncContract({
			receives: Array(ParseInt),
			resolves: Array(ParseInt),
		}).enforce(async (...args) => args.map(globalThis.String))
		assertEquals(await contractedFunction("42", "24"), [42, 24])
	})
	await t.step("skips checking when created without runtypes", async t => {
		const contractedFunction = AsyncContract({}).enforce(async (a: 42) => a)
		assertEquals<42>(await contractedFunction(42), 42)
	})
})