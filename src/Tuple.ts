import type Array from "./Array.ts"
import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Failure from "./result/Failure.ts"
import type Result from "./result/Result.ts"
import type Success from "./result/Success.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import defineIntrinsics from "./utils-internal/defineIntrinsics.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"
import show from "./utils-internal/show.ts"
import unwrapTrivial from "./utils-internal/unwrapTrivial.ts"

// TODO: simplify types

type SplitAtSpreadImplRest<
	L extends readonly Runtype.Core[],
	R extends readonly (Runtype.Core | Spread)[],
	T extends readonly Runtype.Core[],
> = R extends readonly [...Spread<infer X>[]]
	? ComponentsTupleVariadicObject<L, X, T>
	: ComponentsTupleVariadicObject<L, never, T>
type SplitAtSpreadImplTrailing<
	L extends readonly Runtype.Core[],
	R extends readonly (Runtype.Core | Spread)[],
	T extends readonly Runtype.Core[],
> = R extends [...infer S, infer X]
	? X extends Runtype.Core
		? S extends readonly (Runtype.Core | Spread)[]
			? SplitAtSpreadImplTrailing<L, S, [X, ...T]>
			: never
		: SplitAtSpreadImplRest<L, R, T>
	: SplitAtSpreadImplRest<L, R, T>
type SplitAtSpreadImplLeading<
	L extends readonly Runtype.Core[],
	R extends readonly (Runtype.Core | Spread)[],
	T extends readonly Runtype.Core[],
> = R extends [infer X, ...infer S]
	? X extends Runtype.Core
		? S extends readonly (Runtype.Core | Spread)[]
			? SplitAtSpreadImplLeading<[...L, X], S, T>
			: never
		: SplitAtSpreadImplTrailing<L, R, T>
	: SplitAtSpreadImplTrailing<L, R, T>
type SplitAtSpread<R extends readonly (Runtype.Core | Spread)[]> = SplitAtSpreadImplLeading<
	[],
	R,
	[]
>

type ComponentsTupleVariadicObject<
	L extends readonly Runtype.Core[] = readonly Runtype.Core[],
	R extends Runtype.Spreadable = Runtype.Spreadable,
	T extends readonly Runtype.Core[] = readonly Runtype.Core[],
> = { leading: L; rest: R; trailing: T }
type ComponentsTupleVariadic<R extends readonly (Runtype.Core | Spread)[]> =
	SplitAtSpread<R> extends ComponentsTupleVariadicObject<infer L0, infer R0, infer T0>
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
			R0 extends Array<any>
			? { leading: L0; rest: R0; trailing: T0 }
			: R0 extends Tuple<infer R>
				? ComponentsTupleVariadic<R> extends ComponentsTupleVariadicObject<
						infer L1,
						infer R1,
						infer T1
					>
					? { leading: [...L0, ...L1]; rest: R1; trailing: [...T1, ...T0] }
					: { leading: L0; rest: R0; trailing: T0 }
				: { leading: L0; rest: R0; trailing: T0 }
		: never

type ComponentsTupleSpreadInner<R extends Runtype.Core> =
	R extends Tuple<infer R>
		? ComponentsTupleFixed<R>
		: R extends Array<infer R>
			? ComponentsTupleFixed<R[]>
			: never
type ComponentsTupleImpl<
	L extends readonly unknown[],
	C extends readonly unknown[],
	R extends readonly unknown[],
> = C extends [infer T, ...infer C]
	? T extends Runtype.Core
		? ComponentsTupleImpl<[...L, T], C, R>
		: T extends Spread<infer T>
			? ComponentsTupleImpl<[...L, ...ComponentsTupleSpreadInner<T>], C, R>
			: never
	: C extends [...infer C, infer T]
		? T extends Runtype.Core
			? ComponentsTupleImpl<L, C, [T, ...R]>
			: T extends Spread<infer T>
				? ComponentsTupleImpl<L, C, [...ComponentsTupleSpreadInner<T>, ...R]>
				: never
		: C["length"] extends 0
			? [...L, ...R]
			: C extends readonly Spread<infer T>[]
				? [...L, ...ComponentsTupleSpreadInner<T>, ...R]
				: never
type ComponentsTupleFixed<R extends readonly (Runtype.Core | Spread)[]> = ComponentsTupleImpl<
	[],
	R,
	[]
>

type TupleParsedImpl<
	L extends readonly unknown[],
	C extends readonly unknown[],
	R extends readonly unknown[],
> = C extends [infer T, ...infer C]
	? T extends Runtype.Core
		? TupleParsedImpl<[...L, Parsed<T>], C, R>
		: T extends Spread<infer T>
			? TupleParsedImpl<[...L, ...Parsed<T>], C, R>
			: never
	: C extends [...infer C, infer T]
		? T extends Runtype.Core
			? TupleParsedImpl<L, C, [Parsed<T>, ...R]>
			: T extends Spread<infer T>
				? TupleParsedImpl<L, C, [...Parsed<T>, ...R]>
				: never
		: C["length"] extends 0
			? [...L, ...R]
			: C extends readonly Spread<infer T>[]
				? [...L, ...Parsed<T>, ...R]
				: never
type TupleParsed<R extends readonly (Runtype.Core | Spread)[]> = TupleParsedImpl<[], R, []>

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

