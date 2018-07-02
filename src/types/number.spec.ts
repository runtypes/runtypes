import { Number } from '..';

describe('number', () => {
  describe('match', () => {
    it('works', () => {
      expect(Number.check(-1)).toEqual(-1);
      expect(Number.check(-0)).toEqual(-0);
      expect(Number.check(0)).toEqual(0);
      expect(Number.check(+0)).toEqual(+0);
      expect(Number.check(666)).toEqual(666);

      expect(() => Number.check(NaN)).toThrow();
      expect(() => Number.check(null)).toThrow();
      expect(() => Number.check(undefined)).toThrow();
      expect(() => Number.check(void 0)).toThrow();
      expect(() => Number.check([])).toThrow();
      expect(() => Number.check(true)).toThrow();
      expect(() => Number.check(false)).toThrow();
      expect(() => Number.check({})).toThrow();
      expect(() => Number.check(Symbol())).toThrow();
      expect(() => Number.check('some string')).toThrow();
    });
  });
});
