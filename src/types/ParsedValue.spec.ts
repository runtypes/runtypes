import { String, Number, ParsedValue } from '..';

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
});

test('DoubledNumber - 2', () => {
  const DoubledNumber = Number.withParser({
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
});
