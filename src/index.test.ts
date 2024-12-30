import Array from "./Array.ts"
import BigInt from "./BigInt.ts"
import Boolean from "./Boolean.ts"
import type Brand from "./Brand.ts"
import Constraint from "./Constraint.ts"
import Dictionary from "./Dictionary.ts"
import Function from "./Function.ts"
import Guard from "./Guard.ts"
import InstanceOf, { type Constructor } from "./InstanceOf.ts"
import Intersect from "./Intersect.ts"
import Lazy from "./Lazy.ts"
import Literal from "./Literal.ts"
import Never from "./Never.ts"
import Null from "./Null.ts"
import Nullish from "./Nullish.ts"
import Number from "./Number.ts"
import Object from "./Object.ts"
import Optional from "./Optional.ts"
import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import String from "./String.ts"
import { default as Sym } from "./Symbol.ts"
import Template from "./Template.ts"
import Tuple from "./Tuple.ts"
import Undefined from "./Undefined.ts"
import Union from "./Union.ts"
import Unknown from "./Unknown.ts"
import Void from "./Void.ts"
import Failcode from "./result/Failcode.ts"
import type Failure from "./result/Failure.ts"
import ValidationError from "./result/ValidationError.ts"
import Contract from "./utils/Contract.ts"
import type Reflect from "./utils/Reflect.ts"
import hasKey from "./utils-internal/hasKey.ts"
import { assert, assertEquals, assertThrows, fail } from "assert/mod.ts"
import outdent from "x/outdent@v0.8.0/mod.ts"

const boolTuple = Tuple(Boolean, Boolean, Boolean)
const object1 = Object({ Boolean, Number })
const union1 = Union(Literal(3), String, boolTuple, object1)

type Person = { name: string; likes: Person[] }
const Person: Runtype<Person> = Lazy(() => Object({ name: String, likes: Array(Person) }))
const narcissist: Person = { name: "Narcissus", likes: [] }
narcissist.likes = [narcissist]

type GraphNode = GraphNode[] // graph nodes are just arrays of their neighbors
const GraphNode: Runtype<GraphNode> = Lazy(() => Array(GraphNode))
type Graph = GraphNode[]
const Graph: Runtype<Graph> = Array(GraphNode)
const nodeA: GraphNode = []
const nodeB: GraphNode = [nodeA]
nodeA.push(nodeB)
const barbell: Graph = [nodeA, nodeB]

type BarbellBall = [BarbellBall]
const BarbellBall: Runtype<BarbellBall> = Lazy(() => Tuple(BarbellBall))

type SRDict = { [_: string]: SRDict }
const SRDict: Runtype<SRDict> = Lazy(() => Dictionary(SRDict))
const srDict: SRDict = {}
srDict["self"] = srDict

type Hand = { left: Hand } | { right: Hand }
const Hand: Runtype<Hand> = Lazy(() => Union(Object({ left: Hand }), Object({ right: Hand })))
const leftHand: Hand = { left: undefined as unknown as Hand }
const rightHand: Hand = { right: leftHand }
leftHand.left = rightHand

const Ambi: Runtype<Ambi> = Lazy(() => Intersect(Object({ left: Ambi }), Object({ right: Ambi })))
type Ambi = { left: Ambi; right: Ambi }
const ambi: Ambi = { left: undefined as unknown as Ambi, right: undefined as unknown as Ambi }
ambi.left = ambi
ambi.right = ambi

class SomeClass {
	constructor(public n: number) {}
}
class SomeOtherClass {
	constructor(public n: number) {}
}
const SOMECLASS_TAG = "I am a SomeClass instance (any version)"
class SomeClassV1 {
	constructor(public n: number) {}
	public _someClassTag = SOMECLASS_TAG
	public static isSomeClass = (o: unknown): o is SomeClassV1 =>
		hasKey("_someClassTag", o) && o._someClassTag === SOMECLASS_TAG
}
class SomeClassV2 {
	constructor(public n: number) {}
	public _someClassTag = SOMECLASS_TAG
	public static isSomeClass = (o: unknown): o is SomeClassV2 =>
		hasKey("_someClassTag", o) && o._someClassTag === SOMECLASS_TAG
}

