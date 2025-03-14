/**
 * A predefined error code indicating what type of failure has occured.
 */
type Failcode = keyof typeof Failcode
const Failcode = {
	/** The type of the received primitive value is incompatible with expected one. */
	TYPE_INCORRECT: "TYPE_INCORRECT",
	/** The received primitive value is incorrect. */
	VALUE_INCORRECT: "VALUE_INCORRECT",
	/** The key of the property is incorrect. */
	KEY_INCORRECT: "KEY_INCORRECT",
	/** One or more elements or properties of the received object are incorrect. */
	CONTENT_INCORRECT: "CONTENT_INCORRECT",
	/** One or more arguments passed to the function is incorrect. */
	ARGUMENTS_INCORRECT: "ARGUMENTS_INCORRECT",
	/** The value returned by the function is incorrect. */
	RETURN_INCORRECT: "RETURN_INCORRECT",
	/** The value resolved by the function is incorrect. */
	RESOLVE_INCORRECT: "RESOLVE_INCORRECT",
	/** The received value does not fulfill the constraint. */
	CONSTRAINT_FAILED: "CONSTRAINT_FAILED",
	/** The property must be present but missing. */
	PROPERTY_MISSING: "PROPERTY_MISSING",
	/** The property must not be present but present. */
	PROPERTY_PRESENT: "PROPERTY_PRESENT",
	/** The value must not be present but present. */
	NOTHING_EXPECTED: "NOTHING_EXPECTED",
	/** The value can't be parsed. */
	PARSING_FAILED: "PARSING_FAILED",
	/** `Symbol.hasInstance` of the class failed. */
	INSTANCEOF_FAILED: "INSTANCEOF_FAILED",
} as const

export default Failcode