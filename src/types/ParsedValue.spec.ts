import * as ta from 'type-assertions';
import { String, Number, ParsedValue, Static, Literal, Record, Union } from '..';

test('TrimmedString', () => {
  const TrimmedString = ParsedValue(String, {
    name: 'TrimmedString',
    parse(value) {
      return { success: true, value: value.trim() };
    },
    test: String.withConstraint(
      value =>
        value.trim() === value || `Expected the string to be trimmed, but this one has whitespace`,
    ),
  });

  expect(TrimmedString.validate(' foo bar ')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "foo bar",
    }
  `);

  expect(() => TrimmedString.assert(' foo bar ')).toThrowErrorMatchingInlineSnapshot(
    `"Expected the string to be trimmed, but this one has whitespace"`,
  );
  expect(() => TrimmedString.assert('foo bar')).not.toThrow();
});

test('DoubledNumber', () => {
  const DoubledNumber = ParsedValue(Number, {
    name: 'DoubledNumber',
    parse(value) {
      return { success: true, value: value * 2 };
    },
    test: Number.withConstraint(value => value % 2 === 0 || `Expected an even number`),
  });

  expect(DoubledNumber.validate(10)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 20,
    }
  `);

  expect(() => DoubledNumber.assert(11)).toThrowErrorMatchingInlineSnapshot(
    `"Expected an even number"`,
  );
  expect(() => DoubledNumber.assert(12)).not.toThrow();

  expect(DoubledNumber.serialize(10)).toMatchInlineSnapshot(`
    Object {
      "message": "DoubledNumber does not support Runtype.serialize",
      "success": false,
    }
  `);
});

test('DoubledNumber - 2', () => {
  const DoubledNumber = Number.withParser({
    name: 'DoubledNumber',
    parse(value) {
      return { success: true, value: value * 2 };
    },
    test: Number.withConstraint(value => value % 2 === 0 || `Expected an even number`),
    serialize(value) {
      return { success: true, value: value / 2 };
    },
  });

  expect(DoubledNumber.validate(10)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 20,
    }
  `);

  expect(() => DoubledNumber.assert(11)).toThrowErrorMatchingInlineSnapshot(
    `"Expected an even number"`,
  );
  expect(() => DoubledNumber.assert(12)).not.toThrow();

  expect(DoubledNumber.serialize(10)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 5,
    }
  `);

  expect(DoubledNumber.serialize(11)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected an even number",
      "success": false,
    }
  `);
});

test('Upgrade Example', () => {
  const ShapeV1 = Record({ version: Literal(1), size: Number });
  const ShapeV2 = Record({ version: Literal(2), width: Number, height: Number });
  const Shape = Union(
    ShapeV1.withParser({
      parse: ({ size }) => ({
        success: true,
        value: { version: 2 as const, width: size, height: size },
      }),
    }),
    ShapeV2,
  );
  type X = Static<typeof Shape>;
  ta.assert<ta.Equal<X, { version: 2; width: number; height: number }>>();
  expect(Shape.check({ version: 1, size: 42 })).toEqual({ version: 2, width: 42, height: 42 });
  expect(Shape.check({ version: 2, width: 10, height: 20 })).toEqual({
    version: 2,
    width: 10,
    height: 20,
  });
  expect(Shape.serialize({ version: 2, width: 10, height: 20 })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "height": 20,
        "version": 2,
        "width": 10,
      },
    }
  `);
  expect(Shape.serialize({ version: 1, size: 20 } as any)).toMatchInlineSnapshot(`
    Object {
      "key": "<version: 1>",
      "message": "ParsedValue<{ version: 1; size: number; }> does not support Runtype.serialize",
      "success": false,
    }
  `);
});