const runtypes = {
	Unknown,
	Never,
	Undefined,
	Null,
	Nullish,
	nullable: Literal(true).nullable(),
	Empty: Object({}),
	Void,
	Boolean,
	true: Literal(true),
	false: Literal(false),
	Number,
	3: Literal(3),
	42: Literal(42),
	bigint: BigInt,
	"42n": Literal(globalThis.BigInt(42)),
	brandedNumber: Number.withBrand("number"),
	String,
	"hello world": Literal("hello world"),
	template0a: Template(),
	template0b: Template``,
	template1a: Template("hello world"),
	template1b: Template`hello world`,
	template2a: Template("I'm ", Union(Literal("ready"), Literal("not ready"))),
	template2b: Template`I'm ${Union(Literal("ready"), Literal("not ready"))}`,
	template3a: Template(Literal("4"), Literal("2")),
	template3b: Template`${Literal("4")}${Literal("2")}`,
	template3c: Template("4", "2"),
	template3d: Template`42`,
	template4: Template`Must be ${Constraint(String, s => s === s.toLowerCase(), {
		name: "LowercaseString",
	})}`,
	Sym,
	SymForRuntypes: Sym("runtypes"),
	symbolArray: Array(Sym),
	boolArray: Array(Boolean),
	boolTuple,
	object1,
	union1,
	Function,
	Person,
	MoreThanThree: Number.withConstraint(n => n > 3),
	MoreThanThreeWithMessage: Number.withConstraint(n => n > 3 || `${n} is not greater than 3`),
	ArrayString: Array(String),
	ArrayNumber: Array(Number),
	ArrayPerson: Array(Person),
	CustomArray: Array(Number).withConstraint(x => x.length > 3, { args: { tag: "length", min: 3 } }),
	CustomArrayWithMessage: Array(Number).withConstraint(
		x => x.length > 3 || `Length array is not greater 3`,
		{ args: { tag: "length", min: 3 } },
	),
	Dictionary: Dictionary(String),
	NumberDictionary: Dictionary(String, "number"),
	UnionDictionary: Dictionary(String, Union(Literal("a"), Literal("b"), Literal(3))),
	DictionaryOfArrays: Dictionary(Array(Boolean)),
	InstanceOfSomeClass: InstanceOf(SomeClass),
	InstanceOfSomeOtherClass: InstanceOf(SomeOtherClass),
	CustomGuardConstraint: Unknown.withGuard(SomeClassV2.isSomeClass),
	CustomGuardType: Guard(SomeClassV2.isSomeClass),
	ChangeType: Unknown.withConstraint<SomeClass>(SomeClassV2.isSomeClass),
	ChangeTypeAndName: Unknown.withConstraint<SomeClass>(
		o => hasKey("_someClassTag", o) && o._someClassTag === SOMECLASS_TAG,
		{
			name: "SomeClass",
		},
	),
	GuardChangeTypeAndName: Guard(
		(o): o is SomeClass => hasKey("_someClassTag", o) && o._someClassTag === SOMECLASS_TAG,
		{
			name: "SomeClass",
		},
	),
	DictionaryOfArraysOfSomeClass: Dictionary(Array(InstanceOf(SomeClass))),
	OptionalBoolean: Optional(Boolean),
	OptionalProperty: Object({ foo: String, bar: Optional(Number) }),
	UnionProperty: Object({ foo: String, bar: Union(Number, Undefined) }),
	ReadonlyNumberArray: Array(Number).asReadonly(),
	ReadonlyObject: Object({ foo: Number, bar: String }).asReadonly(),
	Graph,
	SRDict,
	Hand,
	Ambi,
	BarbellBall,
	EmptyTuple: Tuple(),
	Union: Union(Literal("a"), Literal("b"), Literal(3)),
}

type RuntypeName = keyof typeof runtypes

const runtypeNames = globalThis.Object.keys(runtypes) as RuntypeName[]

class Foo {
	x!: "blah"
} // Should not be recognized as a Dictionary

