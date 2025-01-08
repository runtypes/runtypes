import Runtype, { type Static, type Parsed } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Constraint<R extends Runtype.Core = Runtype.Core, T extends Parsed<R> = Parsed<R>>
	extends Runtype<[Static<R>, Parsed<R>] extends [Parsed<R>, Static<R>] ? T : Static<R>, T> {
	tag: "constraint"
	underlying: R
	constraint: (x: Parsed<R>) => asserts x is T
}

const Constraint = <R extends Runtype.Core, T extends Parsed<R>>(
	underlying: R,
	constraint: (x: Parsed<R>) => asserts x is T,
) =>
	Runtype.create<Constraint<R, T>>(
		({ value, innerValidate, self, parsing }): Result<any> => {
			const result = innerValidate(self.underlying, value, true)
			if (!result.success) return result
			try {
				constraint(result.value)
				return SUCCESS(parsing ? result.value : value)
			} catch (error) {
				return FAILURE.CONSTRAINT_FAILED({ expected: self, received: value, thrown: error })
			}
		},
		{ tag: "constraint", underlying, constraint },
	)

export default Constraint