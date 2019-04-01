import { Literal, String, Number, match } from '.';

describe('match', () => {
  it('works', () => {
    const f = match(
      [Literal(42), fortyTwo => fortyTwo / 2],
      [Number, n => n + 9],
      [String, s => s.length * 2],
    );

    expect(f(42)).toBe(21);
    expect(f(16)).toBe(25);
    expect(f('yooo')).toBe(8);
    expect(() => f(true as any)).toThrow('No alternatives were matched');
  });
});