const testValues: { value: unknown; passes: RuntypeName[] }[] = [
	{ value: undefined, passes: ["Undefined", "Void", "OptionalBoolean", "Nullish"] },
	{ value: null, passes: ["Null", "Void", "nullable", "Nullish"] },
	{ value: true, passes: ["Boolean", "true", "OptionalBoolean", "nullable"] },
	{ value: false, passes: ["Boolean", "false", "OptionalBoolean"] },
	{ value: 3, passes: ["Number", "brandedNumber", 3, "union1", "Union"] },
	{
		value: 42,
		passes: ["Number", "brandedNumber", 42, "MoreThanThree", "MoreThanThreeWithMessage"],
	},
	{ value: globalThis.BigInt(42), passes: ["bigint", "42n"] },
	{ value: "hello world", passes: ["String", "hello world", "union1", "template1a", "template1b"] },
	{ value: "I'm ready", passes: ["String", "union1", "template2a", "template2b"] },
	{ value: "I'm not ready", passes: ["String", "union1", "template2a", "template2b"] },
	{ value: "", passes: ["String", "union1", "template0a", "template0b"] },
	{
		value: "42",
		passes: ["String", "union1", "template3a", "template3b", "template3c", "template3d"],
	},
	{ value: "Must be lowercase", passes: ["String", "union1", "template4"] },
	{ value: "Must be LOWERcase", passes: ["String", "union1"] },
	{ value: [Symbol("0"), Symbol(42), Symbol()], passes: ["symbolArray"] },
	{ value: Symbol(), passes: ["Sym"] },
	{ value: Symbol.for("runtypes"), passes: ["Sym", "SymForRuntypes"] },
	{ value: [true, false, true], passes: ["boolArray", "boolTuple", "union1"] },
	{ value: { Boolean: true, Number: 3 }, passes: ["object1", "union1"] },
	{ value: { Boolean: true }, passes: [] },
	{
		value: { Boolean: true, foo: "hello" },
		passes: ["OptionalProperty"],
	},
	{ value: { Boolean: true, foo: 5 }, passes: [] },
	{ value: (x: number, y: string) => x + y.length, passes: ["Function"] },
	{ value: { name: undefined, likes: [] }, passes: [] },
	{ value: { name: "Jimmy", likes: [{ name: undefined, likes: [] }] }, passes: [] },
	{
		value: { name: "Jimmy", likes: [{ name: "Peter", likes: [] }] },
		passes: ["Person"],
	},
	{ value: { a: "1", b: "2", 3: "4" }, passes: ["Dictionary", "UnionDictionary"] },
	{ value: { "1": "foo", "2": "bar", 3: "baz" }, passes: ["Dictionary", "NumberDictionary"] },
	{ value: ["1", "2"], passes: ["ArrayString", "NumberDictionary"] },
	{ value: ["1", 2], passes: [] },
	{ value: [{ name: "Jimmy", likes: [{ name: "Peter", likes: [] }] }], passes: ["ArrayPerson"] },
	{ value: [{ name: null, likes: [] }], passes: [] },
	{ value: { 1: "1", 2: "2" }, passes: ["Dictionary", "NumberDictionary"] },
	{ value: { a: [], b: [true, false] }, passes: ["DictionaryOfArrays"] },
	{ value: new Foo(), passes: [] },
	{ value: [1, 2, 4], passes: ["ArrayNumber", "ReadonlyNumberArray"] },
	{ value: { Boolean: true, Number: "5" }, passes: [] },
	{
		value: [1, 2, 3, 4],
		passes: ["ArrayNumber", "ReadonlyNumberArray", "CustomArray", "CustomArrayWithMessage"],
	},
	{
		value: new SomeClassV1(42),
		passes: [
			"CustomGuardType",
			"CustomGuardConstraint",
			"ChangeType",
			"ChangeTypeAndName",
			"GuardChangeTypeAndName",
		],
	},
	{
		value: new SomeClassV2(42),
		passes: [
			"CustomGuardType",
			"CustomGuardConstraint",
			"ChangeType",
			"ChangeTypeAndName",
			"GuardChangeTypeAndName",
		],
	},
	{ value: { xxx: [new SomeClass(55)] }, passes: ["DictionaryOfArraysOfSomeClass"] },
	{
		value: { foo: "hello" },
		passes: ["OptionalProperty", "Dictionary"],
	},
	{
		value: { foo: "hello", bar: undefined },
		passes: ["UnionProperty"],
	},
	{ value: { foo: 4, bar: "baz" }, passes: ["ReadonlyObject"] },
	{ value: narcissist, passes: ["Person"] },
	{ value: [narcissist, narcissist], passes: ["ArrayPerson"] },
	{ value: barbell, passes: ["Graph"] },
	{ value: nodeA, passes: ["Graph", "BarbellBall"] },
	{ value: srDict, passes: ["SRDict"] },
	{ value: leftHand, passes: ["Hand", "SRDict"] },
	{ value: ambi, passes: ["Ambi", "Hand", "SRDict"] },
]

