import Runtype, { create } from "./Runtype.ts"
import Reflect from "./utils/Reflect.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

type Constructor<V> = {
	new (...args: any[]): V
}

interface InstanceOf<V> extends Runtype<V> {
	tag: "instanceof"
	ctor: Constructor<V>
}

const InstanceOf = <V>(ctor: Constructor<V>) => {
	const self = { tag: "instanceof", ctor } as unknown as Reflect
	return create<InstanceOf<V>>(
		value => (value instanceof ctor ? SUCCESS(value) : FAILURE.TYPE_INCORRECT(self, value)),
		self,
	)
}

export default InstanceOf
// eslint-disable-next-line import/no-named-export
export { type Constructor }