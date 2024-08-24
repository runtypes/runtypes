import type Failure from "./Failure.ts"
import type Success from "./Success.ts"

/**
 * The result of a type validation.
 */
type Result<T> = Success<T> | Failure

export default Result