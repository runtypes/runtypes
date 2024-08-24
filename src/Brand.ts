import type Runtype from "./Runtype.ts"
import { type RuntypeBase, type Static } from "./Runtype.ts"
import { create } from "./Runtype.ts"
import type Reflect from "./utils/Reflect.ts"

declare const RuntypeName: unique symbol

type RuntypeBrand<B extends string> = {
	[RuntypeName]: {
		[k in B]: B
	}
}

interface Brand<B extends string, A extends RuntypeBase>
	extends Runtype<
		// TODO: replace it by nominal type when it has been released
		// https://github.com/microsoft/TypeScript/pull/33038
		Static<A> & RuntypeBrand<B>
	> {
	tag: "brand"
	brand: B
	entity: A
}

const Brand = <B extends string, A extends RuntypeBase>(brand: B, entity: A) => {
	const self = { tag: "brand", brand, entity } as unknown as Reflect
	return create<any>(value => entity.validate(value), self)
}

export default Brand
// eslint-disable-next-line import/no-named-export
export { type RuntypeBrand }