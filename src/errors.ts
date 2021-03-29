import { Message } from './result';

export class ValidationError extends Error {
  public name: string = 'ValidationError';
  public info: Message;

  constructor(message: Message, public key?: string) {
    super(key ? `${String(message)} in ${key}` : String(message));
    this.info = message;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
