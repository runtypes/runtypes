import { type LiteralBase } from "./Literal.ts"
import type Object from "./Object.ts"
import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import { type Match } from "./utils/match.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import hasKey from "./utils-internal/hasKey.ts"

interface Union<
	R extends readonly [Runtype.Core, ...Runtype.Core[]] = readonly [Runtype.Core, ...Runtype.Core[]],
> extends Runtype.Common<
		{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number]
	> {
	tag: "union"
	alternatives: R
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
const Union = <R extends readonly [Runtype.Core, ...Runtype.Core[]]>(...alternatives: R) =>
	Runtype.create<Union<R>>(
		(
			value,
			innerValidate,
			self,
		): Result<{ [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number]> => {
			if (typeof value !== "object" || value === null) {
				for (const alternative of alternatives)
					if (innerValidate(alternative, value).success)
						return SUCCESS(
							value as {
								[K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown
							}[number],
						)
				return FAILURE.TYPE_INCORRECT(self, value)
			}

			const commonLiteralFields: { [K: string]: LiteralBase[] } = {}
			for (const alternative of alternatives) {
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
				if (commonLiteralFields[fieldName]!.length === alternatives.length) {
					for (const alternative of alternatives) {
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
								)
							}
						}
					}
				}
			}

			for (const targetType of alternatives)
				if (innerValidate(targetType, value).success)
					return SUCCESS(
						value as { [K in keyof R]: R[K] extends Runtype.Core ? Static<R[K]> : unknown }[number],
					)

			return FAILURE.TYPE_INCORRECT(self, value)
		},
		{ tag: "union", alternatives } as Union<R>,
	).with({
		match: ((...cases: any[]) =>
			(x: any) => {
				for (let i = 0; i < alternatives.length; i++) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					if (alternatives[i]!.guard(x)) {
						return cases[i](x)
					}
				}
			}) as Match<R>,
	})

export default Union