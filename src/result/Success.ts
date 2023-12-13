/**
 * A successful validation result.
 */
type Success<T> = {
	/**
	 * A tag indicating success.
	 */
	success: true

	/**
	 * The original value, cast to its validated type.
	 */
	value: T
}

export default Success