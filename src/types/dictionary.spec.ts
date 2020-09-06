import * as ta from 'type-assertions';
import { Dictionary, String, Number, Literal, Union, Record } from '..';

const recordType = Record({ value: Literal(42) });
const record = { value: 42 };

test('StringDictionary', () => {
  const dictionary = Dictionary(String, recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in string]?: { value: 42 } }>
  >();
  expect(dictionary.validate({ foo: record, bar: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "bar": Object {
          "value": 42,
        },
        "foo": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ foo: record, bar: { value: 24 } })).toMatchInlineSnapshot(`
    Object {
      "key": "bar.value",
      "message": "Expected literal '42', but was '24'",
      "success": false,
    }
  `);
});

test('NumberDictionary', () => {
  const dictionary = Dictionary(Number, recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in number]?: { value: 42 } }>
  >();
  expect(dictionary.validate({ 4: record, 3.14: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "3.14": Object {
          "value": 42,
        },
        "4": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ foo: record, bar: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected dictionary key to be a number, but was 'foo'",
      "success": false,
    }
  `);
});

test('IntegerDictionary', () => {
  const dictionary = Dictionary(
    Number.withConstraint(v => v === Math.floor(v), { name: 'Integer' }),
    recordType,
  );
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in number]?: { value: 42 } }>
  >();
  expect(dictionary.validate({ 4: record, 2: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "2": Object {
          "value": 42,
        },
        "4": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ 4: record, 3.14: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected dictionary key to be Integer, but was '3.14'",
      "success": false,
    }
  `);
});

test('UnionDictionary - strings', () => {
  const dictionary = Dictionary(Union(Literal('foo'), Literal('bar')), recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in 'foo' | 'bar']?: { value: 42 } }>
  >();
  expect(dictionary.validate({ foo: record, bar: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "bar": Object {
          "value": 42,
        },
        "foo": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ 10: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected dictionary key to be \\"foo\\" | \\"bar\\", but was '10'",
      "success": false,
    }
  `);
});
test('UnionDictionary - numbers', () => {
  const dictionary = Dictionary(Union(Literal(24), Literal(42)), recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in 24 | 42]?: { value: 42 } }>
  >();
  expect(dictionary.validate({ 24: record, 42: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "24": Object {
          "value": 42,
        },
        "42": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ 10: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected dictionary key to be 24 | 42, but was '10'",
      "success": false,
    }
  `);
});
test('UnionDictionary - mixed', () => {
  const dictionary = Dictionary(Union(Literal('foo'), Literal(42)), recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in 'foo' | 42]?: { value: 42 } }>
  >();
  expect(dictionary.validate({ foo: record, 42: record })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "42": Object {
          "value": 42,
        },
        "foo": Object {
          "value": 42,
        },
      },
    }
  `);
  expect(dictionary.validate({ foo: record, bar: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected dictionary key to be \\"foo\\" | 42, but was 'bar'",
      "success": false,
    }
  `);
});
