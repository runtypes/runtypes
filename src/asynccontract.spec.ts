import { AsyncContract, Number } from '.';
import { ValidationError } from './errors';

describe('AsyncContract', () => {
  describe('when function does not return a promise', () => {
    it('throws a validation error', () => {
      const contractedFunction = AsyncContract(Number).enforce(() => 7 as any);
      expect(contractedFunction).toThrow(ValidationError);
    });
  });
  describe('when a function does return a promise, but for the wrong type', () => {
    it('throws a validation error asynchronously', async () => {
      const contractedFunction = AsyncContract(Number).enforce(() => Promise.resolve('hi' as any));
      try {
        await contractedFunction();
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
      }
    });
  });
  describe('when a function does return a promise', () => {
    it('should validate successfully', async () => {
      const contractedFunction = AsyncContract(Number).enforce(() => Promise.resolve(7));
      await expect(contractedFunction()).resolves.toBe(7);
    });
  });
  describe('when not enough arguments are provided', () => {
    it('throws a validation error', () => {
      const contractedFunction = AsyncContract(Number, Number).enforce(n => Promise.resolve(n + 1));
      expect(contractedFunction).toThrow(ValidationError);
    });
  });
});
