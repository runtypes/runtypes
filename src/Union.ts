import { type LiteralBase } from "./Literal.ts"
import type Object from "./Object.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Result from "./result/Result.ts"
import { type Match } from "./utils/match.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import hasKey from "./utils-internal/hasKey.ts"

interface Union<
	R extends readonly [Runtype.Core, ...Runtype.Core[]] = readonly [Runtype.Core, ...Runtype.Core[]],
> extends Runtype.Common<
		{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number],
		{ [K in keyof R]: R[K] extends Runtype.Core ? Parsed<R[K]> : unknown }[number]
	> {
	tag: "union"
	alternatives: R
	[Symbol.iterator]: R["length"] extends 1
		? R[0] extends Runtype.Spreadable
			? HasSymbolIterator<R[0]> extends true
				? () => Iterator<Spread<R[0]>>
				: never
			: never
		: never
}

namespace Union {
	// eslint-disable-next-line import/no-named-export
	export type Utilities<R extends readonly [Runtype.Core, ...Runtype.Core[]]> = {
		match: Match<R>
	}

	// eslint-disable-next-line import/no-named-export
	export type WithUtilities<R extends readonly [Runtype.Core, ...Runtype.Core[]]> = Union<R> &
		Utilities<R>
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
const Union = <R extends readonly [Runtype.Core, ...Runtype.Core[]]>(
	...alternatives: R
): Union.WithUtilities<R> => {
	const base = {
		tag: "union",
		alternatives,
		*[Symbol.iterator]() {
			yield Spread(base as any)
		},
	} as Runtype.Base<Union<R>>

	return Runtype.create<Union<R>>(
		(
			value,
			innerValidate,
			self,
			parsing,
		): Result<{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number]> => {
			if (typeof value !== "object" || value === null) {
				for (const alternative of self.alternatives) {
					const result = innerValidate(alternative, value, parsing)
					if (result.success) return SUCCESS(result.value)
				}
				return FAILURE.TYPE_INCORRECT(self, value)
			}

			const commonLiteralFields: { [K: string]: LiteralBase[] } = {}
			for (const alternative of self.alternatives) {
				if (alternative.tag === "object") {
					for (const fieldName in (alternative as Object<any>).fields) {
						const field = (alternative as Object<any>).fields[fieldName]!
						if (field.tag === "literal") {
							if (commonLiteralFields[fieldName]) {
								if (commonLiteralFields[fieldName]!.every(value => value !== field.value)) {
									commonLiteralFields[fieldName]!.push(field.value)
								}
							} else {
								commonLiteralFields[fieldName] = [field.value]
							}
						}
					}
				}
			}

			for (const fieldName in commonLiteralFields) {
				if (commonLiteralFields[fieldName]!.length === self.alternatives.length) {
					for (const alternative of self.alternatives) {
						if (alternative.tag === "object") {
							const field = (alternative as Object<any>).fields[fieldName]!
							if (
								field.tag === "literal" &&
								hasKey(fieldName, value) &&
								value[fieldName] === field.value
							) {
								return innerValidate(
									alternative as Runtype.Core<
										{
											[K in keyof R]: R[K] extends Runtype.Core<unknown> ? Static<R[K]> : unknown
										}[number]
									>,
									value,
									parsing,
								)
							}
						}
					}
				}
			}

			for (const targetType of self.alternatives) {
				const result = innerValidate(targetType, value, parsing)
				if (result.success) return SUCCESS(result.value)
			}

			return FAILURE.TYPE_INCORRECT(self, value)
		},
		base,
	).with(self => ({
		match: ((...cases: any[]) =>
			(x: any) => {
				for (let i = 0; i < self.alternatives.length; i++) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					if (self.alternatives[i]!.guard(x)) {
						return cases[i](x)
					}
				}
			}) as Match<R>,
	}))
}

export default Union