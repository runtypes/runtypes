import { Intersect, ParsedValue, Record, String, Tuple, Unknown } from '..';

// This is a super odd/unhelpful type that just JSON.stringify's whatever you
// attempt to parse
const ConvertIntoJSON = Unknown.withParser({
  name: 'ConvertIntoJSON',
  parse(value) {
    return { success: true, value: JSON.stringify(value) };
  },
});

test('Intersect can handle object keys being converted', () => {
  const URLString = ParsedValue(String, {
    name: 'URLString',
    parse(value) {
      try {
        return { success: true, value: new URL(value) };
      } catch (ex) {
        return { success: false, message: `Expected a valid URL but got '${value}'` };
      }
    },
  });
  const NameRecord = Record({ name: String });
  const UrlRecord = Record({ url: URLString });
  const NamedURL = Intersect(NameRecord, UrlRecord);

  expect(NamedURL.safeParse({ name: 'example', url: 'http://example.com/foo/../' }))
    .toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Object {
        "name": "example",
        "url": "http://example.com/",
      },
    }
  `);

  expect(NamedURL.safeParse({ name: 'example', url: 'not a url' })).toMatchInlineSnapshot(`
    Object {
      "key": "url",
      "message": "Expected a valid URL but got 'not a url'",
      "success": false,
    }
  `);

  expect(
    Intersect(NamedURL, ConvertIntoJSON).safeParse({
      name: 'example',
      url: 'http://example.com/foo/../',
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "message": "The validator ConvertIntoJSON attempted to convert the type of this value from an object to something else. That conversion is not valid as the child of an intersect",
      "success": false,
    }
  `);
});

test('Intersect can handle tuple entries being converted', () => {
  const URLString = ParsedValue(String, {
    name: 'URLString',
    parse(value) {
      try {
        return { success: true, value: new URL(value) };
      } catch (ex) {
        return { success: false, message: `Expected a valid URL but got '${value}'` };
      }
    },
  });
  const NameRecord = Tuple(String, Unknown);
  const UrlRecord = Tuple(Unknown, URLString);
  const NamedURL = Intersect(NameRecord, UrlRecord);
  expect(NamedURL.safeParse(['example', 'http://example.com/foo/../'])).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": Array [
        "example",
        "http://example.com/",
      ],
    }
  `);
  expect(NamedURL.safeParse(['example', 'not a url'])).toMatchInlineSnapshot(`
    Object {
      "key": "[1]",
      "message": "Expected a valid URL but got 'not a url'",
      "success": false,
    }
  `);

  expect(Intersect(NamedURL, ConvertIntoJSON).safeParse(['example', 'http://example.com/foo/../']))
    .toMatchInlineSnapshot(`
    Object {
      "message": "The validator ConvertIntoJSON attempted to convert the type of this value from an array to something else. That conversion is not valid as the child of an intersect",
      "success": false,
    }
  `);
});

test('Intersect can handle String + Brand', () => {
  expect(Intersect(String, Unknown.withBrand('my_brand')).safeParse('hello world'))
    .toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "hello world",
    }
  `);
  expect(Intersect(String, Unknown.withBrand('my_brand')).safeParse(42)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected string, but was number",
      "success": false,
    }
  `);
});
