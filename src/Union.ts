import { type LiteralBase } from "./Literal.ts"
import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create, innerValidate } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import hasKey from "./utils-internal/hasKey.ts"

interface Union<A extends readonly [RuntypeBase, ...RuntypeBase[]]>
	extends Runtype<
		{
			[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
		}[number]
	> {
	tag: "union"
	alternatives: A
	match: Match<A>
}

/**
 * Construct a union runtype from runtypes for its alternatives.
 */
const Union = <T extends readonly [RuntypeBase, ...RuntypeBase[]]>(
	...alternatives: T
): Union<T> => {
	const match =
		(...cases: any[]) =>
		(x: any) => {
			for (let i = 0; i < alternatives.length; i++) {
				if (alternatives[i]!.guard(x)) {
					return cases[i](x)
				}
			}
		}
	const self = { tag: "union", alternatives, match } as unknown as Reflect
	return create<any>((value, visited) => {
		if (typeof value !== "object" || value === null) {
			for (const alternative of alternatives)
				if (innerValidate(alternative, value, visited).success) return SUCCESS(value)
			return FAILURE.TYPE_INCORRECT(self, value)
		}

		const commonLiteralFields: { [K: string]: LiteralBase[] } = {}
		for (const alternative of alternatives) {
			if (alternative.reflect.tag === "object") {
				for (const fieldName in alternative.reflect.fields) {
					const field = alternative.reflect.fields[fieldName]!
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
					if (alternative.reflect.tag === "object") {
						const field = alternative.reflect.fields[fieldName]!
						if (
							field.tag === "literal" &&
							hasKey(fieldName, value) &&
							value[fieldName] === field.value
						) {
							return innerValidate(alternative, value, visited)
						}
					}
				}
			}
		}

		for (const targetType of alternatives)
			if (innerValidate(targetType, value, visited).success) return SUCCESS(value)

		return FAILURE.TYPE_INCORRECT(self, value)
	}, self)
}

type Match<A extends readonly [RuntypeBase, ...RuntypeBase[]]> = {
	<Z>(...a: { [K in keyof A]: A[K] extends RuntypeBase ? Case<A[K], Z> : never }): Matcher<A, Z>
}

type Case<T extends RuntypeBase, Result> = (v: Static<T>) => Result

type Matcher<A extends readonly [RuntypeBase, ...RuntypeBase[]], Z> = (
	x: {
		[K in keyof A]: A[K] extends RuntypeBase<infer Type> ? Type : unknown
	}[number],
) => Z

export default Union
// eslint-disable-next-line import/no-named-export
export { type Case, type Match, type Matcher }