const getCircularReplacer = () => {
	const seen = new WeakSet()
	return (_key: string, value: unknown) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) {
				return "<Circular Reference>"
			}
			seen.add(value)
		} else if (typeof value === "symbol" || typeof value === "function") return value.toString()
		return typeof value === "bigint" ? value.toString() + "n" : value
	}
}

for (const { value, passes } of testValues) {
	const valueName = value === undefined ? "undefined" : JSON.stringify(value, getCircularReplacer())
	Deno.test(`${valueName}`, async t => {
		const shouldPass: { [_ in RuntypeName]?: boolean } = {}

		shouldPass.Unknown = true
		shouldPass.Void = true

		if (value !== undefined && value !== null) shouldPass.Empty = true

		for (const name of passes) shouldPass[name] = true

		for (const name of runtypeNames) {
			if (shouldPass[name]) {
				await t.step(` : ${name}`, () => assertAccepts(value, runtypes[name]))
			} else {
				await t.step(`~: ${name}`, () => assertRejects(value, runtypes[name]))
			}
		}
	})
}

Deno.test("contracts", async t => {
	await t.step("0 args", async t => {
		const f = () => 3
		assert(Contract(Number).enforce(f)() === 3)
		try {
			// @ts-expect-error: must fail
			Contract(String).enforce(f)()
			fail("contract was violated but no exception was thrown")
		} catch (exception) {
			assert(exception instanceof ValidationError)
			/* success */
		}
	})

	await t.step("1 arg", async t => {
		const f = (x: string) => x.length
		assert(Contract(String, Number).enforce(f)("hel") === 3)
		try {
			// @ts-expect-error: must fail
			Contract(String, Number).enforce(f)(3)
			fail("contract was violated but no exception was thrown")
		} catch (exception) {
			assert(exception instanceof ValidationError)
			/* success */
		}
	})

	await t.step("2 args", async t => {
		const f = (x: string, y: boolean) => (y ? x.length : 4)
		assert(Contract(String, Boolean, Number).enforce(f)("hello", false) === 4)
		try {
			// @ts-expect-error: must fail
			Contract(String, Boolean, Number).enforce(f)("hello")
			fail("contract was violated but no exception was thrown")
		} catch (exception) {
			assert(exception instanceof ValidationError)
			/* success */
		}
	})
})

