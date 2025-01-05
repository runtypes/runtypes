import type Intersect from "./Intersect.ts"
import type Literal from "./Literal.ts"
import { type LiteralBase } from "./Literal.ts"
import { literal } from "./Literal.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import type Union from "./Union.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import escapeRegExp from "./utils-internal/escapeRegExp.ts"
import show from "./utils-internal/show.ts"
import typeOf from "./utils-internal/typeOf.ts"

type InnerValidate = <T>(runtype: Runtype.Core, value: unknown, parsing: boolean) => Result<T>

type TemplateParsed<
	A extends readonly LiteralBase[],
	B extends readonly Runtype.Core<LiteralBase>[],
> = A extends readonly [infer carA, ...infer cdrA]
	? carA extends LiteralBase
		? B extends readonly [infer carB, ...infer cdrB]
			? carB extends Runtype.Core<LiteralBase>
				? cdrA extends readonly LiteralBase[]
					? cdrB extends readonly Runtype.Core<LiteralBase>[]
						? `${carA}${Parsed<carB>}${TemplateParsed<cdrA, cdrB>}`
						: `${carA}${Parsed<carB>}`
					: `${carA}${Parsed<carB>}`
				: `${carA}`
			: `${carA}`
		: ""
	: ""

type TemplateStatic<
	A extends readonly LiteralBase[],
	B extends readonly Runtype.Core<LiteralBase>[],
> = A extends readonly [infer carA, ...infer cdrA]
	? carA extends LiteralBase
		? B extends readonly [infer carB, ...infer cdrB]
			? carB extends Runtype.Core<LiteralBase>
				? cdrA extends readonly LiteralBase[]
					? cdrB extends readonly Runtype.Core<LiteralBase>[]
						? `${carA}${Static<carB>}${TemplateStatic<cdrA, cdrB>}`
						: `${carA}${Static<carB>}`
					: `${carA}${Static<carB>}`
				: `${carA}`
			: `${carA}`
		: ""
	: ""

interface Template<
	A extends readonly [string, ...string[]] = readonly [string, ...string[]],
	B extends readonly Runtype.Core<LiteralBase>[] = readonly Runtype.Core<LiteralBase>[],
> extends Runtype.Common<
		A extends TemplateStringsArray ? string : TemplateStatic<A, B>,
		A extends TemplateStringsArray ? string : TemplateParsed<A, B>
	> {
	tag: "template"
	strings: A
	runtypes: B
}

type ExtractStrings<
	A extends readonly (LiteralBase | Runtype.Core<LiteralBase>)[],
	prefix extends string = "",
> = A extends readonly [infer carA, ...infer cdrA]
	? cdrA extends readonly any[]
		? carA extends Runtype.Core<LiteralBase>
			? [prefix, ...ExtractStrings<cdrA>] // Omit `carA` if it's a `RuntypeBase<LiteralBase>`
			: carA extends LiteralBase
				? [...ExtractStrings<cdrA, `${prefix}${carA}`>]
				: never // `carA` is neither `RuntypeBase<LiteralBase>` nor `LiteralBase` here
		: never // If `A` is not empty, `cdrA` must be also an array
	: [prefix] // `A` is empty here

type ExtractRuntypes<A extends readonly (LiteralBase | Runtype.Core<LiteralBase>)[]> =
	A extends readonly [infer carA, ...infer cdrA]
		? cdrA extends readonly any[]
			? carA extends Runtype.Core<LiteralBase>
				? [carA, ...ExtractRuntypes<cdrA>]
				: carA extends LiteralBase
					? [...ExtractRuntypes<cdrA>]
					: never // `carA` is neither `RuntypeBase<LiteralBase>` nor `LiteralBase`
			: never // If `A` is not empty, `cdrA` must be also an array
		: [] // `A` is empty here

const parseArgs = (
	args:
		| readonly [readonly [string, ...string[]], ...Runtype.Core<LiteralBase>[]]
		| readonly (LiteralBase | Runtype.Core<LiteralBase>)[],
): [[string, ...string[]], Runtype.Core<LiteralBase>[]] => {
	// If the first element is an `Array`, maybe it's called by the tagged style
	if (0 < args.length && Array.isArray(args[0])) {
		const [strings, ...runtypes] = args as readonly [
			readonly [string, ...string[]],
			...Runtype.Core<LiteralBase>[],
		]
		// For further manipulation, recreate an `Array` because `TemplateStringsArray` is readonly
		return [Array.from(strings) as [string, ...string[]], runtypes]
	} else {
		const convenient = args as readonly (LiteralBase | Runtype.Core<LiteralBase>)[]
		const strings = convenient.reduce<[string, ...string[]]>(
			(strings, arg) => {
				// Concatenate every consecutive literals as strings
				if (!Runtype.isRuntype(arg)) strings.push(strings.pop()! + String(arg))
				// Skip runtypes
				else strings.push("")
				return strings
			},
			[""],
		)
		const runtypes = convenient.filter(Runtype.isRuntype) as Runtype.Core<LiteralBase>[]
		return [strings, runtypes]
	}
}

