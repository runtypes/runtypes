import { KeyOf } from '..';
import show from '../show';

const StringObjectKeys = {
  foo: 1,
  bar: 2,
};

const NumbericObjectKeys = {
  2: 1,
  4: '2',
};

const MixedObjectKeys = {
  foo: 'bar',
  5: 1,
  '4': 3,
};

test('Numeric Object Keys', () => {
  expect(KeyOf(NumbericObjectKeys).safeParse(2)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 2,
    }
  `);
  expect(KeyOf(NumbericObjectKeys).safeParse('2')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "2",
    }
  `);
  expect(KeyOf(NumbericObjectKeys).safeParse('foobar')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected \\"2\\" | \\"4\\", but was \\"foobar\\"",
      "success": false,
    }
  `);
  expect(KeyOf(NumbericObjectKeys).safeParse('5')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected \\"2\\" | \\"4\\", but was \\"5\\"",
      "success": false,
    }
  `);
  const typed: keyof typeof NumbericObjectKeys = KeyOf(NumbericObjectKeys).parse(2);

  expect(typed).toBe(2);

  expect(show(KeyOf(NumbericObjectKeys))).toMatchInlineSnapshot(`"\\"2\\" | \\"4\\""`);
});

test('String Object Keys', () => {
  expect(KeyOf(StringObjectKeys).safeParse('foo')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "foo",
    }
  `);
  expect(KeyOf(StringObjectKeys).safeParse(55)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected \\"bar\\" | \\"foo\\", but was 55",
      "success": false,
    }
  `);
  const typed: keyof typeof StringObjectKeys = KeyOf(StringObjectKeys).parse('bar');

  expect(typed).toBe('bar');

  expect(show(KeyOf(StringObjectKeys))).toMatchInlineSnapshot(`"\\"bar\\" | \\"foo\\""`);
});

test('Mixed Object Keys', () => {
  expect(KeyOf(MixedObjectKeys).safeParse('foo')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "foo",
    }
  `);
  expect(KeyOf(MixedObjectKeys).safeParse(5)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 5,
    }
  `);
  expect(KeyOf(MixedObjectKeys).safeParse('foobar')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected \\"4\\" | \\"5\\" | \\"foo\\", but was \\"foobar\\"",
      "success": false,
    }
  `);
  expect(KeyOf(MixedObjectKeys).safeParse(4)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 4,
    }
  `);
  const stringNumber: keyof typeof MixedObjectKeys = KeyOf(MixedObjectKeys).parse('4');
  expect(stringNumber).toBe('4');

  const number: keyof typeof MixedObjectKeys = KeyOf(MixedObjectKeys).parse(5);
  expect(number).toBe(5);

  expect(show(KeyOf(MixedObjectKeys))).toMatchInlineSnapshot(`"\\"4\\" | \\"5\\" | \\"foo\\""`);
});
