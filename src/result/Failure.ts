import type Runtype from "../Runtype.ts"
import type Failcode from "./Failcode.ts"

namespace Failure {
	/**
	 * A detailed object enumerating where the validation failed exactly.
	 */
	// eslint-disable-next-line import/no-named-export, import/no-unused-modules
	export type Details = globalThis.Record<PropertyKey, Failure>
}

type Legend = {
	/**
	 * The tag indicating failure.
	 */
	success: false

	/**
	 * An error code that roughly categorizes the problem.
	 */
	code: Failcode

	/**
	 * A string that summarizes the problem overall. Only for debugging.
	 */
	message: string

	/**
	 * The runtype that yielded this failure.
	 */
	expected: Runtype.Interfaces

	/**
	 * The value that caused this failure.
	 */
	received: unknown

	/**
	 * An object that describes which property was invalid precisely. Only available for complex runtypes (e.g. `Object`, `Array`, and the like; `Union` and `Intersect` also emit this enumerating a failure for each member).
	 */
	details: Failure.Details

	/**
	 * An object that describes the failure of the inner runtype. Only available for `Brand` and contextual failures (e.g. failures in `Record` keys, in boundaries of `Contract`/`AsyncContract`, etc.).
	 */
	detail: Failure

	/**
	 * A thrown value, which is typically an error message, if any. Only available for runtypes that involve user-provided validation functions (e.g. `Constraint` and `Parser`) or constraint-like failures like about the length of `Tuple`.
	 */
	thrown: unknown
}

/**
 * A failed validation result.
 */
type Failure =
	| ((Pick<Legend, "success" | "message" | "code" | "expected" | "received"> &
			(Pick<Legend, "details"> | Pick<Legend, "detail"> | object)) & {
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
			Pick<Legend, "detail"> & {
				code: typeof Failcode.KEY_INCORRECT
			} extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "details"> & {
			code: typeof Failcode.CONTENT_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "detail"> & {
			code: typeof Failcode.ARGUMENTS_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "detail"> & {
			code: typeof Failcode.RETURN_INCORRECT
	  } extends infer T
			? { [K in keyof T]: T[K] }
			: never)
	| (Pick<Legend, "success" | "message" | "code" | "expected" | "received" | "detail"> & {
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