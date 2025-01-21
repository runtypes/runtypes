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

type Lrt<
	L extends readonly Runtype.Core[] = readonly Runtype.Core[],
	R = unknown,
	T extends readonly Runtype.Core[] = readonly Runtype.Core[],
> = { leading: L; rest: R; trailing: T }

type SplitAtSpreadImplRest<
	L extends readonly Runtype.Core[],
	R extends readonly (Runtype.Core | Spread)[],
	T extends readonly Runtype.Core[],
> = R["length"] extends 0
	? Lrt<L, unknown, T>
	: R extends readonly [...(readonly Spread<infer X>[])]
		? Lrt<L, X, T>
		: Lrt<L, unknown, T>
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
type FlattenSplitAtSpread<R extends readonly (Runtype.Core | Spread)[]> =
	SplitAtSpread<R> extends Lrt<infer L0, infer R0, infer T0>
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
			R0 extends Array<any>
			? Lrt<L0, R0, T0>
			: R0 extends Tuple<infer R>
				? FlattenSplitAtSpread<R> extends Lrt<infer L1, infer R1, infer T1>
					? { leading: [...L0, ...L1]; rest: R1; trailing: [...T1, ...T0] }
					: Lrt<L0, R0, T0>
				: Lrt<L0, R0, T0>
		: never

type MapParsed<R extends readonly Runtype.Core[]> = { [K in keyof R]: Parsed<R[K]> }
type TupleParsed<R extends readonly (Runtype.Core | Spread)[]> =
	FlattenSplitAtSpread<R> extends infer X
		? X extends Lrt<infer L, infer R, infer T>
			? R extends Runtype.Core<readonly unknown[]>
				? [...MapParsed<L>, ...Parsed<R>, ...MapParsed<T>]
				: [...MapParsed<L>, ...MapParsed<T>]
			: never
		: never

type MapStatic<R extends readonly Runtype.Core[]> = { [K in keyof R]: Static<R[K]> }
type TupleStatic<R extends readonly (Runtype.Core | Spread)[]> =
	FlattenSplitAtSpread<R> extends infer X
		? X extends Lrt<infer L, infer R, infer T>
			? R extends Runtype.Core<readonly unknown[]>
				? [...MapStatic<L>, ...Static<R>, ...MapStatic<T>]
				: [...MapStatic<L>, ...MapStatic<T>]
			: never
		: never

type ToReadonlyImpl<A extends readonly unknown[], B extends readonly unknown[]> = A extends [
	infer A0,
	...infer A,
]
	? ToReadonlyImpl<A, readonly [...B, A0]>
	: B
type ToReadonly<A extends readonly unknown[]> = ToReadonlyImpl<A, readonly []>

/**
 * Validates that a value is an array of the given element types.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` for non-arrays
 * - `CONSTRAINT_FAILED` with `thrown` being a string reporting that the length constraint was not fulfilled
 * - `CONTENT_INCORRECT` with `details` reporting the failed elements
 */
interface Tuple<R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[]>
	extends Runtype<TupleStatic<R>, TupleParsed<R>>,
		Iterable<Spread<Tuple<R>>> {
	tag: "tuple"
	readonly components: Tuple.Components<R> extends infer X ? { [K in keyof X]: X[K] } : never
}

namespace Tuple {
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Components<R extends readonly (Runtype.Core | Spread)[]> =
		FlattenSplitAtSpread<R> extends infer X
			? X extends Lrt<infer L, infer R, infer T>
				? unknown extends R
					? [...L, ...T]
					: X
				: never
			: never

	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export interface Readonly<
		R extends readonly (Runtype.Core | Spread)[] = readonly (Runtype.Core | Spread)[],
	> extends Runtype<ToReadonly<TupleStatic<R>>, ToReadonly<TupleParsed<R>>>,
			Iterable<Spread<Readonly<R>>> {
		tag: "tuple"
		readonly components: Tuple.Components<R> extends infer X ? { [K in keyof X]: X[K] } : never
	}

	// eslint-disable-next-line import/no-named-export, sort-exports/sort-exports
	export namespace Components {
		// eslint-disable-next-line import/no-named-export, import/no-unused-modules
		export type Fixed<R extends readonly (Runtype.Core | Spread)[] = never> = [R] extends [never]
			? readonly Runtype[]
			: Components<R>

		// eslint-disable-next-line import/no-named-export, import/no-unused-modules
		export type Variadic<R extends readonly (Runtype.Core | Spread)[] = never> = [R] extends [never]
			? Lrt<readonly Runtype[], Runtype.Spreadable, readonly Runtype[]>
			: Components<R>
	}
}

const isSpread = (component: Runtype.Core | Spread): component is Spread =>
	component.tag === "spread"

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
								const components = runtype.components as Tuple.Components.Fixed<R>
								componentsFlattened.splice(i, 1, ...components)
							} else {
								const components = runtype.components as Tuple.Components.Variadic<R>
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

	return Runtype.create<Tuple<R>>(({ received: x, innerValidate, expected, parsing }) => {
		if (!globalThis.Array.isArray(x)) return FAILURE.TYPE_INCORRECT({ expected, received: x })

		if (globalThis.Array.isArray(expected.components)) {
			const components = expected.components as Tuple.Components.Fixed<R>
			if (x.length !== components.length)
				return FAILURE.CONSTRAINT_FAILED({
					expected,
					received: x,
					thrown: `Expected length ${components.length}, but was ${x.length}`,
				})
		} else {
			const components = expected.components as Tuple.Components.Variadic<R>
			if (x.length < components.leading.length + components.trailing.length)
				return FAILURE.CONSTRAINT_FAILED({
					expected,
					received: x,
					thrown: `Expected length >= ${components.leading.length + components.trailing.length}, but was ${x.length}`,
				})
		}

		const values: unknown[] = [...x]
		let results: Result<unknown>[] = []
		if (globalThis.Array.isArray(expected.components)) {
			const components = expected.components as Tuple.Components.Fixed<R>
			for (const component of components) {
				const received = values.shift()
				const result = innerValidate({ expected: component, received, parsing })
				results.push(result)
			}
		} else {
			const components = expected.components as Tuple.Components.Variadic<R>
			const resultsLeading: Result<unknown>[] = []
			let resultRest: Result<unknown> | undefined = undefined
			const resultsTrailing: Result<unknown>[] = []
			for (const component of components.leading) {
				const received = values.shift()
				const result = innerValidate({ expected: component, received, parsing })
				resultsLeading.push(result)
			}
			for (const component of components.trailing.toReversed()) {
				const received = values.pop()
				const result = innerValidate({ expected: component, received, parsing })
				resultsTrailing.unshift(result)
			}
			resultRest = innerValidate({ expected: components.rest, received: values, parsing })
			results = [...resultsLeading, resultRest, ...resultsTrailing]
		}

		const details: Failure.Details = {}
		for (let i = 0; i < results.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = results[i]!
			if (!result.success) details[i] = result
		}

		if (enumerableKeysOf(details).length !== 0)
			return FAILURE.CONTENT_INCORRECT({ expected, received: x, details })
		else
			return SUCCESS(
				parsing ? (results as Success<any>[]).map(result => result.value) : x,
			) as Result<any>
	}, Spread.asSpreadable(base)).with(self =>
		defineIntrinsics({}, { asReadonly: () => self as unknown as Tuple.Readonly<R> }),
	)
}

export default Tuple