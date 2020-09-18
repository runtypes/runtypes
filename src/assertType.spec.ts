import { String, assertType } from './';

test('assertType', async () => {
  const x = 'hello' as unknown;
  // @ts-expect-error
  expectString(x);
  assertType(String, x);
  expectString(x);

  expect(() => assertType(String, 42)).toThrowErrorMatchingInlineSnapshot(
    `"Expected string, but was 42"`,
  );
});

// this helper is just to check that the type inference works
function expectString(value: string) {
  return value;
}
