import { Failure, FullError, showError } from './result';

export class ValidationError extends Error {
  public name: string = 'ValidationError';
  public readonly shortMessage: string;
  public readonly key: string | undefined;
  public readonly fullError: FullError | undefined;

  constructor(failure: Omit<Failure, 'success'>) {
    super(showError(failure));
    this.shortMessage = failure.message;
    this.key = failure.key;
    this.fullError = failure.fullError;
  }
}