Deno.test("check errors", async t => {
	await t.step("tuple type", async t => {
		assertRuntypeThrows(
			[false, "0", true],
			Tuple(Number, String, Boolean),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					"Expected number, but was boolean"
				].
				Object should match [number, string, boolean]
			`,
			{ 0: "Expected number, but was boolean" },
		)
	})

	await t.step("tuple length", async t => {
		assertRuntypeThrows(
			[0, "0"],
			Tuple(Number, String, Boolean),
			Failcode.CONSTRAINT_FAILED,
			"Failed constraint check for [number, string, boolean]: Expected length 3, but was 2",
		)
	})

	await t.step("tuple nested", async t => {
		assertRuntypeThrows(
			[0, { name: 0 }],
			Tuple(Number, Object({ name: String })),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					{
						"name": "Expected string, but was number"
					}
				].
				Object should match [number, { name: string; }]
			`,
			{ 1: { name: "Expected string, but was number" } },
		)
	})

	await t.step("tuple 0", async t => {
		assertAccepts([], Tuple())
	})

	await t.step("array", async t => {
		assertRuntypeThrows(
			[0, 2, "test"],
			Array(Number),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					"Expected number, but was string"
				].
				Object should match number[]
			`,
			{ 2: "Expected number, but was string" },
		)
	})

	await t.step("array nested", async t => {
		assertRuntypeThrows(
			[{ name: "Foo" }, { name: false }],
			Array(Object({ name: String })),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					{
						"name": "Expected string, but was boolean"
					}
				].
				Object should match { name: string; }[]
			`,
			{ 1: { name: "Expected string, but was boolean" } },
		)
	})

	await t.step("array null", async t => {
		assertRuntypeThrows(
			[{ name: "Foo" }, null],
			Array(Object({ name: String })),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					"Expected { name: string; }, but was null"
				].
				Object should match { name: string; }[]
			`,
			{ 1: "Expected { name: string; }, but was null" },
		)
	})

	await t.step("readonly array", async t => {
		assertRuntypeThrows(
			[0, 2, "test"],
			Array(Number).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					"Expected number, but was string"
				].
				Object should match readonly number[]
			`,
			{ 2: "Expected number, but was string" },
		)
	})

	await t.step("readonly array nested", async t => {
		assertRuntypeThrows(
			[{ name: "Foo" }, { name: false }],
			Array(Object({ name: String })).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					{
						"name": "Expected string, but was boolean"
					}
				].
				Object should match readonly { name: string; }[]
			`,
			{ 1: { name: "Expected string, but was boolean" } },
		)
	})

	await t.step("readonly array null", async t => {
		assertRuntypeThrows(
			[{ name: "Foo" }, null],
			Array(Object({ name: String })).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				[
					"Expected { name: string; }, but was null"
				].
				Object should match readonly { name: string; }[]
			`,
			{ 1: "Expected { name: string; }, but was null" },
		)
	})

	await t.step("dictionary", async t => {
		assertRuntypeThrows(
			null,
			Dictionary(String),
			Failcode.TYPE_INCORRECT,
			"Expected { [_: string]: string }, but was null",
		)
	})

	await t.step("dictionary invalid type", async t => {
		assertRuntypeThrows(
			undefined,
			Dictionary(Object({ name: String })),
			Failcode.TYPE_INCORRECT,
			"Expected { [_: string]: { name: string; } }, but was undefined",
		)
		assertRuntypeThrows(
			1,
			Dictionary(Object({ name: String })),
			Failcode.TYPE_INCORRECT,
			"Expected { [_: string]: { name: string; } }, but was number",
		)
	})

	await t.step("dictionary complex", async t => {
		assertRuntypeThrows(
			{ foo: { name: false } },
			Dictionary(Object({ name: String })),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"foo": {
						"name": "Expected string, but was boolean"
					}
				}.
				Object should match { [_: string]: { name: string; } }
			`,
			{ foo: { name: "Expected string, but was boolean" } },
		)
	})

	await t.step("string dictionary", async t => {
		assertRuntypeThrows(
			{ foo: "bar", test: true },
			Dictionary(String),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"test": "Expected string, but was boolean"
				}.
				Object should match { [_: string]: string }
			`,
			{ test: "Expected string, but was boolean" },
		)
	})

	await t.step("number dictionary", async t => {
		assertRuntypeThrows(
			{ 1: "bar", 2: 20 },
			Dictionary(String, "number"),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"2": "Expected string, but was number"
				}.
				Object should match { [_: number]: string }
			`,
			{ 2: "Expected string, but was number" },
		)
	})

	await t.step("object", async t => {
		assertRuntypeThrows(
			{ name: "Jack", age: "10" },
			Object({
				name: String,
				age: Number,
			}),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"age": "Expected number, but was string"
				}.
				Object should match { name: string; age: number; }
			`,
			{ age: "Expected number, but was string" },
		)
	})

	await t.step("object for null prototype", () =>
		assertAccepts(
			globalThis.Object.assign(globalThis.Object.create(null), {
				name: "Jack",
				age: 10,
			}),
			Object({
				name: String,
				age: Number,
			}),
		),
	)

	await t.step("object missing keys", async t => {
		assertRuntypeThrows(
			{ name: "Jack" },
			Object({
				name: String,
				age: Number,
			}),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"age": "Expected number, but was missing"
				}.
				Object should match { name: string; age: number; }
			`,
			{ age: "Expected number, but was missing" },
		)
	})

	await t.step("object complex", async t => {
		assertRuntypeThrows(
			{ name: "Jack", age: 10, likes: [{ title: false }] },
			Object({
				name: String,
				age: Number,
				likes: Array(Object({ title: String })),
			}),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"likes": [
						{
							"title": "Expected string, but was boolean"
						}
					]
				}.
				Object should match { name: string; age: number; likes: { title: string; }[]; }
			`,
			{ likes: { 0: { title: "Expected string, but was boolean" } } },
		)
	})

	await t.step("readonly object", async t => {
		assertRuntypeThrows(
			{ name: "Jack", age: "10" },
			Object({
				name: String,
				age: Number,
			}).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"age": "Expected number, but was string"
				}.
				Object should match { readonly name: string; readonly age: number; }
			`,
			{ age: "Expected number, but was string" },
		)
	})

	await t.step("readonly object missing keys", async t => {
		assertRuntypeThrows(
			{ name: "Jack" },
			Object({
				name: String,
				age: Number,
			}).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"age": "Expected number, but was missing"
				}.
				Object should match { readonly name: string; readonly age: number; }
			`,
			{ age: "Expected number, but was missing" },
		)
	})

	await t.step("readonly object complex", async t => {
		assertRuntypeThrows(
			{ name: "Jack", age: 10, likes: [{ title: false }] },
			Object({
				name: String,
				age: Number,
				likes: Array(Object({ title: String }).asReadonly()),
			}).asReadonly(),
			Failcode.CONTENT_INCORRECT,
			outdent`
				Validation failed:
				{
					"likes": [
						{
							"title": "Expected string, but was boolean"
						}
					]
				}.
				Object should match { readonly name: string; readonly age: number; readonly likes: { readonly title: string; }[]; }
			`,
			{ likes: { 0: { title: "Expected string, but was boolean" } } },
		)
	})

	await t.step("constraint standard message", async t => {
		assertRuntypeThrows(
			new SomeClass(1),
			Unknown.withConstraint<SomeClass>(o => hasKey("n", o) && typeof o.n === "number" && o.n > 3, {
				name: "SomeClass",
			}),
			Failcode.CONSTRAINT_FAILED,
			"Failed constraint check for SomeClass",
		)
	})

	await t.step("constraint custom message", async t => {
		assertRuntypeThrows(
			new SomeClass(1),
			Unknown.withConstraint<SomeClass>(
				o => (hasKey("n", o) && typeof o.n === "number" && o.n > 3 ? true : "n must be 3+"),
				{
					name: "SomeClass",
				},
			),
			Failcode.CONSTRAINT_FAILED,
			"Failed constraint check for SomeClass: n must be 3+",
		)
	})

	await t.step("union", async t => {
		assertRuntypeThrows(
			false,
			Union(Number, String),
			Failcode.TYPE_INCORRECT,
			"Expected number | string, but was boolean",
		)
	})

	await t.step("union for null prototype", async t => {
		assertRuntypeThrows(
			globalThis.Object.assign(globalThis.Object.create(null)),
			Union(Number, String),
			Failcode.TYPE_INCORRECT,
			"Expected number | string, but was object",
		)
	})
})

