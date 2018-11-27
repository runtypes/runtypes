import { check, checked, String } from '.';

describe('Decorators', () => {
  describe('@checked', () => {
    describe('parameter length', () => {
      it('works', () => {
        expect(() => {
          class Class {
            @checked(String)
            static method(s: string) {
              return s;
            }
          }
          return Class;
        }).not.toThrow();
        expect(() => {
          class Class {
            @checked(String, String)
            static method(s: string) {
              return s;
            }
          }
          return Class;
        }).toThrow();
        expect(() => {
          class Class {
            @checked()
            static method(s: string) {
              return s;
            }
          }
          return Class;
        }).toThrow();
        expect(() => {
          class Class {
            @checked(String, String)
            static method(s: string = 'initial', t: string = 'initial') {
              return { s, t };
            }
          }
          return Class;
        }).not.toThrow();
      });
    });
    describe('parameter check', () => {
      it('works', () => {
        class Class {
          @checked(String)
          static method1(s: string) {
            return s;
          }
          @checked(String.withConstraint(s => /^world$/.test(s)))
          static method2(s: string) {
            return s;
          }
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
          class Class {
            @checked(String)
            static method(@check s: string) {
              return s;
            }
          }
          return Class;
        }).not.toThrow();
        expect(() => {
          class Class {
            @checked(String, String)
            static method(@check s: string, t: string) {
              return { s, t };
            }
          }
          return Class;
        }).toThrow();
        expect(() => {
          class Class {
            @checked(String)
            static method(@check s: string, t: string) {
              return { s, t };
            }
          }
          return Class;
        }).not.toThrow();
      });
    });
    describe('parameter check', () => {
      it('works', () => {
        class Class {
          @checked(String)
          static method1(@check s: string) {
            return s;
          }
          @checked(String.withConstraint(s => /^world$/.test(s)))
          static method2(s: string, @check t: string) {
            return { s, t };
          }
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
  describe('return value', () => {
    it('works', () => {
      class Class {
        @checked(String)
        static method1(s: string) {
          return s;
        }
        @checked(String.withConstraint(s => /^world$/.test(s)))
        static method2(s: string, @check t: string) {
          return { s, t };
        }
      }
      expect(Class.method1('hello')).toBe('hello');
      expect(Class.method2('hello', 'world')).toEqual({ s: 'hello', t: 'world' });
    });
  });
});
