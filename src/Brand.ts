import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Result from "./result/Result.ts"

declare const RuntypeName: unique symbol

type RuntypeBrand<B extends string> = {
	[RuntypeName]: {
		[k in B]: B
	}
}

interface Brand<B extends string = string, R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<
		// TODO: replace it by nominal type when it has been released
		// https://github.com/microsoft/TypeScript/pull/33038
		Static<R> & RuntypeBrand<B>
	> {
	tag: "brand"
	brand: B
	entity: R
}

const Brand = <B extends string, R extends Runtype.Core>(brand: B, entity: R) =>
	Runtype.create<Brand<B, R>>(value => entity.validate(value) as Result<Static<Brand<B, R>>>, {
		tag: "brand",
		brand,
		entity,
	})

export default Brand
// eslint-disable-next-line import/no-named-export
export { type RuntypeBrand }