interface Tuple<R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[]>
	extends Runtype<TupleStatic<R>, TupleParsed<R>>,
		Iterable<Spread<Tuple<R>>> {
	tag: "tuple"
	readonly components: Tuple.Components<R>
}

namespace Tuple {
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Components<R extends readonly (Runtype.Core | Spread)[]> =
		| Components.Fixed<R>
		| Components.Variadic<R>

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export interface Readonly<
		R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[],
	> extends Runtype<ToReadonly<TupleStatic<R>>, ToReadonly<TupleParsed<R>>>,
			Iterable<Spread<Readonly<R>>> {
		tag: "tuple"
		readonly components: Tuple.Components<R>
	}

	// eslint-disable-next-line import/no-named-export, sort-exports/sort-exports
	export namespace Components {
		// eslint-disable-next-line import/no-named-export, import/no-unused-modules
		export type Fixed<R extends readonly (Runtype.Core | Spread)[] = never> = [R] extends [never]
			? readonly Runtype[]
			: ComponentsTupleFixed<R>

		// eslint-disable-next-line import/no-named-export, import/no-unused-modules
		export type Variadic<R extends readonly (Runtype.Core | Spread)[] = never> = [R] extends [never]
			? { leading: readonly Runtype[]; rest: Runtype.Spreadable; trailing: readonly Runtype[] }
			: ComponentsTupleVariadic<R>
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
		// TODO: unuse getter
		get components() {
			// Flatten `Spread<Tuple>`.
			const componentsFlattened: (Runtype.Core | Spread)[] = [...components]
			for (let i = 0; i < componentsFlattened.length; ) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const component = componentsFlattened[i]!
				if (isSpread(component)) {
					const runtype = unwrapTrivial(component.content)
					switch (runtype.tag) {
						case "tuple":
							if (globalThis.Array.isArray(runtype.components)) {
								const components = runtype.components as ComponentsTupleFixed<R>
								componentsFlattened.splice(i, 1, ...components)
							} else {
								const components = runtype.components as ComponentsTupleVariadicObject
								componentsFlattened.splice(
									i,
									1,
									...components.leading,
									Spread(components.rest),
									...components.trailing,
								)
							}
							continue
						case "array":
							i++
							continue
						default:
							throw new Error(
								`Unsupported content type of \`Spread\` in \`Tuple\`: ${show(component.content)}`,
							)
					}
				} else {
					i++
					continue
				}
			}

			// Split at the `Spread<Array>` if exists.
			const leading: Runtype.Core[] = []
			let rest: Runtype.Core | undefined = undefined
			const trailing: Runtype.Core[] = []
			for (const component of componentsFlattened) {
				if (isSpread(component)) {
					if (rest) throw new Error("A rest element cannot follow another rest element.")
					rest = component.content
				} else if (rest) {
					trailing.push(component)
				} else {
					leading.push(component)
				}
			}

			return rest ? { leading, rest, trailing } : leading
		},
	} as Runtype.Base<Tuple<R>>

	return Runtype.create<Tuple<R>>(({ value: x, innerValidate, self, parsing }) => {
		if (!globalThis.Array.isArray(x)) return FAILURE.TYPE_INCORRECT({ expected: self, received: x })

		if (globalThis.Array.isArray(self.components)) {
			const components = self.components as Tuple.Components.Fixed
			if (x.length !== components.length)
				return FAILURE.CONSTRAINT_FAILED({
					expected: self,
					received: x,
					thrown: `Expected length ${components.length}, but was ${x.length}`,
				})
		} else {
			const components = self.components as Tuple.Components.Variadic
			if (x.length < components.leading.length + components.trailing.length)
				return FAILURE.CONSTRAINT_FAILED({
					expected: self,
					received: x,
					thrown: `Expected length >= ${components.leading.length + components.trailing.length}, but was ${x.length}`,
				})
		}

		const values: unknown[] = [...x]
		let results: Result<unknown>[] = []
		if (globalThis.Array.isArray(self.components)) {
			const components = self.components as Tuple.Components.Fixed
			for (const component of components) {
				const value = values.shift()
				const result = innerValidate(component, value, parsing)
				results.push(result)
			}
		} else {
			const components = self.components as Tuple.Components.Variadic
			const resultsLeading: Result<unknown>[] = []
			let resultRest: Result<unknown> | undefined = undefined
			const resultsTrailing: Result<unknown>[] = []
			for (const component of components.leading) {
				const value = values.shift()
				const result = innerValidate(component, value, parsing)
				resultsLeading.push(result)
			}
			for (const component of components.trailing.toReversed()) {
				const value = values.pop()
				const result = innerValidate(component, value, parsing)
				resultsTrailing.unshift(result)
			}
			resultRest = innerValidate(components.rest, values, parsing)
			results = [...resultsLeading, resultRest, ...resultsTrailing]
		}

		const details: Failure.Details = {}
		for (let i = 0; i < results.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = results[i]!
			if (!result.success) details[i] = result
		}

		if (enumerableKeysOf(details).length !== 0)
			return FAILURE.CONTENT_INCORRECT({ expected: self, received: x, details })
		else
			return SUCCESS(
				parsing ? (results as Success<any>[]).map(result => result.value) : x,
			) as Result<any>
	}, Spread.asSpreadable(base)).with(self =>
		defineIntrinsics({}, { asReadonly: () => self as unknown as Tuple.Readonly<R> }),
	)
}

export default Tuple