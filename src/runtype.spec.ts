import { String, Number, Object } from './';

test('Runtype.safeParse', () => {
  expect(String.safeParse('hello')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "hello",
    }
  `);
  expect(String.safeParse(42)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected string, but was 42",
      "success": false,
    }
  `);
});

test('Runtype.assert', () => {
  expect(() => String.assert('hello')).not.toThrow();
  expect(() => String.assert(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was 42"`,
  );
  expect(() => Object({ value: String }).assert({ value: 42 })).toThrowErrorMatchingInlineSnapshot(`
"Unable to assign {value: 42} to { value: string; }
  The types of \\"value\\" are not compatible
    Expected string, but was 42"
`);
});

test('Runtype.assert', () => {
  expect(String.assert('hello')).toBe(undefined);
  expect(() => String.assert(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was 42"`,
  );
});

test('Runtype.check', () => {
  expect(String.parse('hello')).toBe('hello');
  expect(() => String.parse(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was 42"`,
  );
});

test('Runtype.test', () => {
  expect(String.test('hello')).toBe(true);
  expect(String.test(42)).toBe(false);
});

test('Runtype.Or', () => {
  expect(String.Or(Number).test('hello')).toBe(true);
  expect(String.Or(Number).test(42)).toBe(true);
  expect(String.Or(Number).test(true)).toBe(false);
});

test('Runtype.And', () => {
  expect(
    Object({ a: String })
      .And(Object({ b: Number }))
      .test({ a: 'hello', b: 42 }),
  ).toBe(true);
  expect(
    Object({ a: String })
      .And(Object({ b: Number }))
      .test({ a: 42, b: 42 }),
  ).toBe(false);
  expect(
    Object({ a: String })
      .And(Object({ b: Number }))
      .test({ a: 'hello', b: 'hello' }),
  ).toBe(false);
});
