import { Union, String, Literal, Record, Number, InstanceOf } from '..';
import { Failcode } from '../result';
import { Static } from '../runtype';
import { LiteralBase } from './literal';
import outdent from 'outdent';

const ThreeOrString = Union(Literal(3), String);

describe('union', () => {
  describe('mapped literals', () => {
    it('works with its static types', () => {
      const values = ['Unknown', 'Online', 'Offline'] as const;
      type ElementOf<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;
      type LiteralOf<T extends readonly unknown[]> = {
        [K in keyof T]: T[K] extends ElementOf<T>
          ? T[K] extends LiteralBase
            ? Literal<T[K]>
            : never
          : never;
      };
      type L = LiteralOf<typeof values>;
      const literals = (values.map(Literal) as unknown) as L;
      const Values = Union<L>(...literals);
      type Values = Static<typeof Values>;
      const v: Values = 'Online';
      expect(() => Values.check(v)).not.toThrow();
    });
  });

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

  describe('discriminated union', () => {
    it('should pick correct alternative with typescript docs example', () => {
      const Square = Record({ kind: Literal('square'), size: Number });
      const Rectangle = Record({ kind: Literal('rectangle'), width: Number, height: Number });
      const Circle = Record({ kind: Literal('circle'), radius: Number });

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.validate({ kind: 'square', size: new Date() })).toMatchObject({
        success: false,
        code: Failcode.CONTENT_INCORRECT,
        message: outdent`
          Validation failed:
          {
            "size": "Expected number, but was Date"
          }.
          Object should match { kind: "square"; size: number; }
        `,
        details: { size: 'Expected number, but was Date' },
      });

      expect(Shape.validate({ kind: 'rectangle', size: new Date() })).toMatchObject({
        success: false,
        code: Failcode.CONTENT_INCORRECT,
        message: outdent`
          Validation failed:
          {
            "width": "Expected number, but was missing",
            "height": "Expected number, but was missing"
          }.
          Object should match { kind: "rectangle"; width: number; height: number; }
        `,
        details: {
          width: 'Expected number, but was missing',
          height: 'Expected number, but was missing',
        },
      });

      expect(Shape.validate({ kind: 'circle', size: new Date() })).toMatchObject({
        success: false,
        code: Failcode.CONTENT_INCORRECT,
        message: outdent`
          Validation failed:
          {
            "radius": "Expected number, but was missing"
          }.
          Object should match { kind: "circle"; radius: number; }
        `,
        details: { radius: 'Expected number, but was missing' },
      });

      expect(Shape.validate({ kind: 'other', size: new Date() })).not.toHaveProperty('key');
    });

    it('should not pick alternative if the discriminant is not unique', () => {
      const Square = Record({ kind: Literal('square'), size: Number });
      const Rectangle = Record({ kind: Literal('rectangle'), width: Number, height: Number });
      const CircularSquare = Record({ kind: Literal('square'), radius: Number });

      const Shape = Union(Square, Rectangle, CircularSquare);

      expect(Shape.validate({ kind: 'square', size: new Date() })).not.toHaveProperty('key');
    });

    it('should not pick alternative if not all types are records', () => {
      const Square = Record({ kind: Literal('square'), size: Number });
      const Rectangle = Record({ kind: Literal('rectangle'), width: Number, height: Number });

      const Shape = Union(Square, Rectangle, InstanceOf(Date));

      expect(Shape.validate({ kind: 'square', size: new Date() })).not.toHaveProperty('key');
    });
  });
});
