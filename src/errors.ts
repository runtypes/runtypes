export class ValidationError extends Error {
  public name: string = 'ValidationError';

  constructor(public message: string, public key?: string) {
    super(message);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
