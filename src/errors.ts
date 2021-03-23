export class ValidationError extends Error {
  public name: string = 'ValidationError';

  constructor(message: string, public key?: string) {
    super(key ? `${message} in ${key}` : message);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
