import Runtype from "./Runtype.ts"
import { type Static } from "./Runtype.ts"
import type Result from "./result/Result.ts"
import SUCCESS from "./utils-internal/SUCCESS.ts"

interface Optional<R extends Runtype.Core = Runtype.Core>
	extends Runtype.Common<Static<R> | undefined> {
	tag: "optional"
	underlying: R
}

/**
 * Validates optional value.
 */
const Optional = <R extends Runtype.Core>(runtype: R) =>
	Runtype.create<Optional<R>>(
		value =>
			value === undefined ? SUCCESS(value) : (runtype.validate(value) as Result<Static<R>>),
		{ tag: "optional", underlying: runtype },
	)

export default Optional