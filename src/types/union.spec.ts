import { Union, String, Literal } from '..';

const ThreeOrString = Union(Literal(3), String);

describe('union', () => {
  describe('match', () => {
    it('works with exhaustive cases', () => {
      const match = ThreeOrString.match(
        three => three + 5,
        str => str.length * 4,
      );
      expect(match(3)).toBe(8);
      expect(match('hello')).toBe(20);
    });
  });
});
