import { Static, Literal, Template, Union } from '..';

describe('template', () => {
  it('validates', () => {
    const Owner = Union(Literal('Bob'), Literal('Jeff'));
    const Dog = Template`${Owner}'s dog`;
    type Dog = Static<typeof Dog>;
    // @ts-expect-error: These may be fixed in future versions of TS
    const dogBob: Dog = "Bob's dog";
    expect(Dog.guard(dogBob)).toBe(true);
    // @ts-expect-error
    const catBob: Dog = "Bob's cat";
    expect(Dog.guard(catBob)).toBe(false);
    // @ts-expect-error
    const dogJeff: Dog = "Jeff's dog";
    expect(Dog.guard(dogJeff)).toBe(true);
    // @ts-expect-error
    const dogAlice: Dog = "Alice's cat";
    expect(Dog.guard(dogAlice)).toBe(false);
  });
  it('invalidates with correct error messages', () => {
    const Owner = Union(Literal('Bob'), Literal('Jeff'));
    const Dog = Template(['', "'s dog"] as const, Owner);
    type Dog = Static<typeof Dog>;
    // @ts-expect-error
    const catBob: Dog = "Bob's cat";
    expect(Dog.validate(catBob)).toEqual({
      code: 'VALUE_INCORRECT',
      message: 'Expected string `${"Bob" | "Jeff"}\'s dog`, but was `Bob\'s cat`',
      success: false,
    });
    // @ts-expect-error
    const dogAlice: Dog = "Alice's cat";
    expect(() => Dog.check(dogAlice)).toThrow(
      'Expected string `${"Bob" | "Jeff"}\'s dog`, but was `Alice\'s cat`',
    );
  });
  it('supports convenient arguments form', () => {
    const Owner = Union(Literal('Bob'), Literal('Jeff'));
    const Dog = Template(Owner, "'s dog");
    type Dog = Static<typeof Dog>;
    const catBob: Dog = "Bob's dog";
    expect(() => Dog.check(catBob)).not.toThrow();
  });
  it('emits TYPE_INCORRECT for values other than string', () => {
    const Dog = Template('foo');
    expect(Dog.validate(42)).toEqual({
      code: 'TYPE_INCORRECT',
      message: 'Expected string "foo", but was number',
      success: false,
    });
  });
});
