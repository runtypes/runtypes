import { Boolean } from '..';

test('Boolean with string literal', () => {
  expect(Boolean.safeParse('true')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected boolean, but was \\"true\\" (i.e. a string literal)",
      "success": false,
    }
  `);
});