/**
 * Flatten inner runtypes of a `Template` if possible, with in-place strategy
 */
const flattenInnerRuntypes = (
	strings: [string, ...string[]],
	runtypes: Runtype.Core<LiteralBase>[],
): void => {
	for (let i = 0; i < runtypes.length; ) {
		switch (runtypes[i]!.tag) {
			case "literal": {
				const literal = runtypes[i] as Literal<LiteralBase>
				runtypes.splice(i, 1)
				const string = String(literal.value)
				strings.splice(i, 2, strings[i] + string + strings[i + 1])
				break
			}
			case "template": {
				const template = runtypes[i] as Template<[string, ...string[]], Runtype.Core<LiteralBase>[]>
				runtypes.splice(i, 1, ...template.runtypes)
				const innerStrings = template.strings
				if (innerStrings.length === 1) {
					strings.splice(i, 2, strings[i] + innerStrings[0] + strings[i + 1])
				} else {
					const first = innerStrings[0]
					const rest = innerStrings.slice(1, -1)
					const last = innerStrings[innerStrings.length - 1]!
					strings.splice(i, 2, strings[i] + first, ...rest, last + strings[i + 1]!)
				}
				break
			}
			case "union": {
				const union = runtypes[i] as Union
				if (union.alternatives.length === 1) {
					try {
						const literal = getInnerLiteral(union)
						runtypes.splice(i, 1)
						const string = String(literal.value)
						strings.splice(i, 2, strings[i] + string + strings[i + 1])
						break
					} catch (_) {
						i++
						break
					}
				} else {
					i++
					break
				}
			}
			case "intersect": {
				const intersect = runtypes[i] as Intersect
				if (intersect.intersectees.length === 1) {
					try {
						const literal = getInnerLiteral(intersect)
						runtypes.splice(i, 1)
						const string = String(literal.value)
						strings.splice(i, 2, strings[i] + string + strings[i + 1])
						break
					} catch (_) {
						i++
						break
					}
				} else {
					i++
					break
				}
			}
			default:
				i++
				break
		}
	}
}

const normalizeArgs = (
	args:
		| readonly [readonly [string, ...string[]], ...Runtype.Core<LiteralBase>[]]
		| readonly (LiteralBase | Runtype.Core<LiteralBase>)[],
): [[string, ...string[]], Runtype.Core<LiteralBase>[]] => {
	const [strings, runtypes] = parseArgs(args)
	flattenInnerRuntypes(strings, runtypes)
	return [strings, runtypes]
}

const getInnerLiteral = (runtype: Runtype): Literal<LiteralBase> => {
	switch (runtype.tag) {
		case "literal":
			return runtype
		case "brand":
			return getInnerLiteral(runtype.entity as Runtype)
		case "union":
			if (runtype.alternatives.length === 1)
				return getInnerLiteral(runtype.alternatives[0]! as Runtype)
			break
		case "intersect":
			if (runtype.intersectees.length === 1)
				return getInnerLiteral(runtype.intersectees[0]! as Runtype)
			break
		default:
			break
	}
	throw undefined
}

/**
 * Reviver is used for converting string literals such as `"0x2A"` to the actual `42`
 */
type Reviver = (s: string) => string | number | bigint | boolean | null | undefined
const identity: Reviver = s => s
const revivers: {
	[tag in string]?: readonly [Reviver, string, ...string[]]
} = {
	string: [s => String(s), ".*"],
	number: [
		s => Number(s),
		"[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?",
		"0[Bb][01]+",
		"0[Oo][0-7]+",
		"0[Xx][0-9A-Fa-f]+",
		// Note: `"NaN"` isn't here, as TS doesn't allow `"NaN"` to be a `` `${number}` ``
	],
	bigint: [s => BigInt(s), "-?[1-9]d*"],
	boolean: [s => (s === "false" ? false : true), "true", "false"],
	null: [() => null, "null"],
	undefined: [() => undefined, "undefined"],
}

