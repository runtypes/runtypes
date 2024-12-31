import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import FAILURE from "./utils-internal/FAILURE.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Constraint<
	R extends Runtype.Core = Runtype.Core,
	U extends Static<R> = Static<R>,
	K = unknown,
> extends Runtype.Common<U> {
	tag: "constraint"
	underlying: R
	constraint: <S extends Runtype.Core<Static<R>>>(x: Static<S>) => boolean | string
	name?: string
	args?: K
}

const Constraint = <R extends Runtype.Core, U extends Static<R>, K = unknown>(
	underlying: R,
	constraint: (x: Static<R>) => boolean | string,
	options?: { name?: string; args?: K },
) => {
	const name = options && options.name
	const args = options && options.args
	return Runtype.create<Constraint<R, U, K>>(
		(value, innerValidate, self) => {
			const result = underlying.validate(value) as Result<Static<R>>

			if (!result.success) return result

			const message = constraint(result.value)
			if (typeof message === "string") return FAILURE.CONSTRAINT_FAILED(self, message)
			else if (!message) return FAILURE.CONSTRAINT_FAILED(self)
			return SUCCESS(result.value as U)
		},
		{
			tag: "constraint",
			underlying,
			constraint,
			...(name !== undefined ? { name } : {}),
			...(args !== undefined ? { args } : {}),
		},
	)
}

export default Constraint