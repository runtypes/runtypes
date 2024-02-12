import Failure from "./Failure.ts"
import Success from "./Success.ts"

/**
 * The result of a type validation.
 */
type Result<T> = Success<T> | Failure

export default Result