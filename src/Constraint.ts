import Runtype, { type Static, type Parsed } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

/**
 * Adds a constraint to a runtype, narrowing its inferred static type.
 *
 * Possible failures:
 *
 * - Failures of the inner runtype
 * - `CONSTRAINT_FAILED` with `thrown` reporting the thrown value from the constraint function
 */
interface Constraint<R extends Runtype.Core = Runtype.Core, T extends Parsed<R> = Parsed<R>>
	extends Runtype<[Static<R>, Parsed<R>] extends [Parsed<R>, Static<R>] ? T : Static<R>, T> {
	tag: "constraint"
	underlying: R
	constraint: (x: Parsed<R>) => asserts x is T
}

const Constraint = <R extends Runtype.Core, T extends Parsed<R>>(
	underlying: R,
	constraint: (x: Parsed<R>) => asserts x is T,
): Constraint<R, T> =>
	Runtype.create<Constraint<R, T>>(
		({ received, innerValidate, expected, parsing }): Result<any> => {
			const result = innerValidate({ expected: expected.underlying, received, parsing: true })
			if (!result.success) return result
			try {
				constraint(result.value)
				return SUCCESS(parsing ? result.value : received)
			} catch (error) {
				return FAILURE.CONSTRAINT_FAILED({ expected, received, thrown: error })
			}
		},
		{ tag: "constraint", underlying, constraint },
	)

export default Constraint