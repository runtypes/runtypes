import * as ta from 'type-assertions';
import * as ft from '..';

test('Mutable(Record)', () => {
  const dictionary = ft.ReadonlyRecord(ft.String, ft.Number);
  ta.assert<
    ta.Equal<ReturnType<typeof dictionary['parse']>, { readonly [key in string]?: number }>
  >();
  const rDictionary = ft.Mutable(dictionary);
  ta.assert<ta.Equal<ReturnType<typeof rDictionary['parse']>, { [key in string]?: number }>>();
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

test('Mutable(Object)', () => {
  const obj = ft.ReadonlyObject({ whatever: ft.Number });
  expect(obj.isReadonly).toBe(true);
  ta.assert<ta.Equal<ReturnType<typeof obj['parse']>, { readonly whatever: number }>>();
  const rObj = ft.Mutable(obj);
  expect(rObj.isReadonly).toBe(false);
  ta.assert<ta.Equal<ReturnType<typeof rObj['parse']>, { whatever: number }>>();
  expect(rObj.safeParse({ whatever: 2 })).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "whatever": 2,
      },
    }
  `);
  expect(obj.asPartial().isReadonly).toBe(true);
  expect(rObj.asPartial().isReadonly).toBe(false);
});

test('Mutable(Tuple)', () => {
  const tuple = ft.ReadonlyTuple(ft.Number, ft.String);
  ta.assert<ta.Equal<ReturnType<typeof tuple['parse']>, readonly [number, string]>>();
  const rTuple = ft.Mutable(tuple);
  ta.assert<ta.Equal<ReturnType<typeof rTuple['parse']>, [number, string]>>();
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

test('Mutable(Array)', () => {
  const array = ft.ReadonlyArray(ft.Number);
  ta.assert<ta.Equal<ReturnType<typeof array['parse']>, readonly number[]>>();
  const rArray = ft.Mutable(array);
  ta.assert<ta.Equal<ReturnType<typeof rArray['parse']>, number[]>>();
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
