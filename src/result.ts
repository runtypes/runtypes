/**
 * A message indicating the reason why validation failed, or a complex object enumerating where the validation failed exactly.
 */
export type Message = string | Message[] | { [key in string | number | symbol]: Message };

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
   * A message indicating the reason why validation failed, or a complex object enumerating where the validation failed exactly.
   */
  message: Message;
};

/**
 * The result of a type validation.
 */
export type Result<T> = Success<T> | Failure;
