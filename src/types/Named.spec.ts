import { Literal, Null, Named, Union, Number, Object } from '..';

it('should make unions easier to understand', () => {
  const Square = Named(`Square`, Object({ shape: Literal(`Square`), size: Number }));
  const Rectangle = Named(
    `Rectangle`,
    Object({ shape: Literal(`Rectangle`), width: Number, height: Number }),
  );
  const Circle = Named(`Circle`, Object({ shape: Literal(`Circle`), radius: Number }));

  const Shape = Union(Square, Rectangle, Circle, Null);

  expect(Shape.safeParse({ shape: `Rectangle`, size: new Date() })).toMatchInlineSnapshot(`
    Object {
      "fullError": Array [
        "Unable to assign {shape: \\"Rectangle\\", size: {}} to Square | Rectangle | Circle | null",
        Array [
          "Unable to assign {shape: \\"Rectangle\\", size: {}} to null",
          Array [
            "Expected literal null, but was {shape: \\"Rectangle\\", size: {}}",
          ],
        ],
        Array [
          "And unable to assign {shape: \\"Rectangle\\", size: {}} to Square | Rectangle | Circle",
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
      "message": "Expected Square | Rectangle | Circle | null, but was {shape: \\"Rectangle\\", size: {}}",
      "success": false,
    }
  `);
  expect(Shape.parse(null)).toEqual(null);
  expect(Shape.parse({ shape: `Square`, size: 42 })).toEqual({ shape: `Square`, size: 42 });

  const Shape2 = Union(Union(Square, Rectangle, Circle), Null);
  expect(Shape2.safeParse({ shape: `Rectangle`, size: new Date() })).toMatchInlineSnapshot(`
    Object {
      "fullError": Array [
        "Unable to assign {shape: \\"Rectangle\\", size: {}} to Square | Rectangle | Circle | null",
        Array [
          "Unable to assign {shape: \\"Rectangle\\", size: {}} to null",
          Array [
            "Expected literal null, but was {shape: \\"Rectangle\\", size: {}}",
          ],
        ],
        Array [
          "And unable to assign {shape: \\"Rectangle\\", size: {}} to Square | Rectangle | Circle",
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
      "message": "Expected Square | Rectangle | Circle | null, but was {shape: \\"Rectangle\\", size: {}}",
      "success": false,
    }
  `);
  expect(Shape2.parse(null)).toEqual(null);
  expect(Shape2.parse({ shape: `Square`, size: 42 })).toEqual({ shape: `Square`, size: 42 });
});
