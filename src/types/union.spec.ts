import { Union, String, Literal, Record, Number, InstanceOf, Tuple } from '..';

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

  describe('discriminated union', () => {
    it('should pick correct alternative with typescript docs example', () => {
      const Square = Record({ kind: Literal('square'), size: Number });
      const Rectangle = Record({ kind: Literal('rectangle'), width: Number, height: Number });
      const Circle = Record({ kind: Literal('circle'), radius: Number });

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.validate({ kind: 'square', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "key": "<kind: 'square'>.size",
          "message": "Expected number, but was object",
          "success": false,
        }
      `);

      expect(Shape.validate({ kind: 'rectangle', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "key": "<kind: 'rectangle'>.width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.validate({ kind: 'circle', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "key": "<kind: 'circle'>.radius",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.validate({ kind: 'other', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "key": "kind",
          "message": "Expected 'square' | 'rectangle' | 'circle', but was 'other'",
          "success": false,
        }
      `);

      expect(Shape.validate(42)).toMatchInlineSnapshot(`
        Object {
          "message": "Expected { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }, but was number",
          "success": false,
        }
      `);
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

    it('should handle tuples where the first component is a literal tag', () => {
      const Square = Tuple(Literal('square'), Record({ size: Number }));
      const Rectangle = Tuple(Literal('rectangle'), Record({ width: Number, height: Number }));
      const Circle = Tuple(Literal('circle'), Record({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.validate(['square', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "key": "<[0]: 'square'>.[1].size",
          "message": "Expected number, but was object",
          "success": false,
        }
      `);

      expect(Shape.validate(['rectangle', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "key": "<[0]: 'rectangle'>.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.validate(['circle', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "key": "<[0]: 'circle'>.[1].radius",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.validate(['other', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "key": "[0]",
          "message": "Expected 'square' | 'rectangle' | 'circle', but was 'other'",
          "success": false,
        }
      `);
    });

    it('hould not pick alternative if the tuple discriminant is not unique', () => {
      const Square = Tuple(Literal('rectangle'), Record({ size: Number }));
      const Rectangle = Tuple(Literal('rectangle'), Record({ width: Number, height: Number }));
      const Circle = Tuple(Literal('circle'), Record({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.validate(['rectangle', { size: new Date() }])).not.toHaveProperty('key');
    });

    it('hould not pick alternative if the tuple has no discriminant', () => {
      const Square = Tuple(String, Record({ size: Number }));
      const Rectangle = Tuple(String, Record({ width: Number, height: Number }));
      const Circle = Tuple(String, Record({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.validate(['rectangle', { size: new Date() }])).not.toHaveProperty('key');
    });

    it('should handle numeric tags', () => {
      const Version1 = Tuple(Literal(1), Record({ size: Number }));
      const Version2 = Tuple(Literal(2), Record({ width: Number, height: Number }));

      const Shape = Union(Version1, Version2);

      expect(Shape.validate([1, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "success": true,
          "value": Array [
            1,
            Object {
              "size": 10,
            },
          ],
        }
      `);

      expect(Shape.validate([2, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "key": "<[0]: 2>.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.validate([2, { width: 10, height: 20 }])).toMatchInlineSnapshot(`
        Object {
          "success": true,
          "value": Array [
            2,
            Object {
              "height": 20,
              "width": 10,
            },
          ],
        }
      `);

      expect(Shape.validate([3, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "key": "[0]",
          "message": "Expected 1 | 2, but was 3",
          "success": false,
        }
      `);

      const extract = Shape.match(
        ([_, { size }]) => ({ width: size, height: size }),
        ([_, dimensions]) => dimensions,
      );

      expect(extract([1, { size: 20 }])).toMatchInlineSnapshot(`
        Object {
          "height": 20,
          "width": 20,
        }
      `);

      expect(extract([2, { width: 20, height: 20 }])).toMatchInlineSnapshot(`
        Object {
          "height": 20,
          "width": 20,
        }
      `);

      expect(() => extract([2, { size: 20 } as any])).toThrowErrorMatchingInlineSnapshot(
        `"Expected number, but was undefined in <[0]: 2>.[1].width"`,
      );
    });
  });
});
