import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import show from "./utils-internal/show.ts"
import unwrapTrivial from "./utils-internal/unwrapTrivial.ts"

type TupleStaticImpl<
	L extends readonly unknown[],
	C extends readonly unknown[],
	R extends readonly unknown[],
> = C extends [infer T, ...infer C]
	? T extends Runtype.Core
		? TupleStaticImpl<[...L, Static<T>], C, R>
		: T extends Spread<infer T>
			? TupleStaticImpl<[...L, ...Static<T>], C, R>
			: never
	: C extends [...infer C, infer T]
		? T extends Runtype.Core
			? TupleStaticImpl<L, C, [Static<T>, ...R]>
			: T extends Spread<infer T>
				? TupleStaticImpl<L, C, [...Static<T>, ...R]>
				: never
		: C["length"] extends 0
			? [...L, ...R]
			: C extends readonly Spread<infer T>[]
				? [...L, ...Static<T>, ...R]
				: never
type TupleStatic<R extends readonly (Runtype.Core | Spread)[]> = TupleStaticImpl<[], R, []>

type ToReadonlyImpl<A extends readonly unknown[], B extends readonly unknown[]> = A extends [
	infer A0,
	...infer A,
]
	? ToReadonlyImpl<A, readonly [...B, A0]>
	: B
type ToReadonly<A extends readonly unknown[]> = ToReadonlyImpl<A, readonly []>

interface TupleReadonly<
	R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[],
> extends Runtype.Common<ToReadonly<TupleStatic<R>>>,
		Iterable<Spread<TupleReadonly<R>>> {
	tag: "tuple"
	readonly components:
		| (Runtype[] & R)
		| {
				leading: Runtype[]
				rest: Runtype.Spreadable
				trailing: Runtype[]
		  }
}

interface Tuple<R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[]>
	extends Runtype.Common<TupleStatic<R>>,
		Iterable<Spread<Tuple<R>>> {
	tag: "tuple"
	readonly components:
		| (Runtype[] & R)
		| {
				leading: Runtype[]
				rest: Runtype.Spreadable
				trailing: Runtype[]
		  }
}

const isSpread = (component: Runtype.Core | Spread): component is Spread =>
	component.tag === "spread"

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
const Tuple = <R extends readonly (Runtype.Core | Spread)[]>(...components: R) => {
	const base = {
		tag: "tuple",
		get components() {
			// Flatten `Spread<Tuple>`.
			const componentsFlattened: (Runtype.Core | Spread)[] = [...components]
			for (let i = 0; i < componentsFlattened.length; ) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const component = componentsFlattened[i]!
				if (isSpread(component)) {
					const runtype = unwrapTrivial(component.content as Runtype)
					switch (runtype.tag) {
						case "tuple":
							if (globalThis.Array.isArray(runtype.components))
								componentsFlattened.splice(i, 1, ...runtype.components)
							else
								componentsFlattened.splice(
									i,
									1,
									...runtype.components.leading,
									Spread(runtype.components.rest as any),
									...runtype.components.trailing,
								)
							continue
						case "array":
							i++
							continue
						default:
							throw new Error(
								`Unsupported content type of \`Spread\` in \`Tuple\`: ${show(component.content as Runtype)}`,
							)
					}
				} else {
					i++
					continue
				}
			}

			// Split at the `Spread<Array>` if exists.
			const leading: Runtype.Core[] = []
			let rest: Runtype | undefined = undefined
			const trailing: Runtype.Core[] = []
			for (const component of componentsFlattened) {
				if (isSpread(component)) {
					if (rest) throw new Error("A rest element cannot follow another rest element.")
					rest = component.content as Runtype
				} else if (rest) {
					trailing.push(component)
				} else {
					leading.push(component)
				}
			}

			return rest ? { leading, rest, trailing } : leading
		},
		*[Symbol.iterator]() {
			yield Spread(base as Tuple<R>)
		},
	} as Runtype.Base<Tuple<R>>

	return Runtype.create<Tuple<R>>((x, innerValidate, self) => {
		if (!globalThis.Array.isArray(x)) return FAILURE.TYPE_INCORRECT(self, x)

		if (globalThis.Array.isArray(self.components)) {
			if (x.length !== self.components.length)
				return FAILURE.CONSTRAINT_FAILED(
					self,
					`Expected length ${self.components.length}, but was ${x.length}`,
				)
		} else {
			if (x.length < self.components.leading.length + self.components.trailing.length)
				return FAILURE.CONSTRAINT_FAILED(
					self,
					`Expected length >= ${self.components.leading.length + self.components.trailing.length}, but was ${x.length}`,
				)
		}

		const values: unknown[] = [...x]
		let results: Result<unknown>[] = []
		if (globalThis.Array.isArray(self.components)) {
			for (const component of self.components) {
				const value = values.shift()
				const result = innerValidate(component, value)
				results.push(result)
			}
		} else {
			const resultsLeading: Result<unknown>[] = []
			let resultRest: Result<unknown> | undefined = undefined
			const resultsTrailing: Result<unknown>[] = []
			for (const component of self.components.leading) {
				const value = values.shift()
				const result = innerValidate(component, value)
				resultsLeading.push(result)
			}
			for (const component of self.components.trailing.toReversed()) {
				const value = values.pop()
				const result = innerValidate(component, value)
				resultsTrailing.unshift(result)
			}
			resultRest = innerValidate(self.components.rest, values)
			results = [...resultsLeading, resultRest, ...resultsTrailing]
		}

		const details = results.reduce<
			globalThis.Record<
				number,
				{ [key: number]: string | Failure.Details } & (string | Failure.Details)
			>
		>((details, result, i) => {
			if (!result.success) details[i] = result.details || result.message
			return details
		}, [])

		if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
		else return SUCCESS(x as Static<Tuple<R>>)
	}, base).with(self => ({ asReadonly: () => self as unknown as TupleReadonly<R> }))
}

export default Tuple