Deno.test("reflection", async t => {
	const X = Literal("x")
	const Y = Literal("y")

	await t.step("unknown", async t => {
		expectLiteralField(Unknown, "tag", "unknown")
	})

	await t.step("never", async t => {
		expectLiteralField(Never, "tag", "never")
	})

	await t.step("void", async t => {
		expectLiteralField(Void, "tag", "unknown")
	})

	await t.step("boolean", async t => {
		expectLiteralField(Boolean, "tag", "boolean")
	})

	await t.step("number", async t => {
		expectLiteralField(Number, "tag", "number")
	})

	await t.step("bigint", async t => {
		expectLiteralField(BigInt, "tag", "bigint")
	})

	await t.step("string", async t => {
		expectLiteralField(String, "tag", "string")
	})

	await t.step("symbol", async t => {
		expectLiteralField(Sym, "tag", "symbol")
		const SymForRuntypes = Sym("runtypes")
		expectLiteralField(SymForRuntypes, "tag", "symbol")
		expectLiteralField(SymForRuntypes, "key", "runtypes")
		assertRuntypeThrows(
			Symbol.for("runtypes!"),
			Sym("runtypes?"),
			Failcode.VALUE_INCORRECT,
			'Expected symbol key "runtypes?", but was "runtypes!"',
		)
		assertAccepts(Symbol(), Sym(undefined))
		assertRuntypeThrows(
			Symbol.for("undefined"),
			Sym(undefined),
			Failcode.VALUE_INCORRECT,
			'Expected symbol key undefined, but was "undefined"',
		)
		assertRuntypeThrows(
			Symbol(),
			Sym("undefined"),
			Failcode.VALUE_INCORRECT,
			'Expected symbol key "undefined", but was undefined',
		)
	})

	await t.step("literal", async t => {
		expectLiteralField(X, "tag", "literal")
		expectLiteralField(X, "value", "x")
	})

	await t.step("array", async t => {
		expectLiteralField(Array(X), "tag", "array")
		expectLiteralField(Array(X).element, "tag", "literal")
		expectLiteralField(Array(X).element, "value", "x")
	})

	await t.step("array (asReadonly)", async t => {
		expectLiteralField(Array(X).asReadonly(), "tag", "array")
		expectLiteralField(Array(X).asReadonly().element, "tag", "literal")
		expectLiteralField(Array(X).asReadonly().element, "value", "x")
	})

	await t.step("tuple", async t => {
		expectLiteralField(Tuple(X, X), "tag", "tuple")
		assertEquals(
			Tuple(X, X).components.map(C => C.tag),
			["literal", "literal"],
		)
		assertEquals(
			Tuple(X, X).components.map(C => C.value),
			["x", "x"],
		)
	})

	await t.step("string dictionary", async t => {
		const Rec = Dictionary(Unknown)
		expectLiteralField(Rec, "tag", "record")
		expectLiteralField(Rec, "key", "string")
	})

	await t.step("number dictionary", async t => {
		const Rec = Dictionary(Unknown, "number")
		expectLiteralField(Rec, "tag", "record")
		expectLiteralField(Rec, "key", "number")
	})

	await t.step("object", async t => {
		const Rec = Object({ x: Number, y: Literal(3) })
		expectLiteralField(Rec, "tag", "object")
		expectLiteralField(Rec.fields.x, "tag", "number")
		expectLiteralField(Rec.fields.y, "tag", "literal")
		expectLiteralField(Rec.fields.y, "value", 3)
	})

	await t.step("object (asReadonly)", async t => {
		const Rec = Object({ x: Number, y: Literal(3) }).asReadonly()
		expectLiteralField(Rec, "tag", "object")
		expectLiteralField(Rec.fields.x, "tag", "number")
		expectLiteralField(Rec.fields.y, "tag", "literal")
		expectLiteralField(Rec.fields.y, "value", 3)
	})

	await t.step("union", async t => {
		expectLiteralField(Union(X, Y), "tag", "union")
		expectLiteralField(Union(X, Y), "tag", "union")
		assertEquals(
			Union(X, Y).alternatives.map(A => A.tag),
			["literal", "literal"],
		)
		assertEquals(
			Union(X, Y).alternatives.map(A => A.value),
			["x", "y"],
		)
	})

	await t.step("intersect", async t => {
		const intersectees = [Object({ x: Number }), Object({ y: Number })] as const
		const I = Intersect(...intersectees)
		type I = Static<typeof I>
		const i: I = { x: 1, y: 2 }
		expectLiteralField(I, "tag", "intersect")
		assertEquals(
			I.intersectees.map(A => A.tag),
			["object", "object"],
		)
		I.check(i)
	})

	await t.step("optional", async t => {
		const OptionalNumber = Optional(Number)
		expectLiteralField(OptionalNumber, "tag", "optional")
		expectLiteralField(OptionalNumber.underlying, "tag", "number")
		const OptionalNumberShorthand = Number.optional()
		expectLiteralField(OptionalNumberShorthand, "tag", "optional")
		expectLiteralField(OptionalNumberShorthand.underlying, "tag", "number")
	})

	await t.step("function", async t => {
		expectLiteralField(Function, "tag", "function")
	})

	await t.step("lazy", async t => {
		const L = Lazy(() => X)
		expectLiteralField(L, "tag", "literal")
		expectLiteralField(L, "value", "x")
	})

	await t.step("constraint", async t => {
		const C = Number.withConstraint(n => n > 0, { name: "PositiveNumber" })
		expectLiteralField(C, "tag", "constraint")
		expectLiteralField(C.underlying, "tag", "number")
		expectLiteralField(C, "name", "PositiveNumber")
	})

	await t.step("instanceof", async t => {
		class Test {}
		expectLiteralField(InstanceOf(Test), "tag", "instanceof")
		expectLiteralField(Dictionary(Array(InstanceOf(Test))), "tag", "record")
	})

	await t.step("brand", async t => {
		const C = Number.withBrand("someNumber")
		expectLiteralField(C, "tag", "brand")
		expectLiteralField(C.entity, "tag", "number")
	})
})

