import * as ta from 'type-assertions';
import { Dictionary, Literal, Object } from '..';

const recordType = Object({ value: Literal(42) });
const record = { value: 42 };

test('StringRecord', () => {
  const dictionary = Dictionary(recordType);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in string]?: { value: 42 } }>
  >();
  expect(dictionary.safeParse({ foo: record, bar: record })).toMatchInlineSnapshot(`
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
  expect(dictionary.safeParse({ foo: record, bar: { value: 24 } })).toMatchInlineSnapshot(`
    Object {
      "key": "bar.value",
      "message": "Expected literal '42', but was '24'",
      "success": false,
    }
  `);
});

test('NumberRecord', () => {
  const dictionary = Dictionary(recordType, 'number');
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['check']>, { [key in number]?: { value: 42 } }>
  >();
  expect(dictionary.safeParse({ 4: record, 3.14: record })).toMatchInlineSnapshot(`
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
  expect(dictionary.safeParse({ foo: record, bar: record })).toMatchInlineSnapshot(`
    Object {
      "message": "Expected record key to be a number, but was 'foo'",
      "success": false,
    }
  `);
});
