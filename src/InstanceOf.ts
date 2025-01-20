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
		({ value, self }) => {
			try {
				if (value instanceof ctor) return SUCCESS(value)
				else return FAILURE.TYPE_INCORRECT({ expected: self, received: value })
			} catch (error) {
				return FAILURE.INSTANCEOF_FAILED({ expected: self, received: value, thrown: error })
			}
		},
		{ tag: "instanceof", ctor },
	)

export default InstanceOf