Deno.test("change static type with Constraint", async t => {
	const test = (value: SomeClassV1): SomeClassV2 => {
		const C = Unknown.withConstraint<SomeClassV2>(SomeClassV2.isSomeClass, {
			name: "SomeClass",
		})

		if (C.guard(value)) {
			return value
		} else {
			return new SomeClassV2(3)
		}
	}
	await t.step("change static type", async t => {
		const value = new SomeClassV1(42)
		const result = test(value)
		// confirm that await t.step's really a SomeClassV1, even though await t.step's type-cast to SomeClassV2
		assert(result instanceof SomeClassV1 === true)
		assert(result.n === 42)
	})
})

// Static tests of reflection
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
;(
	X:
		| Unknown
		| Never
		| Void
		| Boolean
		| Number
		| BigInt
		| String
		| Sym
		| Literal<boolean | number | string>
		| Array<Reflect>
		| Object<{ [_ in string]: Reflect }>
		| Tuple<[Reflect, Reflect]>
		| Union<[Reflect, Reflect]>
		| Intersect<[Reflect, Reflect]>
		| Optional<Reflect>
		| Function
		| Constraint<Reflect>
		| InstanceOf<Constructor<never>>
		| Brand<string, Reflect>,
): Reflect => {
	const check = <A>(X: Runtype<A>): A => X.check({})
	switch (X.tag) {
		case "unknown":
			check<unknown>(X)
			break
		case "never":
			check<never>(X)
			break
		case "boolean":
			check<boolean>(X)
			break
		case "number":
			check<number>(X)
			break
		case "bigint":
			check<bigint>(X)
			break
		case "string":
			check<string>(X)
			break
		case "symbol":
			check<symbol>(X)
			break
		case "literal":
			check<typeof X.value>(X)
			break
		case "array":
			check<ReadonlyArray<Static<typeof X.element>>>(X)
			break
		case "object":
			check<{ readonly [K in keyof typeof X.fields]: Static<(typeof X.fields)[K]> }>(X)
			break
		case "tuple":
			check<[Static<(typeof X.components)[0]>, Static<(typeof X.components)[1]>]>(X)
			break
		case "union":
			check<Static<(typeof X.alternatives)[0]> | Static<(typeof X.alternatives)[1]>>(X)
			break
		case "intersect":
			check<Static<(typeof X.intersectees)[0]> & Static<(typeof X.intersectees)[1]>>(X)
			break
		case "function":
			check<(...args: never[]) => unknown>(X)
			break
		case "constraint":
			check<Static<typeof X.underlying>>(X)
			break
		case "instanceof":
			check<typeof X.ctor>(X)
			break
		case "brand":
			check<Static<typeof X.entity>>(X)
			break
	}

	return X
}

