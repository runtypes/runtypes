import { Failcode, Failure, Details } from './result';

export class ValidationError extends Error {
  public name: string = 'ValidationError';
  public code: Failcode;
  public details?: Details;

  constructor(failure: Failure) {
    super(failure.message);
    this.code = failure.code;
    if (failure.details !== undefined) this.details = failure.details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
