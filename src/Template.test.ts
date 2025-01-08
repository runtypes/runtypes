import Boolean from "./Boolean.ts"
import Literal from "./Literal.ts"
import Number from "./Number.ts"
import { type Static } from "./Runtype.ts"
import String from "./String.ts"
import Template from "./Template.ts"
import Union from "./Union.ts"
import Failcode from "./result/Failcode.ts"
import ValidationError from "./result/ValidationError.ts"
import { assert, assertInstanceOf, assertObjectMatch, assertThrows } from "@std/assert"

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
		const error0 = assertThrows(() => Dog.check(catBob))
		assertInstanceOf(error0, ValidationError)
		assertObjectMatch(error0, {
			message: 'Expected `${"Bob" | "Jeff"}\'s dog`, but was "Bob\'s cat"',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
		// @ts-expect-error: This should fail.
		const dogAlice: Dog = "Alice's cat"
		const error1 = assertThrows(() => Dog.check(dogAlice))
		assertInstanceOf(error1, ValidationError)
		assertObjectMatch(error1, {
			message: 'Expected `${"Bob" | "Jeff"}\'s dog`, but was "Alice\'s cat"',
			failure: {
				code: Failcode.VALUE_INCORRECT,
			},
		})
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
			String.withConstraint(s => s.toLowerCase() === "dogs"),
		)

		type DogCount = Static<typeof DogCount>
		DogCount.check("101 dogs")
		DogCount.check("101 Dogs")
		// @ts-expect-error: should fail
		assertThrows(() => DogCount.check("101dogs"))
		DogCount.check("101 false dogs")
		assertThrows(() => DogCount.check("101 cats"))
	})

	await t.step("emits TYPE_INCORRECT for values other than string", async t => {
		const Dog = Template("foo")
		const error = assertThrows(() =>
			Dog.check(
				// @ts-expect-error: should fail
				42,
			),
		)
		assertInstanceOf(error, ValidationError)
		assertObjectMatch(error, {
			message: 'Expected "foo", but was number',
			failure: {
				code: Failcode.TYPE_INCORRECT,
			},
		})
	})
})