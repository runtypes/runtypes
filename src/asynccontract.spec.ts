import { AsyncContract, Number } from '.';

describe('AsyncContract', () => {
  describe('when function does not return a promise', () => {
    it('throws a validation error', async () => {
      const contractedFunction = AsyncContract([], Number).enforce(() => 7 as any);
      await expect(contractedFunction()).rejects.toMatchInlineSnapshot(
        `[ValidationError: Expected function to return a promise, but instead got 7]`,
      );
    });
  });
  describe('when a function does return a promise, but for the wrong type', () => {
    it('throws a validation error asynchronously', async () => {
      const contractedFunction = AsyncContract([], Number).enforce(() =>
        Promise.resolve('hi' as any),
      );
      await expect(contractedFunction()).rejects.toMatchInlineSnapshot(
        `[ValidationError: Expected number, but was "hi" (i.e. a string literal)]`,
      );
    });
  });
  describe('when a function does return a promise, for the correct type', () => {
    it('should validate successfully', async () => {
      const contractedFunction = AsyncContract([], Number).enforce(() => Promise.resolve(7));
      await expect(contractedFunction()).resolves.toBe(7);
    });
  });
  describe('when not enough arguments are provided', () => {
    it('throws a validation error', async () => {
      const contractedFunction = AsyncContract([Number], Number).enforce(n =>
        Promise.resolve(n + 1),
      );
      await expect((contractedFunction as any)()).rejects.toMatchInlineSnapshot(
        `[ValidationError: Expected 1 arguments but only received 0]`,
      );
    });
  });
  describe('when arguments are of the wrong type', () => {
    it('throws a validation error', async () => {
      const contractedFunction = AsyncContract([Number], Number).enforce(n =>
        Promise.resolve(n + 1),
      );
      await expect(contractedFunction('whatever' as any)).rejects.toMatchInlineSnapshot(
        `[ValidationError: Expected number, but was "whatever" (i.e. a string literal)]`,
      );
    });
  });
  describe('when arguments are valid', () => {
    it('throws a validation error', async () => {
      const contractedFunction = AsyncContract([Number], Number).enforce(n =>
        Promise.resolve(n + 1),
      );
      await expect(contractedFunction(41)).resolves.toEqual(42);
    });
  });
});
