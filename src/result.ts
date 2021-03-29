/**
 * A message indicating the reason why validation failed, or a complex object enumerating where the validation failed exactly.
 */
export type Message = string | Message[] | { [key in string | number | symbol]: Message };

/**
 * A predefined error code indicating what type of failure is occured.
 */
export type Failcode = keyof typeof Failcode;
export const Failcode = {
  TYPE_INCORRECT: 'TYPE_INCORRECT',
  VALUE_INCORRECT: 'VALUE_INCORRECT',
  KEY_INCORRECT: 'KEY_INCORRECT',
  CONTENT_INCORRECT: 'CONTENT_INCORRECT',
  ARGUMENT_INCORRECT: 'ARGUMENT_INCORRECT',
  RETURN_INCORRECT: 'RETURN_INCORRECT',
  PROPERTY_MISSING: 'PROPERTY_MISSING',
  PROPERTY_PRESENT: 'PROPERTY_PRESENT',
  NOTHING_EXPECTED: 'NOTHING_EXPECTED',
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
   * A message indicating the reason why the validation failed, or a complex object enumerating where the validation failed exactly.
   */
  message: Message;

  /**
   * An error code assigned to this type of error.
   */
  code: Failcode;
};

/**
 * The result of a type validation.
 */
export type Result<T> = Success<T> | Failure;
