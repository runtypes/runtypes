import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Constraint<R extends Runtype.Core = Runtype.Core, U extends Static<R> = Static<R>>
	extends Runtype.Common<U> {
	tag: "constraint"
	underlying: R
	constraint: <S extends Runtype.Core<Static<R>>>(x: Static<S>) => asserts x is U
}

const Constraint = <R extends Runtype.Core, U extends Static<R>>(
	underlying: R,
	constraint: (x: Static<R>) => asserts x is U,
) =>
	Runtype.create<Constraint<R, U>>(
		({ value, innerValidate, self, parsing }): Result<any> => {
			const result = innerValidate(self.underlying, value, parsing)
			if (!result.success) return result
			try {
				constraint(result.value)
				return SUCCESS(parsing ? result.value : value)
			} catch (error) {
				if (typeof error === "string") return FAILURE.CONSTRAINT_FAILED(self, error)
				else if (error instanceof Error) return FAILURE.CONSTRAINT_FAILED(self, error.message)
				return FAILURE.CONSTRAINT_FAILED(self)
			}
		},
		{ tag: "constraint", underlying, constraint },
	)

export default Constraint