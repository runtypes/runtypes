import type Failcode from "./Failcode.ts"
import type Failure from "./Failure.ts"

class ValidationError extends Error {
	public override name: string = "ValidationError"
	public code: Failcode
	public details?: Failure.Details

	constructor(failure: Failure) {
		super(failure.message)
		this.code = failure.code
		if (failure.details !== undefined) this.details = failure.details
		globalThis.Object.setPrototypeOf(this, ValidationError.prototype)
	}
}

export default ValidationError