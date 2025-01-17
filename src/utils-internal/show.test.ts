import show from "./show.ts"
import Array from "../Array.ts"
import BigInt from "../BigInt.ts"
import Boolean from "../Boolean.ts"
import Function from "../Function.ts"
import InstanceOf from "../InstanceOf.ts"
import Intersect from "../Intersect.ts"
import Lazy from "../Lazy.ts"
import Literal from "../Literal.ts"
import Never from "../Never.ts"
import Null from "../Null.ts"
import Number from "../Number.ts"
import Object from "../Object.ts"
import Optional from "../Optional.ts"
import Record from "../Record.ts"
import type Runtype from "../Runtype.ts"
import String from "../String.ts"
import Symbol from "../Symbol.ts"
import Template from "../Template.ts"
import Tuple from "../Tuple.ts"
import Undefined from "../Undefined.ts"
import Union from "../Union.ts"
import Unknown from "../Unknown.ts"
import Void from "../Void.ts"
import { assertEquals } from "@std/assert"

class TestClass {}

const cases: [Runtype.Core, string][] = [
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
	[Literal('"'), '"\\""'],
	[Template(), '""'],
	[Template("test"), '"test"'],
	[Template("te", "st"), '"test"'],
	[
		Template(
			'"',
			Literal("t").withConstraint(() => true),
			"e",
			"s",
			Literal("t").withConstraint(() => true),
			'"',
		),
		'"\\"test\\""',
	],
	[
		Template('"', Union(Literal('"'), Literal('""'), Literal('"""')), '"'),
		'`"${"\\"" | "\\"\\"" | "\\"\\"\\""}"`',
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
		Template(Union(Literal("foo"), Literal("bar"), Literal("baz").withBrand("qux"))),
		'"foo" | "bar" | qux',
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
	[Array(String).asReadonly(), "string[]"],
	[Record(String, Array(Boolean)), "{ [_: string]: boolean[] }"],
	[Record(Symbol, Array(Boolean)), "{ [_: symbol]: boolean[] }"],
	[Record(Number, Array(Boolean)), "{ [_: number]: boolean[] }"],
	[Record(String.withBrand("Key"), Array(Boolean)), "{ [_: Key]: boolean[] }"],
	[Object({}), "{}"],
	[Object({}).asReadonly(), "{}"],
	[InstanceOf(TestClass), "TestClass"],
	[Array(InstanceOf(TestClass)), "TestClass[]"],
	[Object({ x: String, y: Array(Boolean) }), "{ x: string; y: boolean[]; }"],
	[Object({ x: String, y: Array(Boolean) }), "{ x: string; y: boolean[]; }"],
	[Object({ x: Number, y: Optional(Number) }).asReadonly(), "{ x: number; y?: number; }"],
	[Object({ x: Number, y: Optional(Number) }), "{ x: number; y?: number; }"],
	[Object({ x: Number, y: Union(Number, Undefined) }), "{ x: number; y: number | undefined; }"],
	[Object({ x: String, y: Array(Boolean) }).asReadonly(), "{ x: string; y: boolean[]; }"],
	[Object({ x: String, y: Array(Boolean).asReadonly() }), "{ x: string; y: boolean[]; }"],
	[
		Object({ x: String, y: Array(Boolean).asReadonly() }).asReadonly(),
		"{ x: string; y: boolean[]; }",
	],
	[Object({ x: String, y: Array(Boolean) }).asPartial(), "{ x?: string; y?: boolean[]; }"],
	[Tuple(), "[]"],
	[Tuple(Boolean, Number), "[boolean, number]"],
	[Tuple(...Array(Boolean)), "boolean[]"],
	[Tuple(Boolean, ...Array(Boolean)), "[boolean, ...boolean[]]"],
	[Tuple(...Array(Boolean), Boolean), "[...boolean[], boolean]"],
	[Tuple(Boolean, ...Array(Boolean), Boolean), "[boolean, ...boolean[], boolean]"],
	[Tuple(Boolean, ...Tuple(...Array(Boolean)), Boolean), "[boolean, ...boolean[], boolean]"],
	[
		Tuple(Boolean, ...Tuple(Boolean, ...Array(Boolean), Boolean), Boolean),
		"[boolean, boolean, ...boolean[], boolean, boolean]",
	],
	[Union(Boolean, Number), "boolean | number"],
	[Intersect(Boolean, Number), "boolean & number"],
	[Function, "function"],
	[Lazy(() => Boolean), "boolean"],
	[Number.withConstraint(x => x > 3), "number"],
	[Number.withBrand("someNumber"), "someNumber"],
	[Number.withBrand("someNumber").withConstraint(x => x > 3), "someNumber"],

	// Parenthesization
	[Boolean.and(Number.or(String)), "boolean & (number | string)"],
	[Boolean.or(Number.and(String)), "boolean | (number & string)"],
	[Boolean.or(Object({ x: String, y: Number })), "boolean | { x: string; y: number; }"],
]

Deno.test("show", async t => {
	for (const [T, expected] of cases) {
		const s = show(T as Runtype)
		await t.step(`${s} === ${expected}`, async t => {
			assertEquals(s, expected)
			assertEquals(T.toString(), `[object Runtype<${s}>]`)
		})
	}
})