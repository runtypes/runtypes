import { Record, Array, Literal, String, Number, match, Always } from '.';
import { Runtype } from './runtype';

describe('match', () => {
  it('handles simple cases', () => {
    const f = match(
      [Literal(42), fortyTwo => fortyTwo / 2],
      [Number, n => n + 9],
      [String, s => s.length * 2],
      [
        Always,
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

  it('handles overlaps', () => {
    const f = match(
      [Record({ tag: Literal(true), value: Number }), ({ value }) => value * 2],
      [Record({ tag: Literal(true) }), () => 42],
    );

    expect(f({ tag: true, value: 3 })).toBe(6);
    expect(f({ tag: true })).toBe(42);
  });

  it('performs well', () => {
    const Str = Counter(String);
    const Num = Counter(Number);

    const f = match(
      [Array(Str), arr => arr.reduce((sum, s) => sum + s.length, 0)],
      [Array(Num), arr => arr.reduce((sum, n) => sum + n, 0)],
    );

    expect(f(['no', 'te', 'bastardes', 'carborundorum'])).toBe(26);
    expect(Str.count()).toBe(1);
    expect(Num.count()).toBe(1);

    Str.reset();
    Num.reset();

    expect(f([1, 2, 3, 4, 5, 6])).toBe(21);
    expect(Str.count()).toBe(1);
    expect(Num.count()).toBe(0);
  });
});

interface Counter<A> extends Runtype<A> {
  count(): number;
  reset(): void;
}

const Counter = <A>(A: Runtype<A>): Counter<A> => {
  let count = 0;
  return Object.assign(
    Always.withConstraint(() => {
      count++;
      return true;
    }).And(A),
    {
      count() {
        return count;
      },
      reset() {
        count = 0;
      },
    },
  );
};
