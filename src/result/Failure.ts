import type Runtype from "../Runtype.ts"
import type Failcode from "./Failcode.ts"

namespace Failure {
	/**
	 * A detailed object enumerating where the validation failed exactly.
	 */
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Details = { [key in string | number | symbol]: Failure }
}

type Legend = {
	/**
	 * The tag indicating failure.
	 */
	success: false

	/**
	 * A string that summarizes the problem overall.
	 */
	message: string

	/**
	 * The error code assigned to this type of error.
	 */
	code: Failcode

	/**
	 * The runtype used to test the value.
	 */
	expected: Runtype

	/**
	 * The value tested.
	 */
	received: unknown

	/**
	 * The detailed object enumerating where the validation failed exactly.
	 */
	details: Failure.Details

	/**
	 * The result of inner validation.
	 */
	inner: Failure

	/**
	 * The value thrown by the parser function.
	 */
	thrown: unknown
}

/**
 * A failed validation result.
 */
type Failure =
	| ((Pick<Legend, "success" | "message" | "code" | "expected" | "received"> &
			(Pick<Legend, "details"> | Pick<Legend, "inner"> | object)) & {
			code: typeof Failcode.TYPE_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received"> & {
			code: typeof Failcode.VALUE_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received"> &
			(Pick<Legend, "details"> | Pick<Legend, "inner">) & {
				code: typeof Failcode.KEY_INCORRECT
			} extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "details"> & {
			code: typeof Failcode.CONTENT_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "inner"> & {
			code: typeof Failcode.ARGUMENTS_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "inner"> & {
			code: typeof Failcode.RETURN_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "inner"> & {
			code: typeof Failcode.RESOLVE_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "thrown"> & {
			code: typeof Failcode.CONSTRAINT_FAILED
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected"> & {
			code: typeof Failcode.PROPERTY_MISSING
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received"> & {
			code: typeof Failcode.PROPERTY_PRESENT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received"> & {
			code: typeof Failcode.NOTHING_EXPECTED
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "thrown"> & {
			code: typeof Failcode.PARSING_FAILED
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)

export default Failure