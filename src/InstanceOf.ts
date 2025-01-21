import Runtype from "./Runtype.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

type Constructor<V> = { new (...args: never[]): V }

/**
 * Validates that a value is an instance of the given class.
 *
 * Possible failures:
 *
 * - `TYPE_INCORRECT` if `instanceof` was `false`
 * - `INSTANCEOF_FAILED` if `instanceof` threw (per `Symbol.hasInstance`)
 */
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