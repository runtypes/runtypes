/**
 * A detailed object enumerating where the validation failed exactly.
 */
export type Details =
  | (string | Details)[]
  | { [key in string | number | symbol]: string | Details };

/**
 * A predefined error code indicating what type of failure has occured.
 */
export type Failcode = typeof Failcode[keyof typeof Failcode];
export const Failcode = {
  /** The type of the received primitive value is incompatible with expected one. */
  TYPE_INCORRECT: 'TYPE_INCORRECT',
  /** The received primitive value is incorrect. */
  VALUE_INCORRECT: 'VALUE_INCORRECT',
  /** The key of the property is incorrect. */
  KEY_INCORRECT: 'KEY_INCORRECT',
  /** One or more elements or properties of the received object are incorrect. */
  CONTENT_INCORRECT: 'CONTENT_INCORRECT',
  /** One or more arguments passed to the function is incorrect. */
  ARGUMENT_INCORRECT: 'ARGUMENT_INCORRECT',
  /** The value returned by the function is incorrect. */
  RETURN_INCORRECT: 'RETURN_INCORRECT',
  /** The received value does not fulfill the constraint. */
  CONSTRAINT_FAILED: 'CONSTRAINT_FAILED',
  /** The property must be present but missing. */
  PROPERTY_MISSING: 'PROPERTY_MISSING',
  /** The property must not be present but present. */
  PROPERTY_PRESENT: 'PROPERTY_PRESENT',
  /** The value must not be present but present. */
  NOTHING_EXPECTED: 'NOTHING_EXPECTED',
  /** The value can't be transformed. */
  TRANSFORM_FAILED: 'TRANSFORM_FAILED',
} as const;

/**
 * A successful validation result.
 */
export type Success<T> = {
  /**
   * A tag indicating success.
   */
  success: true;

  /**
   * The original value, cast to its validated type.
   */
  value: T;
};

/**
 * A failed validation result.
 */
export type Failure = {
  /**
   * A tag indicating failure.
   */
  success: false;

  /**
   * An error code assigned to this type of error.
   */
  code: Failcode;

  /**
   * A message indicating the reason why the validation failed.
   */
  message: string;

  /**
   * A detailed object enumerating where the validation failed exactly.
   */
  details?: Details;

  /**
   * A value thrown by the transformer function.
   */
  thrown?: unknown;
};

/**
 * The result of a type validation.
 */
export type Result<T> = Success<T> | Failure;
