import { check, checked, String, Number, Array, Void } from '.';

describe('Decorators', () => {
  describe('@checked', () => {
    describe('parameter length', () => {
      it('works', () => {
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String)
            static method(s: string) {}
          }
        }).not.toThrow();
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String, String)
            static method(s: string) {}
          }
        }).toThrow();
        expect(() => {
          // @ts-ignore
          class Class {
            @checked()
            static method(s: string) {}
          }
        }).toThrow();
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String, String)
            static method(s: string = 'initial', t: string = 'initial') {}
          }
        }).not.toThrow();
      });
    });
    describe('parameter check', () => {
      it('works', () => {
        class Class {
          @checked(String)
          static method1(s: string) {}
          @checked(String.withConstraint(s => /^world$/.test(s)))
          static method2(s: string) {}
        }
        expect(() => {
          Class.method1('hello');
        }).not.toThrow();
        expect(() => {
          Class.method2('hello');
        }).toThrow(/Failed constraint check/);
        expect(() => {
          Class.method2('world');
        }).not.toThrow();
      });
    });
  });
  describe('@check', () => {
    describe('parameter length', () => {
      it('works', () => {
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String)
            static method(@check s: string) {}
          }
        }).not.toThrow();
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String, String)
            static method(@check s: string, t: string) {}
          }
        }).toThrow();
        expect(() => {
          // @ts-ignore
          class Class {
            @checked(String)
            static method(@check s: string, t: string) {}
          }
        }).not.toThrow();
      });
    });
    describe('parameter check', () => {
      it('works', () => {
        class Class {
          @checked(String)
          static method1(@check s: string) {}
          @checked(String.withConstraint(s => /^world$/.test(s)))
          static method2(s: string, @check t: string) {}
        }
        expect(() => {
          Class.method1('hello');
        }).not.toThrow();
        expect(() => {
          Class.method2('world', 'hello');
        }).toThrow(/Failed constraint check/);
        expect(() => {
          Class.method2('hello', 'world');
        }).not.toThrow();
      });
    });
  });
});
