import Boolean from "./Boolean.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import String from "./String.ts"
import Template from "./Template.ts"
import Union from "./Union.ts"
import Static from "./utils/Static.ts"
import { assert, assertEquals, assertThrows } from "std/assert/mod.ts"

Deno.test("template", async t => {
	await t.step("validates", async t => {
		const Owner = Union(Literal("Bob"), Literal("Jeff"))
		const Dog = Template`${Owner}'s dog`
		type Dog = Static<typeof Dog>
		const dogBob: Dog = "Bob's dog"
		assert(Dog.guard(dogBob))
		const catBob: Dog = "Bob's cat"
		assert(!Dog.guard(catBob))
		const dogJeff: Dog = "Jeff's dog"
		assert(Dog.guard(dogJeff))
		const dogAlice: Dog = "Alice's cat"
		assert(!Dog.guard(dogAlice))
	})
	await t.step("invalidates with correct error messages", async t => {
		const Owner = Union(Literal("Bob"), Literal("Jeff"))
		const Dog = Template(["", "'s dog"] as const, Owner)
		type Dog = Static<typeof Dog>
		// @ts-expect-error: This should fail.
		const catBob: Dog = "Bob's cat"
		assertEquals(Dog.validate(catBob), {
			code: "VALUE_INCORRECT",
			message: 'Expected string `${"Bob" | "Jeff"}\'s dog`, but was "Bob\'s cat"',
			success: false,
		})
		// @ts-expect-error: This should fail.
		const dogAlice: Dog = "Alice's cat"
		assertThrows(
			() => Dog.check(dogAlice),
			'Expected string `${"Bob" | "Jeff"}\'s dog`, but was "Alice\'s cat"',
		)
	})
	await t.step("supports convenient arguments form", async t => {
		const Owner = Union(Literal("Bob"), Literal("Jeff"))
		const Dog = Template(Owner, "'s dog")
		type Dog = Static<typeof Dog>
		const catBob: Dog = "Bob's dog"
		Dog.check(catBob)
	})
	await t.step("supports various inner runtypes", async t => {
		const DogCount = Template(
			Number,
			" ",
			Union(Template(Boolean, " "), Literal("")),
			String.withConstraint(s => s.toLowerCase() === "dogs", { name: '"dogs"' }),
		)
		type DogCount = Static<typeof DogCount>
		DogCount.check("101 dogs")
		DogCount.check("101 Dogs")
		assertThrows(() => DogCount.check("101dogs"))
		DogCount.check("101 false dogs")
		assertThrows(() => DogCount.check("101 cats"))
	})
	await t.step("emits TYPE_INCORRECT for values other than string", async t => {
		const Dog = Template("foo")
		assertEquals(Dog.validate(42), {
			code: "TYPE_INCORRECT",
			message: 'Expected string "foo", but was number',
			success: false,
		})
	})
})