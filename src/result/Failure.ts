import Failcode from "./Failcode.ts"

/**
 * A detailed object enumerating where the validation failed exactly.
 */
namespace Failure {
	// eslint-disable-next-line import/no-named-export
	export type Details =
		| (string | Details)[]
		| { [key in string | number | symbol]: string | Details }
}

/**
 * A failed validation result.
 */
type Failure = {
	/**
	 * A tag indicating failure.
	 */
	success: false

	/**
	 * An error code assigned to this type of error.
	 */
	code: Failcode

	/**
	 * A message indicating the reason why the validation failed.
	 */
	message: string

	/**
	 * A detailed object enumerating where the validation failed exactly.
	 */
	details?: Failure.Details
}

export default Failure