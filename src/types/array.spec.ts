import * as ta from 'type-assertions';
import { Array, ReadonlyArray, Literal, Record } from '..';

const recordType = Record({ value: Literal(42) });
const record = { value: 42 };

test('Array', () => {
  const dictionary = Array(recordType);
  ta.assert<ta.Equal<ReturnType<typeof dictionary['check']>, { value: 42 }[]>>();
  expect(dictionary.validate([record, record, record])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
      ],
    }
  `);
  expect(dictionary.validate([record, 10, record])).toMatchInlineSnapshot(`
    Object {
      "key": "[1]",
      "message": "Expected { value: 42; }, but was number",
      "success": false,
    }
  `);
});

test('Array.asReadonly', () => {
  const dictionary = Array(recordType).asReadonly();
  ta.assert<ta.Equal<ReturnType<typeof dictionary['check']>, readonly { value: 42 }[]>>();
  expect(dictionary.validate([record, record, record])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
      ],
    }
  `);
  expect(dictionary.validate([record, 10, record])).toMatchInlineSnapshot(`
    Object {
      "key": "[1]",
      "message": "Expected { value: 42; }, but was number",
      "success": false,
    }
  `);
});

test('ReadonlyArray', () => {
  const dictionary = ReadonlyArray(recordType);
  ta.assert<ta.Equal<ReturnType<typeof dictionary['check']>, readonly { value: 42 }[]>>();
  expect(dictionary.validate([record, record, record])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
        Object {
          "value": 42,
        },
      ],
    }
  `);
  expect(dictionary.validate([record, 10, record])).toMatchInlineSnapshot(`
    Object {
      "key": "[1]",
      "message": "Expected { value: 42; }, but was number",
      "success": false,
    }
  `);
});
