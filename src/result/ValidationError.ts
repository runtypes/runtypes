import type Failure from "./Failure.ts"
import defineIntrinsics from "../utils-internal/defineIntrinsics.ts"

const ValidationErrorSymbol: unique symbol = globalThis.Symbol() as any

class ValidationError extends Error {
	/**
	 * Always `"ValidationError"`.
	 */
	override name = "ValidationError" as const

	/**
	 * A string that summarizes the problem overall.
	 */
	override message: string

	/**
	 * An object that describes the problem in a structured way.
	 */
	failure: Failure

	constructor(failure: Failure) {
		super(failure.message)
		this.message = failure.message
		this.failure = failure
		defineIntrinsics(this, { [ValidationErrorSymbol]: undefined })
	}

	static isValidationError = (value: unknown): value is ValidationError =>
		value instanceof Error && globalThis.Object.hasOwn(value, ValidationErrorSymbol)

	static override [globalThis.Symbol.hasInstance] = ValidationError.isValidationError
}

export default ValidationError