type Revivers = Reviver | Revivers[]
const getReviversFor = (runtype: Runtype): Revivers => {
	switch (runtype.tag) {
		case "literal": {
			const [reviver] = revivers[typeOf(runtype.value)] || [identity]
			return reviver
		}
		case "brand":
			return getReviversFor(runtype.entity as Runtype)
		case "constraint":
			return getReviversFor(runtype.underlying as Runtype)
		case "union":
			return runtype.alternatives.map(alternative => getReviversFor(alternative as Runtype))
		case "intersect":
			return runtype.intersectees.map(alternative => getReviversFor(alternative as Runtype))
		default: {
			const [reviver] = revivers[runtype.tag] || [identity]
			return reviver
		}
	}
}

/** Recursively map corresponding reviver and  */
const reviveValidate =
	(runtype: Runtype, innerValidate: InnerValidate, parsing: boolean) =>
	(value: string): Result<unknown> => {
		const revivers = getReviversFor(runtype)
		if (Array.isArray(revivers)) {
			switch (runtype.tag) {
				case "union":
					for (const alternative of runtype.alternatives) {
						const validated = reviveValidate(alternative as Runtype, innerValidate, parsing)(value)
						if (validated.success) return validated
					}
					return FAILURE.TYPE_INCORRECT(runtype, value)
				case "intersect": {
					let parsed: any = undefined
					for (const intersectee of runtype.intersectees) {
						const validated = reviveValidate(intersectee as Runtype, innerValidate, parsing)(value)
						if (!validated.success) return validated
						parsed = validated.value
					}
					return SUCCESS(parsing ? parsed : value)
				}
				default:
					/* istanbul ignore next */
					throw Error("impossible")
			}
		} else {
			const reviver = revivers
			const validated = innerValidate(runtype, reviver(value), parsing)
			if (!validated.success && validated.code === "VALUE_INCORRECT" && runtype.tag === "literal")
				// TODO: Temporary fix to show unrevived value in message; needs refactor
				return FAILURE.VALUE_INCORRECT(
					"literal",
					`"${literal((runtype as Literal<LiteralBase>).value)}"`,
					`"${value}"`,
				)
			return validated
		}
	}

const getRegExpPatternFor = (runtype: Runtype): string => {
	switch (runtype.tag) {
		case "literal":
			return escapeRegExp(String(runtype.value))
		case "brand":
			return getRegExpPatternFor(runtype.entity as Runtype)
		case "constraint":
			return getRegExpPatternFor(runtype.underlying as Runtype)
		case "union":
			return runtype.alternatives
				.map(alternative => getRegExpPatternFor(alternative as Runtype))
				.join("|")
		case "template": {
			return runtype.strings.map(escapeRegExp).reduce((pattern, string, i) => {
				const prefix = pattern + string
				const r = runtype.runtypes[i]
				if (r) return prefix + `(?:${getRegExpPatternFor(r as Runtype)})`
				else return prefix
			}, "")
		}
		default: {
			const [, ...patterns] = revivers[runtype.tag] || [undefined, ".*"]
			return patterns.join("|")
		}
	}
}

const createRegExpForTemplate = <
	A extends readonly [string, ...string[]],
	B extends readonly Runtype.Core<LiteralBase>[],
>(
	template: Template<A, B>,
) => {
	const pattern = template.strings.map(escapeRegExp).reduce((pattern, string, i) => {
		const prefix = pattern + string
		const r = template.runtypes[i]
		if (r) return prefix + `(${getRegExpPatternFor(r as Runtype)})`
		else return prefix
	}, "")
	return new RegExp(`^${pattern}$`, "su")
}

