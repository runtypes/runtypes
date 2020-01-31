import { AsyncContract, Number } from '.';

describe('AsyncContract', () => {
  describe('when function does not return a promise', () => {
    it('throws a validation error', () => {
      const contractedFunction = AsyncContract(Number).enforce(() => 7 as any);
      expect(contractedFunction).toThrow();
    });
  });
  describe('when a function does return a promise', () => {
    it('should validate successfully', () => {
      const contractedFunction = AsyncContract(Number).enforce(() => Promise.resolve(7));
      return contractedFunction()
    })
  });
});
