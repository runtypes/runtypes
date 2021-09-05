import { Static, Dictionary, Literal, Optional, String } from '..';

describe('dictionary', () => {
  it('works with optional properties', () => {
    const T = Dictionary(Optional(String), Literal('bar'));
    type T = Static<typeof T>;
    type Expected = { bar?: string | undefined };
    const t: [Expected, T] extends [T, Expected] ? T : never = {};
    expect(T.guard(t)).toBe(true);
  });
});