/**
 * Validates that a value is a string that conforms to the template.
 *
 * You can use the familiar syntax to create a `Template` runtype:
 *
 * ```ts
 * const T = Template`foo${Literal('bar')}baz`;
 * ```
 *
 * But then the type inference won't work:
 *
 * ```ts
 * type T = Static<typeof T>; // inferred as string
 * ```
 *
 * Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.
 *
 * If you want the type inference rather than the tagged syntax, you have to manually write a function call:
 *
 * ```ts
 * const T = Template(['foo', 'baz'] as const, Literal('bar'));
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * As a convenient solution for this, it also supports another style of passing arguments:
 *
 * ```ts
 * const T = Template('foo', Literal('bar'), 'baz');
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * You can pass various things to the `Template` constructor, as long as they are assignable to `string | number | bigint | boolean | null | undefined` and the corresponding `Runtype`s:
 *
 * ```ts
 * // Equivalent runtypes
 * Template(Literal('42'));
 * Template(42);
 * Template(Template('42'));
 * Template(4, '2');
 * Template(Literal(4), '2');
 * Template(String.withConstraint(s => s === '42'));
 * Template(
 *   Intersect(
 *     Number.withConstraint(n => n === 42),
 *     String.withConstraint(s => s.length === 2),
 *     // `Number`s in `Template` accept alternative representations like `"0x2A"`,
 *     // thus we have to constraint the length of string, to accept only `"42"`
 *   ),
 * );
 * ```
 *
 * Trivial items such as bare literals, `Literal`s, and single-element `Union`s and `Intersect`s are all coerced into strings at the creation time of the runtype. Additionally, `Union`s of such runtypes are converted into `RegExp` patterns like `(?:foo|bar|...)`, so we can assume `Union` of `Literal`s is a fully supported runtype in `Template`.
 *
 * ### Caveats
 *
 * A `Template` internally constructs a `RegExp` to parse strings. This can lead to a problem if it contains multiple non-literal runtypes:
 *
 * ```ts
 * const UpperCaseString = Constraint(String, s => s === s.toUpperCase(), {
 *   name: 'UpperCaseString',
 * });
 * const LowerCaseString = Constraint(String, s => s === s.toLowerCase(), {
 *   name: 'LowerCaseString',
 * });
 * Template(UpperCaseString, LowerCaseString);
 * ```
 *
 * The only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraints, which must be hardly done. Actually `Template` treats `String` runtypes as the simplest `RegExp` pattern `.*` and the “greedy” strategy is always used, that is, the above runtype won't work expectedly because the entire pattern is just `^(.*)(.*)$` and the first `.*` always wins. You have to avoid using `Constraint` this way, and instead manually parse it using a single `Constraint` which covers the entire string.
 */
const Template: {
	<A extends TemplateStringsArray, B extends readonly Runtype.Core<LiteralBase>[]>(
		strings: A,
		...runtypes: B
	): Template<A & [string, ...string[]], B>
	<A extends readonly [string, ...string[]], B extends readonly Runtype.Core<LiteralBase>[]>(
		strings: A,
		...runtypes: B
	): Template<A, B>
	<A extends readonly (LiteralBase | Runtype.Core<LiteralBase>)[]>(
		...args: A
	): Template<ExtractStrings<A>, ExtractRuntypes<A>>
} = <
	A extends
		| [readonly [string, ...string[]], ...Runtype.Core<LiteralBase>[]]
		| readonly (LiteralBase | Runtype.Core<LiteralBase>)[],
>(
	...args: A
) => {
	const [strings, runtypes] = normalizeArgs(args)
	return Runtype.create<
		A extends (LiteralBase | Runtype.Core<LiteralBase>)[]
			? Template<ExtractStrings<A>, ExtractRuntypes<A>>
			: A extends [infer carA, ...infer cdrA]
				? carA extends readonly [string, ...string[]]
					? cdrA extends readonly Runtype.Core<LiteralBase>[]
						? Template<carA, cdrA>
						: never
					: never
				: never
	>(
		(value, innerValidate, self, parsing) => {
			const regexp = createRegExpForTemplate(self as any)

			const test = (
				value: string,
				innerValidate: InnerValidate,
				parsing: boolean,
			): Result<string> => {
				const matches = value.match(regexp)
				if (matches) {
					const values = matches.slice(1)
					let parsed: string = ""
					for (let i = 0; i < strings.length; i++) {
						const string = strings[i]!
						const runtype = runtypes[i]
						if (runtype) {
							const value = values[i]!
							const validated = reviveValidate(
								runtype as Runtype,
								innerValidate,
								parsing,
							)(value) as Result<string>
							if (!validated.success) return validated
							parsed += string + validated.value
						} else {
							parsed += string
						}
					}
					return SUCCESS(parsing ? parsed : value)
				} else {
					return FAILURE.VALUE_INCORRECT(
						"string",
						`${show(self as unknown as Runtype)}`,
						`"${literal(value)}"`,
					)
				}
			}

			if (typeof value !== "string") return FAILURE.TYPE_INCORRECT(self, value)
			else {
				const validated = test(value, innerValidate, parsing)
				if (validated.success) return validated
				const result = FAILURE.VALUE_INCORRECT(
					"string",
					`${show(self as unknown as Runtype)}`,
					`"${value}"`,
				)
				if (result.message !== validated.message)
					// TODO: Should use `details` here, but it needs unionizing `string` anew to the definition of `Details`, which is a breaking change
					result.message += ` (inner: ${validated.message})`
				return result
			}
		},
		{ tag: "template", strings, runtypes } as any,
	)
}

export default Template