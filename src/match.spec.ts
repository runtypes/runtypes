import { Literal, String, Number, match, Unknown } from '.';

describe('match', () => {
  it('works', () => {
    const f = match(
      [Literal(42), fortyTwo => fortyTwo / 2],
      [Number, n => n + 9],
      [String, s => s.length * 2],
      [
        Unknown,
        () => {
          throw new Error('woops');
        },
      ],
    );

    expect(f(42)).toBe(21);
    expect(f(16)).toBe(25);
    expect(f('yooo')).toBe(8);
    expect(() => f(true)).toThrow('woops');
  });
});
