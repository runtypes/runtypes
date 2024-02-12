import Runtype, { RuntypeBase, create, innerValidate } from "./Runtype.ts"
import Failure from "./result/Failure.ts"
import Result from "./result/Result.ts"
import Reflect from "./utils/Reflect.ts"
import Static from "./utils/Static.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"
import enumerableKeysOf from "./utils-internal/enumerableKeysOf.ts"

interface Tuple<A extends readonly RuntypeBase[]>
	extends Runtype<{
		[K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown
	}> {
	tag: "tuple"
	components: A
}

/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
const Tuple = <T extends readonly RuntypeBase[]>(...components: T): Tuple<T> => {
	const self = { tag: "tuple", components } as unknown as Reflect
	return create<any>((xs, visited) => {
		if (!Array.isArray(xs)) return FAILURE.TYPE_INCORRECT(self, xs)

		if (xs.length !== components.length)
			return FAILURE.CONSTRAINT_FAILED(
				self,
				`Expected length ${components.length}, but was ${xs.length}`,
			)

		const keys = enumerableKeysOf(xs)
		const results: Result<unknown>[] = keys.map(key =>
			innerValidate(components[key as any]!, xs[key as any]!, visited),
		)
		const details = keys.reduce<
			Record<number, { [key: number]: string | Failure.Details } & (string | Failure.Details)>
		>((details, key) => {
			const result = results[key as any]!
			if (!result.success) details[key as any] = result.details || result.message
			return details
		}, [])

		if (enumerableKeysOf(details).length !== 0) return FAILURE.CONTENT_INCORRECT(self, details)
		else return SUCCESS(xs)
	}, self)
}

export default Tuple