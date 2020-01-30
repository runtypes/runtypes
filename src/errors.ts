export class ValidationError extends Error {
  public name: string = 'ValidationError';

  constructor(public message: string, public key?: string) {
    super(key ? `${message} in ${key}` : message);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
