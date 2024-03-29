import show from "./show.ts"
import Array from "../Array.ts"
import BigInt from "../BigInt.ts"
import Boolean from "../Boolean.ts"
import Dictionary from "../Dictionary.ts"
import Function from "../Function.ts"
import InstanceOf from "../InstanceOf.ts"
import Intersect from "../Intersect.ts"
import Lazy from "../Lazy.ts"
import Literal from "../Literal.ts"
import Never from "../Never.ts"
import Null from "../Null.ts"
import Number from "../Number.ts"
import Optional from "../Optional.ts"
import Record, { Partial } from "../Record.ts"
import String from "../String.ts"
import Symbol from "../Symbol.ts"
import Template from "../Template.ts"
import Tuple from "../Tuple.ts"
import Undefined from "../Undefined.ts"
import Union from "../Union.ts"
import Unknown from "../Unknown.ts"
import Void from "../Void.ts"
import Reflect from "../utils/Reflect.ts"
import { assert } from "std/assert/mod.ts"

class TestClass {}

const cases: [Reflect, string][] = [
	[Unknown, "unknown"],
	[Never, "never"],
	[Undefined, "undefined"],
	[Null, "null"],
	[Void, "unknown"],
	[Boolean, "boolean"],
	[Number, "number"],
	[BigInt, "bigint"],
	[String, "string"],
	[Symbol, "symbol"],
	[Symbol("runtypes"), "symbol"],
	[Literal(true), "true"],
	[Literal(3), "3"],
	[Literal("foo"), '"foo"'],
	[Template(), '""'],
	[Template("test"), '"test"'],
	[Template("te", "st"), '"test"'],
	[
		Template(
			Literal("t").withConstraint(() => true),
			"e",
			"s",
			Literal("t").withConstraint(() => true),
		),
		'"test"',
	],
	[Template("foo", Literal("bar"), "baz"), '"foobarbaz"'],
	[Template("foo", Template`foo${Literal("bar")}baz`, "baz"), '"foofoobarbazbaz"'],
	[Template("foo", Union(Literal("foo"), Literal("bar")), "baz"), '`foo${"foo" | "bar"}baz`'],
	[Template(String), "string"],
	[Template("a", Template("b", Template("c", Number))), "`abc${number}`"],
	[Template("", Template(String)), "string"],
	[Template(Template(Number)), "`${number}`"],
	[Template(Number), "`${number}`"],
	[Template("null", Template(String)), "`null${string}`"],
	[Template(Template(Null), String), "`null${string}`"],
	[Template(Intersect(Null)), '"null"'],
	[Template(Intersect(String)), "string"],
	[Template(Union(Null), Union(Number)), "`null${number}`"],
	[Template(Union(Number, Undefined)), '`${number}` | "undefined"'],
	[Template(Union(Number, Undefined), "foo"), "`${number | undefined}foo`"],
	[Template(Null, Template(Number)), "`null${number}`"],
	[
		Template(
			Null.withConstraint(() => true),
			Number.withConstraint(() => true),
		),
		"`null${number}`",
	],
	[Template(Union(Literal("foo"), Literal("bar"))), '"foo" | "bar"'],
	[Template(Literal("baz").withBrand("qux")), "qux"],
	[Template("foo", Literal("baz").withBrand("qux")), "`foo${qux}`"],
	[
		Template(Union(Literal("foo"), Literal("bar")), Literal("baz").withBrand("qux")),
		'`${"foo" | "bar"}${qux}`',
	],
	[
		Template(
			"foo",
			Literal("baz")
				.withBrand("qux")
				.withConstraint(() => true),
		),
		"`foo${qux}`",
	],
	[
		Template(
			Literal("baz")
				.withBrand("qux")
				.withConstraint(() => true),
		),
		"qux",
	],
	[Array(String), "string[]"],
	[Array(String).asReadonly(), "readonly string[]"],
	[Dictionary(Array(Boolean)), "{ [_: string]: boolean[] }"],
	[Dictionary(Array(Boolean), Symbol), "{ [_: symbol]: boolean[] }"],
	[Dictionary(Array(Boolean), "string"), "{ [_: string]: boolean[] }"],
	[Dictionary(Array(Boolean), "number"), "{ [_: number]: boolean[] }"],
	[Record({}), "{}"],
	[Record({}).asReadonly(), "{}"],
	[Partial({}), "{}"],
	[InstanceOf(TestClass), "TestClass"],
	[Array(InstanceOf(TestClass)), "TestClass[]"],
	[Record({ x: String, y: Array(Boolean) }), "{ x: string; y: boolean[]; }"],
	[Record({ x: String, y: Array(Boolean) }), "{ x: string; y: boolean[]; }"],
	[
		Record({ x: Number, y: Optional(Number) }).asReadonly(),
		"{ readonly x: number; readonly y?: number; }",
	],
	[Record({ x: Number, y: Optional(Number) }), "{ x: number; y?: number; }"],
	[Record({ x: Number, y: Union(Number, Undefined) }), "{ x: number; y: number | undefined; }"],
	[Record({ x: Number }).And(Partial({ y: Number })), "{ x: number; } & { y?: number; }"],
	[
		Record({ x: String, y: Array(Boolean) }).asReadonly(),
		"{ readonly x: string; readonly y: boolean[]; }",
	],
	[Record({ x: String, y: Array(Boolean).asReadonly() }), "{ x: string; y: readonly boolean[]; }"],
	[
		Record({ x: String, y: Array(Boolean).asReadonly() }).asReadonly(),
		"{ readonly x: string; readonly y: readonly boolean[]; }",
	],
	[Partial({ x: String, y: Array(Boolean) }), "{ x?: string; y?: boolean[]; }"],
	[Record({ x: String, y: Array(Boolean) }).asPartial(), "{ x?: string; y?: boolean[]; }"],
	[Tuple(Boolean, Number), "[boolean, number]"],
	[Union(Boolean, Number), "boolean | number"],
	[Intersect(Boolean, Number), "boolean & number"],
	[Optional(Number), "number | undefined"],
	[Function, "function"],
	[Lazy(() => Boolean), "boolean"],
	[Number.withConstraint(x => x > 3), "number"],
	[Number.withBrand("someNumber"), "number"],
	[Number.withBrand("someNumber").withConstraint(x => x > 3), "number"],

	// Parenthesization
	[Boolean.And(Number.Or(String)), "boolean & (number | string)"],
	[Boolean.Or(Number.And(String)), "boolean | (number & string)"],
	[Boolean.Or(Record({ x: String, y: Number })), "boolean | { x: string; y: number; }"],
]

Deno.test("show", async t => {
	for (const [T, expected] of cases) {
		const s = show(T)
		await t.step(`${s} === ${expected}`, async t => {
			assert(s === expected)
			assert(T.toString() === `Runtype<${s}>`)
		})
	}
})