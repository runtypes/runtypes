import { String, Number, Record } from './';

test('Runtype.validate', () => {
  expect(String.validate('hello')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "hello",
    }
  `);
  expect(String.validate(42)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected string, but was number",
      "success": false,
    }
  `);
});

test('Runtype.assert', () => {
  expect(() => String.assert('hello')).not.toThrow();
  expect(() => String.assert(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was number"`,
  );
});

test('Runtype.assert', () => {
  expect(String.assert('hello')).toBe(undefined);
  expect(() => String.assert(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was number"`,
  );
});

test('Runtype.check', () => {
  expect(String.check('hello')).toBe('hello');
  expect(() => String.check(42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was number"`,
  );
});

test('Runtype.guard', () => {
  expect(String.guard('hello')).toBe(true);
  expect(String.guard(42)).toBe(false);
});

test('Runtype.Or', () => {
  expect(String.Or(Number).guard('hello')).toBe(true);
  expect(String.Or(Number).guard(42)).toBe(true);
  expect(String.Or(Number).guard(true)).toBe(false);
});

test('Runtype.And', () => {
  expect(
    Record({ a: String })
      .And(Record({ b: Number }))
      .guard({ a: 'hello', b: 42 }),
  ).toBe(true);
  expect(
    Record({ a: String })
      .And(Record({ b: Number }))
      .guard({ a: 42, b: 42 }),
  ).toBe(false);
  expect(
    Record({ a: String })
      .And(Record({ b: Number }))
      .guard({ a: 'hello', b: 'hello' }),
  ).toBe(false);
});
