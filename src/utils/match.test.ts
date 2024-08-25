import match, { when } from "./match.ts"
import Literal from "../Literal.ts"
import Number from "../Number.ts"
import String from "../String.ts"
import { assert, assertThrows } from "std/assert/mod.ts"

Deno.test("match", async t => {
	await t.step("works", async t => {
		const f: (value: string | number) => number = match(
			when(Literal(42), fortyTwo => fortyTwo / 2),
			when(Number, n => n + 9),
			when(String, s => s.length * 2),
		)

		assert(f(42) === 21)
		assert(f(16) === 25)
		assert(f("yooo") === 8)
		// @ts-expect-error: must fail
		assertThrows(() => f(true), "No alternatives were matched")
	})
})