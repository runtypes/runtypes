import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

type Constructor<V> = { new (...args: never[]): V }

interface InstanceOf<V = unknown> extends Runtype<V> {
	tag: "instanceof"
	ctor: Constructor<V>
}

const InstanceOf = <V>(ctor: Constructor<V>) =>
	Runtype.create<InstanceOf<V>>(
		({ value, self }) =>
			value instanceof ctor
				? SUCCESS(value)
				: FAILURE.TYPE_INCORRECT({ expected: self, received: value }),
		{ tag: "instanceof", ctor },
	)

export default InstanceOf