const expectLiteralField = <O, K extends keyof O, V extends O[K]>(o: O, k: K, v: V) => {
	assert(o[k] === v)
}

const assertAccepts = (value: unknown, runtype: RuntypeBase<unknown>) => {
	const result = runtype.validate(value)
	if (result.success === false) fail(result.message)
}

const assertRejects = (value: unknown, runtype: RuntypeBase<unknown>) => {
	const result = runtype.validate(value)
	if (result.success === true)
		fail("value passed validation even though await it was not expected to")
}

const assertRuntypeThrows = <A>(
	value: unknown,
	runtype: RuntypeBase<A>,
	failcode: Failcode,
	errorMessage: string,
	errorDetails?: Failure.Details,
) => {
	const exception = assertThrows(() => runtype.check(value))
	if (!(exception instanceof ValidationError)) throw exception
	assert(exception instanceof ValidationError)
	const { code, message, details } = exception
	assert(code === failcode)
	// TODO: Fix this. Semantics of `details` is inprecise for array types for now.
	// assert(message === errorMessage)
	// if (details !== undefined) {
	// 	if (errorDetails !== undefined)
	// 		assertObjectMatch(details, errorDetails as globalThis.Record<PropertyKey, unknown>)
	// 	else if (String.guard(details)) assert(details === errorMessage)
	// }
}