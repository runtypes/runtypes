import type Failure from "./Failure.ts"
import defineIntrinsics from "../utils-internal/defineIntrinsics.ts"

const ValidationErrorSymbol: unique symbol = globalThis.Symbol.for(
	"runtypes/ValidationError",
) as any

class ValidationError extends Error {
	override name = "ValidationError" as const
	failure: Failure

	constructor(failure: Failure) {
		super(failure.message)
		this.failure = failure
		defineIntrinsics(this, { [ValidationErrorSymbol]: undefined })
	}

	static isValidationError = (value: unknown): value is ValidationError =>
		value instanceof Error && ValidationErrorSymbol in value

	static override [Symbol.hasInstance] = ValidationError.isValidationError
}

export default ValidationError