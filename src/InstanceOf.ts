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
		({ received, expected }) => {
			try {
				if (received instanceof ctor) return SUCCESS(received)
				else return FAILURE.TYPE_INCORRECT({ expected, received })
			} catch (error) {
				return FAILURE.INSTANCEOF_FAILED({ expected, received, thrown: error })
			}
		},
		{ tag: "instanceof", ctor },
	)

export default InstanceOf