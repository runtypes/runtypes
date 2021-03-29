import { Message } from './result';

export class ValidationError extends Error {
  public name: string = 'ValidationError';
  public info: Message;

  constructor(summary: string, message?: Message) {
    super(summary);
    this.info = message || summary;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
