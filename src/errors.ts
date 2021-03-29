import { Failcode, Failure, Message } from './result';

export class ValidationError extends Error {
  public name: string = 'ValidationError';
  public code: Failcode;
  public details: Message;

  constructor(summary: string, failure: Failure) {
    super(summary);
    this.code = failure.code;
    this.details = failure.message;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
