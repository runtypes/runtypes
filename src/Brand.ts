import Runtype, { type Parsed, type Static } from "./Runtype.ts"
import Spread from "./Spread.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import type HasSymbolIterator from "./utils-internal/HasSymbolIterator.ts"

declare const RuntypeName: unique symbol

type RuntypeBrand<B extends string> = {
	[RuntypeName]: {
		[k in B]: B
	}
}

interface Brand<B extends string = string, R extends Runtype.Core = Runtype.Core>
	extends Runtype<
		// TODO: replace it by nominal type when it has been released
		// https://github.com/microsoft/TypeScript/pull/33038
		Static<R> & RuntypeBrand<B>,
		Parsed<R> & RuntypeBrand<B>
	> {
	tag: "brand"
	brand: B
	entity: R
	[Symbol.iterator]: R extends Runtype.Spreadable
		? HasSymbolIterator<R> extends true
			? () => Iterator<Spread<Brand<B, R>>>
			: never
		: never
}

const Brand = <B extends string, R extends Runtype.Core>(brand: B, entity: R) => {
	const base = {
		tag: "brand",
		brand,
		entity,
	} as Runtype.Base<Brand<B, R>>
	return Runtype.create<Brand<B, R>>(({ value, innerValidate, self, parsing }): Result<any> => {
		const result = innerValidate(self.entity, value, parsing)
		if (result.success) return result
		return FAILURE.TYPE_INCORRECT({ expected: self, received: value, detail: result })
	}, Spread.asSpreadable(base))
}

export default Brand