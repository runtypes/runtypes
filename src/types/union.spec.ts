import { Array, Union, String, Literal, Object, Number, InstanceOf, Tuple } from '..';
import { Null } from './literal';

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
      const Square = Object({ kind: Literal('square'), size: Number });
      const Rectangle = Object({ kind: Literal('rectangle'), width: Number, height: Number });
      const Circle = Object({ kind: Literal('circle'), radius: Number });

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.safeParse({ kind: 'square', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {kind: \\"square\\", size: {}} to { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }",
            Array [
              "Unable to assign {kind: \\"square\\", size: {}} to { kind: \\"square\\"; size: number; }",
              Array [
                "The types of \\"size\\" are not compatible",
                Array [
                  "Expected number, but was {}",
                ],
              ],
            ],
          ],
          "key": "<kind: \\"square\\">.size",
          "message": "Expected number, but was {}",
          "success": false,
        }
      `);

      expect(Shape.safeParse({ kind: 'rectangle', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {kind: \\"rectangle\\", size: {}} to { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }",
            Array [
              "Unable to assign {kind: \\"rectangle\\", size: {}} to { kind: \\"rectangle\\"; width: number; height: number; }",
              Array [
                "The types of \\"width\\" are not compatible",
                Array [
                  "Expected number, but was undefined",
                ],
              ],
              Array [
                "The types of \\"height\\" are not compatible",
                Array [
                  "Expected number, but was undefined",
                ],
              ],
            ],
          ],
          "key": "<kind: \\"rectangle\\">.width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse({ kind: 'circle', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {kind: \\"circle\\", size: {}} to { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }",
            Array [
              "Unable to assign {kind: \\"circle\\", size: {}} to { kind: \\"circle\\"; radius: number; }",
              Array [
                "The types of \\"radius\\" are not compatible",
                Array [
                  "Expected number, but was undefined",
                ],
              ],
            ],
          ],
          "key": "<kind: \\"circle\\">.radius",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse({ kind: 'other', size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {kind: \\"other\\", size: {}} to { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }",
            Array [
              "The types of \\"kind\\" are not compatible",
              Array [
                "Expected 'square' | 'rectangle' | 'circle', but was \\"other\\"",
              ],
            ],
          ],
          "key": "kind",
          "message": "Expected 'square' | 'rectangle' | 'circle', but was \\"other\\"",
          "success": false,
        }
      `);

      expect(Shape.safeParse(42)).toMatchInlineSnapshot(`
        Object {
          "message": "Expected { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }, but was 42",
          "success": false,
        }
      `);

      expect(Shape.safeParse(null)).toMatchInlineSnapshot(`
        Object {
          "message": "Expected { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }, but was null",
          "success": false,
        }
      `);

      expect(Shape.safeParse({ kind: { v: 'circle' }, size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {kind: {v: \\"circle\\"}, size: {}} to { kind: \\"square\\"; size: number; } | { kind: \\"rectangle\\"; width: number; height: number; } | { kind: \\"circle\\"; radius: number; }",
            Array [
              "The types of \\"kind\\" are not compatible",
              Array [
                "Expected 'square' | 'rectangle' | 'circle', but was {v: \\"circle\\"}",
              ],
            ],
          ],
          "key": "kind",
          "message": "Expected 'square' | 'rectangle' | 'circle', but was {v: \\"circle\\"}",
          "success": false,
        }
      `);
    });

    it('should not pick alternative if the discriminant is not unique', () => {
      const Square = Object({ kind: Literal('square'), size: Number });
      const Rectangle = Object({ kind: Literal('rectangle'), width: Number, height: Number });
      const CircularSquare = Object({ kind: Literal('square'), radius: Number });

      const Shape = Union(Square, Rectangle, CircularSquare);

      expect(Shape.safeParse({ kind: 'square', size: new Date() })).not.toHaveProperty('key');
    });

    it('should not pick alternative if not all types are records', () => {
      const Square = Object({ kind: Literal('square'), size: Number });
      const Rectangle = Object({ kind: Literal('rectangle'), width: Number, height: Number });

      const Shape = Union(Square, Rectangle, InstanceOf(Date));

      expect(Shape.safeParse({ kind: 'square', size: new Date() })).not.toHaveProperty('key');
    });

    it('should handle tuples where the first component is a literal tag', () => {
      const Square = Tuple(Literal('square'), Object({ size: Number }));
      const Rectangle = Tuple(Literal('rectangle'), Object({ width: Number, height: Number }));
      const Circle = Tuple(Literal('circle'), Object({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.safeParse(['square', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [\\"square\\", {size: {}}] to [\\"square\\", { size: number; }] | [\\"rectangle\\", { width: number; height: number; }] | [\\"circle\\", { radius: number; }]",
            Array [
              "Unable to assign [\\"square\\", {size: {}}] to [\\"square\\", { size: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: {}} to { size: number; }",
                  Array [
                    "The types of \\"size\\" are not compatible",
                    Array [
                      "Expected number, but was {}",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: \\"square\\">.[1].size",
          "message": "Expected number, but was {}",
          "success": false,
        }
      `);

      expect(Shape.safeParse(['rectangle', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [\\"rectangle\\", {size: {}}] to [\\"square\\", { size: number; }] | [\\"rectangle\\", { width: number; height: number; }] | [\\"circle\\", { radius: number; }]",
            Array [
              "Unable to assign [\\"rectangle\\", {size: {}}] to [\\"rectangle\\", { width: number; height: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: {}} to { width: number; height: number; }",
                  Array [
                    "The types of \\"width\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                  Array [
                    "The types of \\"height\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: \\"rectangle\\">.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse(['circle', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [\\"circle\\", {size: {}}] to [\\"square\\", { size: number; }] | [\\"rectangle\\", { width: number; height: number; }] | [\\"circle\\", { radius: number; }]",
            Array [
              "Unable to assign [\\"circle\\", {size: {}}] to [\\"circle\\", { radius: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: {}} to { radius: number; }",
                  Array [
                    "The types of \\"radius\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: \\"circle\\">.[1].radius",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse(['other', { size: new Date() }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [\\"other\\", {size: {}}] to [\\"square\\", { size: number; }] | [\\"rectangle\\", { width: number; height: number; }] | [\\"circle\\", { radius: number; }]",
            Array [
              "The types of [0] are not compatible",
              Array [
                "Expected 'square' | 'rectangle' | 'circle', but was \\"other\\"",
              ],
            ],
          ],
          "key": "[0]",
          "message": "Expected 'square' | 'rectangle' | 'circle', but was \\"other\\"",
          "success": false,
        }
      `);
    });

    it('should not pick alternative if the tuple discriminant is not unique', () => {
      const Square = Tuple(Literal('rectangle'), Object({ size: Number }));
      const Rectangle = Tuple(Literal('rectangle'), Object({ width: Number, height: Number }));
      const Circle = Tuple(Literal('circle'), Object({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.safeParse(['rectangle', { size: new Date() }])).not.toHaveProperty('key');
    });

    it('should not pick alternative if the tuple has no discriminant', () => {
      const Square = Tuple(String, Object({ size: Number }));
      const Rectangle = Tuple(String, Object({ width: Number, height: Number }));
      const Circle = Tuple(String, Object({ radius: Number }));

      const Shape = Union(Square, Rectangle, Circle);

      expect(Shape.safeParse(['rectangle', { size: new Date() }])).not.toHaveProperty('key');
    });

    it('should handle numeric tags', () => {
      const Version1 = Tuple(Literal(1), Object({ size: Number }));
      const Version2 = Tuple(Literal(2), Object({ width: Number, height: Number }));

      const Shape = Union(Version1, Version2);

      expect(Shape.safeParse([1, { size: 10 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([2, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [2, {size: 10}] to [1, { size: number; }] | [2, { width: number; height: number; }]",
            Array [
              "Unable to assign [2, {size: 10}] to [2, { width: number; height: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: 10} to { width: number; height: number; }",
                  Array [
                    "The types of \\"width\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                  Array [
                    "The types of \\"height\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: 2>.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse([2, { width: 10, height: 20 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([3, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [3, {size: 10}] to [1, { size: number; }] | [2, { width: number; height: number; }]",
            Array [
              "The types of [0] are not compatible",
              Array [
                "Expected 1 | 2, but was 3",
              ],
            ],
          ],
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

      expect(() => extract([2, { size: 20 } as any])).toThrowErrorMatchingInlineSnapshot(`
"Unable to assign [2, {size: 20}] to [1, { size: number; }] | [2, { width: number; height: number; }]
  Unable to assign [2, {size: 20}] to [2, { width: number; height: number; }]
    The types of [1] are not compatible
      Unable to assign {size: 20} to { width: number; height: number; }
        The types of \\"width\\" are not compatible
          Expected number, but was undefined
        The types of \\"height\\" are not compatible
          Expected number, but was undefined"
`);
    });
    it('should handle branded tags', () => {
      const Version1 = Tuple(Literal(1).withBrand('version'), Object({ size: Number }));
      const Version2 = Tuple(
        Literal(2).withBrand('version'),
        Object({ width: Number, height: Number }),
      );

      const Shape = Union(Version1, Version2);

      expect(Shape.safeParse([1, { size: 10 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([2, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [2, {size: 10}] to [1, { size: number; }] | [2, { width: number; height: number; }]",
            Array [
              "Unable to assign [2, {size: 10}] to [2, { width: number; height: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: 10} to { width: number; height: number; }",
                  Array [
                    "The types of \\"width\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                  Array [
                    "The types of \\"height\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: 2>.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse([2, { width: 10, height: 20 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([3, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [3, {size: 10}] to [1, { size: number; }] | [2, { width: number; height: number; }]",
            Array [
              "The types of [0] are not compatible",
              Array [
                "Expected 1 | 2, but was 3",
              ],
            ],
          ],
          "key": "[0]",
          "message": "Expected 1 | 2, but was 3",
          "success": false,
        }
      `);
    });
    it('should handle constraints', () => {
      const Version1 = Tuple(Literal(1).withBrand('version'), Object({ size: Number }));
      const Version2 = Tuple(
        Literal(2).withBrand('version'),
        Object({ width: Number, height: Number }),
      ).withConstraint(([_, { width, height }]) =>
        width > 0 && height > 0 ? true : 'Cannot have both width and height be 0',
      );

      const Shape = Union(Version1, Version2);

      expect(Shape.safeParse([1, { size: 10 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([2, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [2, {size: 10}] to [1, { size: number; }] | WithConstraint<[2, { width: number; height: number; }]>",
            Array [
              "Unable to assign [2, {size: 10}] to [2, { width: number; height: number; }]",
              Array [
                "The types of [1] are not compatible",
                Array [
                  "Unable to assign {size: 10} to { width: number; height: number; }",
                  Array [
                    "The types of \\"width\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                  Array [
                    "The types of \\"height\\" are not compatible",
                    Array [
                      "Expected number, but was undefined",
                    ],
                  ],
                ],
              ],
            ],
          ],
          "key": "<[0]: 2>.[1].width",
          "message": "Expected number, but was undefined",
          "success": false,
        }
      `);

      expect(Shape.safeParse([2, { width: 10, height: 20 }])).toMatchInlineSnapshot(`
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

      expect(Shape.safeParse([3, { size: 10 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [3, {size: 10}] to [1, { size: number; }] | WithConstraint<[2, { width: number; height: number; }]>",
            Array [
              "The types of [0] are not compatible",
              Array [
                "Expected 1 | 2, but was 3",
              ],
            ],
          ],
          "key": "[0]",
          "message": "Expected 1 | 2, but was 3",
          "success": false,
        }
      `);

      expect(Shape.safeParse([2, { width: 0, height: 0 }])).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign [2, {width: 0, height: 0}] to [1, { size: number; }] | WithConstraint<[2, { width: number; height: number; }]>",
            Array [
              "Unable to assign [2, {width: 0, height: 0}] to WithConstraint<[2, { width: number; height: number; }]>",
              Array [
                "Cannot have both width and height be 0",
              ],
            ],
          ],
          "key": "<[0]: 2>",
          "message": "Cannot have both width and height be 0",
          "success": false,
        }
      `);
    });

    it('should cope with mixing discriminants and non discriminants', () => {
      const Square = Object({ shape: Literal(`Square`), size: Number });
      const Rectangle = Object({ shape: Literal(`Rectangle`), width: Number, height: Number });
      const Circle = Object({ shape: Literal(`Circle`), radius: Number });

      const Shape = Union(Square, Rectangle, Circle, Null);

      expect(Shape.safeParse({ shape: `Rectangle`, size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; } | null",
            Array [
              "Unable to assign {shape: \\"Rectangle\\", size: {}} to null",
              Array [
                "Expected literal null, but was {shape: \\"Rectangle\\", size: {}}",
              ],
            ],
            Array [
              "And unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; }",
              Array [
                "Unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Rectangle\\"; width: number; height: number; }",
                Array [
                  "The types of \\"width\\" are not compatible",
                  Array [
                    "Expected number, but was undefined",
                  ],
                ],
                Array [
                  "The types of \\"height\\" are not compatible",
                  Array [
                    "Expected number, but was undefined",
                  ],
                ],
              ],
            ],
          ],
          "message": "Expected { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; } | null, but was {shape: \\"Rectangle\\", size: {}}",
          "success": false,
        }
      `);
      expect(Shape.parse(null)).toEqual(null);
      expect(Shape.parse({ shape: `Square`, size: 42 })).toEqual({ shape: `Square`, size: 42 });

      const Shape2 = Union(Union(Square, Rectangle, Circle), Null);
      expect(Shape2.safeParse({ shape: `Rectangle`, size: new Date() })).toMatchInlineSnapshot(`
        Object {
          "fullError": Array [
            "Unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; } | null",
            Array [
              "Unable to assign {shape: \\"Rectangle\\", size: {}} to null",
              Array [
                "Expected literal null, but was {shape: \\"Rectangle\\", size: {}}",
              ],
            ],
            Array [
              "And unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; }",
              Array [
                "Unable to assign {shape: \\"Rectangle\\", size: {}} to { shape: \\"Rectangle\\"; width: number; height: number; }",
                Array [
                  "The types of \\"width\\" are not compatible",
                  Array [
                    "Expected number, but was undefined",
                  ],
                ],
                Array [
                  "The types of \\"height\\" are not compatible",
                  Array [
                    "Expected number, but was undefined",
                  ],
                ],
              ],
            ],
          ],
          "message": "Expected { shape: \\"Square\\"; size: number; } | { shape: \\"Rectangle\\"; width: number; height: number; } | { shape: \\"Circle\\"; radius: number; } | null, but was {shape: \\"Rectangle\\", size: {}}",
          "success": false,
        }
      `);
      expect(Shape2.parse(null)).toEqual(null);
      expect(Shape2.parse({ shape: `Square`, size: 42 })).toEqual({ shape: `Square`, size: 42 });
    });
  });
  it('does not break when reusing the same validator in multiple parts of the union', () => {
    const InnerObject = Object({
      myProp: String,
    });
    const OuterObjectA = Object({
      key: Object({ value: String }),
      body: InnerObject,
    });
    const OuterObjectB = Object({
      key: Object({ value: Number }),
      body: InnerObject,
    });
    expect(
      Union(OuterObjectA, OuterObjectB).safeParse({
        key: { value: 42 },
        body: { noMyPropHere: true },
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "fullError": Array [
          "Unable to assign {key: {value: 42}, body: {noMyPropHere: true}} to { key: { value: string; }; body: { myProp: string; }; } | { key: { value: number; }; body: { myProp: string; }; }",
          Array [
            "Unable to assign {key: {value: 42}, body: {noMyPropHere: true}} to { key: { value: string; }; body: { myProp: string; }; }",
            Array [
              "The types of \\"key\\" are not compatible",
              Array [
                "Unable to assign {value: 42} to { value: string; }",
                Array [
                  "The types of \\"value\\" are not compatible",
                  Array [
                    "Expected string, but was 42",
                  ],
                ],
              ],
            ],
            Array [
              "The types of \\"body\\" are not compatible",
              Array [
                "Unable to assign {noMyPropHere: true} to { myProp: string; }",
                Array [
                  "The types of \\"myProp\\" are not compatible",
                  Array [
                    "Expected string, but was undefined",
                  ],
                ],
              ],
            ],
          ],
          Array [
            "And unable to assign {key: {value: 42}, body: {noMyPropHere: true}} to { key: { value: number; }; body: { myProp: string; }; }",
            Array [
              "The types of \\"body\\" are not compatible",
              Array [
                "Unable to assign {noMyPropHere: true} to { myProp: string; }",
                Array [
                  "The types of \\"myProp\\" are not compatible",
                  Array [
                    "Expected string, but was undefined",
                  ],
                ],
              ],
            ],
          ],
        ],
        "message": "Expected { key: { value: string; }; body: { myProp: string; }; } | { key: { value: number; }; body: { myProp: string; }; }, but was {key: {value: 42}, body: {noMyPropHere: true}}",
        "success": false,
      }
    `);

    const InnerArray = Array(String);
    const OuterObjectWithArrayA = Object({
      key: Object({ value: String }),
      body: InnerArray,
    });
    const OuterObjectWithArrayB = Object({
      key: Object({ value: Number }),
      body: InnerArray,
    });
    expect(
      Union(OuterObjectWithArrayA, OuterObjectWithArrayB).safeParse({
        key: { value: 42 },
        body: [42],
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "fullError": Array [
          "Unable to assign {key: {value: 42}, body: [42]} to { key: { value: string; }; body: string[]; } | { key: { value: number; }; body: string[]; }",
          Array [
            "Unable to assign {key: {value: 42}, body: [42]} to { key: { value: string; }; body: string[]; }",
            Array [
              "The types of \\"key\\" are not compatible",
              Array [
                "Unable to assign {value: 42} to { value: string; }",
                Array [
                  "The types of \\"value\\" are not compatible",
                  Array [
                    "Expected string, but was 42",
                  ],
                ],
              ],
            ],
            Array [
              "The types of \\"body\\" are not compatible",
              Array [
                "Unable to assign [42] to string[]",
                Array [
                  "The types of [0] are not compatible",
                  Array [
                    "Expected string, but was 42",
                  ],
                ],
              ],
            ],
          ],
          Array [
            "And unable to assign {key: {value: 42}, body: [42]} to { key: { value: number; }; body: string[]; }",
            Array [
              "The types of \\"body\\" are not compatible",
              Array [
                "Unable to assign [42] to string[]",
                Array [
                  "The types of [0] are not compatible",
                  Array [
                    "Expected string, but was 42",
                  ],
                ],
              ],
            ],
          ],
        ],
        "message": "Expected { key: { value: string; }; body: string[]; } | { key: { value: number; }; body: string[]; }, but was {key: {value: 42}, body: [42]}",
        "success": false,
      }
    `);
  });
});
