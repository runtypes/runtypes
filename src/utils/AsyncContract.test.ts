import AsyncContract from "./AsyncContract.ts"
import Number from "../Number.ts"
import ValidationError from "../result/ValidationError.ts"
import { assert, assertThrows } from "@std/assert"

Deno.test("AsyncContract", async t => {
	await t.step("when function does not return a promise", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract(Number).enforce(() => 7 as any)
			assertThrows(contractedFunction, ValidationError)
		})
	})
	await t.step("when a function does return a promise, but for the wrong type", async t => {
		await t.step("throws a validation error asynchronously", async t => {
			const contractedFunction = AsyncContract(Number).enforce(() => Promise.resolve("hi" as any))
			try {
				await contractedFunction()
				assert(false)
			} catch (e) {
				assert(e instanceof ValidationError)
			}
		})
	})
	await t.step("when a function does return a promise", async t => {
		await t.step("should validate successfully", async () => {
			const contractedFunction = AsyncContract(Number).enforce(() => Promise.resolve(7))
			assert((await contractedFunction()) === 7)
		})
	})
	await t.step("when not enough arguments are provided", async t => {
		await t.step("throws a validation error", async t => {
			const contractedFunction = AsyncContract(Number, Number).enforce(n => Promise.resolve(n + 1))
			assertThrows(contractedFunction, ValidationError)
		})
	})
})