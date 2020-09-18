import { Enum } from '..';
import show from '../show';

enum NumericEnum {
  foo = 12,
  bar = 20,
}
enum StringEnum {
  Foo = 'Bar',
  Helo = 'World',
}

test('Numeric Enum', () => {
  expect(Enum('NumericEnum', NumericEnum).safeParse(12)).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": 12,
    }
  `);
  expect(Enum('NumericEnum', NumericEnum).safeParse(16)).toMatchInlineSnapshot(`
    Object {
      "message": "Expected NumericEnum, but was 16",
      "success": false,
    }
  `);
  expect(Enum('NumericEnum', NumericEnum).safeParse('bar')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected NumericEnum, but was \\"bar\\"",
      "success": false,
    }
  `);
  const typed: NumericEnum = Enum('NumericEnum', NumericEnum).parse(20);
  expect(typed).toBe(NumericEnum.bar);

  expect(show(Enum('NumericEnum', NumericEnum))).toMatchInlineSnapshot(`"NumericEnum"`);
});

test('String Enum', () => {
  expect(Enum('StringEnum', StringEnum).safeParse('World')).toMatchInlineSnapshot(`
    Object {
      "success": true,
      "value": "World",
    }
  `);
  expect(Enum('StringEnum', StringEnum).safeParse('Hello')).toMatchInlineSnapshot(`
    Object {
      "message": "Expected StringEnum, but was \\"Hello\\"",
      "success": false,
    }
  `);
  const typed: StringEnum = Enum('StringEnum', StringEnum).parse('Bar');
  expect(typed).toBe(StringEnum.Foo);
});
