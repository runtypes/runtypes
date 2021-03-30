import * as ta from 'type-assertions';
import * as ft from '..';

test('Readonly(Record)', () => {
  const dictionary = ft.Record(ft.String, ft.Number);
  ta.assert<ta.Equal<ReturnType<typeof dictionary['parse']>, { [key in string]?: number }>>();
  const rDictionary = ft.Readonly(dictionary);
  ta.assert<
    ta.Equal<ReturnType<typeof rDictionary['parse']>, { readonly [key in string]?: number }>
  >();
  expect(rDictionary.safeParse({ foo: 1, bar: 2 })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "bar": 2,
        "foo": 1,
      },
    }
  `);
});

test('Readonly(Object)', () => {
  const obj = ft.Object({ whatever: ft.Number });
  ta.assert<ta.Equal<ReturnType<typeof obj['parse']>, { whatever: number }>>();
  const rObj = ft.Readonly(obj);
  ta.assert<ta.Equal<ReturnType<typeof rObj['parse']>, { readonly whatever: number }>>();
  expect(rObj.safeParse({ whatever: 2 })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "whatever": 2,
      },
    }
  `);
});

test('Readonly(Tuple)', () => {
  const tuple = ft.Tuple(ft.Number, ft.String);
  ta.assert<ta.Equal<ReturnType<typeof tuple['parse']>, [number, string]>>();
  const rTuple = ft.Readonly(tuple);
  ta.assert<ta.Equal<ReturnType<typeof rTuple['parse']>, readonly [number, string]>>();
  expect(rTuple.safeParse([10, `world`])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        10,
        "world",
      ],
    }
  `);
});

test('Readonly(Array)', () => {
  const array = ft.Array(ft.Number);
  ta.assert<ta.Equal<ReturnType<typeof array['parse']>, number[]>>();
  const rArray = ft.Readonly(array);
  ta.assert<ta.Equal<ReturnType<typeof rArray['parse']>, readonly number[]>>();
  expect(rArray.safeParse([10, 3])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        10,
        3,
      ],
    }
  `);
});
