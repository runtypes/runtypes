import {
  Array,
  Boolean,
  Brand,
  Constraint,
  Contract,
  Record,
  Function,
  Guard,
  InstanceOf,
  Intersect,
  Lazy,
  Literal,
  Never,
  Null,
  Number,
  Partial as RTPartial,
  ReadonlyArray,
  Object as ObjectType,
  Runtype,
  Static,
  String,
  Symbol as Sym,
  Tuple,
  Undefined,
  Union,
  Unknown,
} from './index';

import { Constructor } from './types/instanceof';
import { ValidationError } from './errors';

const boolTuple = Tuple(Boolean, Boolean, Boolean);
const object1 = ObjectType({ Boolean, Number });
const union1 = Union(Literal(3), String, boolTuple, object1);

type Person = { name: string; likes: Person[] };
const Person: Runtype<Person> = Lazy(() => ObjectType({ name: String, likes: Array(Person) }));
const narcissist: Person = { name: 'Narcissus', likes: [] };
narcissist.likes = [narcissist];

type GraphNode = GraphNode[]; // graph nodes are just arrays of their neighbors
const GraphNode: Runtype<GraphNode> = Lazy(() => Array(GraphNode));
type Graph = GraphNode[];
const Graph: Runtype<Graph> = Array(GraphNode);
const nodeA: GraphNode = [];
const nodeB: GraphNode = [nodeA];
nodeA.push(nodeB);
const barbell: Graph = [nodeA, nodeB];

type BarbellBall = [BarbellBall];
const BarbellBall: Runtype<BarbellBall> = Lazy(() => Tuple(BarbellBall));

type SRDict = { [_ in string]?: SRDict };
const SRDict: Runtype<SRDict> = Lazy(() => Record(String, SRDict));
const srDict: SRDict = {};
srDict['self'] = srDict;

type Hand = { left: Hand } | { right: Hand };
const Hand: Runtype<Hand> = Lazy(() =>
  Union(ObjectType({ left: Hand }), ObjectType({ right: Hand })),
);
const leftHand: Hand = { left: (null as any) as Hand };
const rightHand: Hand = { right: leftHand };
leftHand.left = rightHand;

type Ambi = { left: Ambi } & { right: Ambi };
const Ambi: Runtype<Ambi> = Lazy(() =>
  Intersect(ObjectType({ left: Ambi }), ObjectType({ right: Ambi })),
);
const ambi: Ambi = { left: (null as any) as Ambi, right: (null as any) as Ambi };
ambi.left = ambi;
ambi.right = ambi;

type PartialPerson = { likes?: PartialPerson } & { firstName: string };
const PartialPerson: Runtype<PartialPerson> = Lazy(() =>
  RTPartial({ firstName: String, likes: PartialPerson }).And(
    Guard<{ firstName: string }>(
      (p: any): p is { firstName: string } => p.firstName && typeof p.firstName === 'string',
    ),
  ),
);
const partialNarcissus: PartialPerson = { firstName: 'Narcissish' };
partialNarcissus.likes = partialNarcissus;

class SomeClass {
  constructor(public n: number) {}
}
class SomeOtherClass {
  constructor(public n: number) {}
}
const SOMECLASS_TAG = 'I am a SomeClass instance (any version)';
class SomeClassV1 {
  constructor(public n: number) {}
  public _someClassTag = SOMECLASS_TAG;
  public static isSomeClass = (o: any): o is SomeClassV1 =>
    o !== null && typeof o === 'object' && o._someClassTag === SOMECLASS_TAG;
}
class SomeClassV2 {
  constructor(public n: number) {}
  public _someClassTag = SOMECLASS_TAG;
  public static isSomeClass = (o: any): o is SomeClassV2 =>
    o !== null && typeof o === 'object' && o._someClassTag === SOMECLASS_TAG;
}

const runtypes: { [key: string]: Runtype<unknown> } = {
  Unknown,
  Never,
  Undefined,
  Null,
  Empty: ObjectType({}),
  Boolean,
  true: Literal(true),
  false: Literal(false),
  Number,
  3: Literal(3),
  42: Literal(42),
  brandedNumber: Number.withBrand('number'),
  String,
  'hello world': Literal('hello world'),
  Sym,
  symbolArray: Array(Sym),
  boolArray: Array(Boolean),
  boolTuple,
  object1,
  union1,
  Partial: RTPartial({ foo: String }).And(ObjectType({ Boolean })),
  Function,
  Person,
  MoreThanThree: Number.withConstraint(n => n > 3),
  MoreThanThreeWithMessage: Number.withConstraint(n => n > 3 || `${n} is not greater than 3`),
  ArrayString: Array(String),
  ArrayNumber: Array(Number),
  ArrayPerson: Array(Person),
  CustomArray: Array(Number).withConstraint(x => x.length > 3, { args: { tag: 'length', min: 3 } }),
  CustomArrayWithMessage: Array(Number).withConstraint(
    x => x.length > 3 || `Length array is not greater 3`,
    { args: { tag: 'length', min: 3 } },
  ),
  Record: Record(String, String),
  NumberRecord: Record(Number, String),
  RecordOfArrays: Record(String, Array(Boolean)),
  InstanceOfSomeClass: InstanceOf(SomeClass),
  InstanceOfSomeOtherClass: InstanceOf(SomeOtherClass),
  CustomGuardConstraint: Unknown.withGuard(SomeClassV2.isSomeClass),
  CustomGuardType: Guard(SomeClassV2.isSomeClass),
  ChangeType: Unknown.withConstraint<SomeClass>(SomeClassV2.isSomeClass),
  ChangeTypeAndName: Unknown.withConstraint<SomeClass>(
    (o: any) => o !== null && typeof o === 'object' && o._someClassTag === SOMECLASS_TAG,
    {
      name: 'SomeClass',
    },
  ),
  GuardChangeTypeAndName: Guard(
    (o: any): o is SomeClass =>
      o !== null && typeof o === 'object' && o._someClassTag === SOMECLASS_TAG,
    {
      name: 'SomeClass',
    },
  ),
  RecordOfArraysOfSomeClass: Record(String, Array(InstanceOf(SomeClass))),
  OptionalKey: ObjectType({ foo: String, bar: Union(Number, Undefined) }),
  ReadonlyNumberArray: Array(Number).asReadonly(),
  ReadonlyRecord: ObjectType({ foo: Number, bar: String }).asReadonly(),
  Graph,
  SRDict,
  Hand,
  Ambi,
  BarbellBall,
  PartialPerson,
  ReadonlyPartial: ObjectType({ foo: Number })
    .asReadonly()
    .And(RTPartial({ bar: String }).asReadonly()),
  EmptyTuple: Tuple(),
};

type RuntypeName = keyof typeof runtypes;

const runtypeNames = Object.keys(runtypes) as RuntypeName[];

class Foo {
  x!: 'blah';
} // Should not be recognized as a Record

const testValues: { value: unknown; passes: RuntypeName[] }[] = [
  { value: undefined, passes: ['Undefined', 'Void'] },
  { value: null, passes: ['Null', 'Void'] },
  { value: true, passes: ['Boolean', 'true'] },
  { value: false, passes: ['Boolean', 'false'] },
  { value: 3, passes: ['Number', 'brandedNumber', 3, 'union1'] },
  {
    value: 42,
    passes: ['Number', 'brandedNumber', 42, 'MoreThanThree', 'MoreThanThreeWithMessage'],
  },
  { value: 'hello world', passes: ['String', 'hello world', 'union1'] },
  { value: [Symbol('0'), Symbol(42), Symbol()], passes: ['symbolArray'] },
  { value: Symbol.for('runtypes'), passes: ['Sym'] },
  { value: [true, false, true], passes: ['boolArray', 'boolTuple', 'union1'] },
  { value: { Boolean: true, Number: 3 }, passes: ['object1', 'union1', 'Partial', 'Empty'] },
  { value: { Boolean: true }, passes: ['Partial', 'Empty'] },
  { value: { Boolean: true, foo: undefined }, passes: ['Partial', 'Empty'] },
  { value: { Boolean: true, foo: 'hello' }, passes: ['Partial', 'OptionalKey', 'Empty'] },
  { value: { Boolean: true, foo: 5 }, passes: ['ReadonlyPartial', 'Empty'] },
  { value: (x: number, y: string) => x + y.length, passes: ['Function'] },
  { value: { name: undefined, likes: [] }, passes: ['Empty'] },
  { value: { name: 'Jimmy', likes: [{ name: undefined, likes: [] }] }, passes: ['Empty'] },
  {
    value: { name: 'Jimmy', likes: [{ name: 'Peter', likes: [] }] },
    passes: ['Person', 'Empty'],
  },
  { value: { a: '1', b: '2' }, passes: ['Record', 'Empty'] },
  { value: ['1', '2'], passes: ['ArrayString'] },
  { value: ['1', 2], passes: [] },
  { value: [{ name: 'Jimmy', likes: [{ name: 'Peter', likes: [] }] }], passes: ['ArrayPerson'] },
  { value: [{ name: null, likes: [] }], passes: [] },
  { value: { 1: '1', 2: '2' }, passes: ['Record', 'NumberRecord', 'Empty'] },
  { value: { a: [], b: [true, false] }, passes: ['RecordOfArrays', 'Empty'] },
  { value: new Foo(), passes: ['Empty'] },
  { value: [1, 2, 4], passes: ['ArrayNumber', 'ReadonlyNumberArray'] },
  { value: { Boolean: true, Number: '5' }, passes: ['Partial', 'Empty'] },
  {
    value: [1, 2, 3, 4],
    passes: ['ArrayNumber', 'ReadonlyNumberArray', 'CustomArray', 'CustomArrayWithMessage'],
  },
  {
    value: new SomeClassV1(42),
    passes: [
      'CustomGuardType',
      'CustomGuardConstraint',
      'ChangeType',
      'ChangeTypeAndName',
      'GuardChangeTypeAndName',
      'Empty',
    ],
  },
  {
    value: new SomeClassV2(42),
    passes: [
      'CustomGuardType',
      'CustomGuardConstraint',
      'ChangeType',
      'ChangeTypeAndName',
      'GuardChangeTypeAndName',
      'Empty',
    ],
  },
  { value: { xxx: [new SomeClass(55)] }, passes: ['RecordOfArraysOfSomeClass', 'Empty'] },
  { value: { foo: 'hello' }, passes: ['OptionalKey', 'Record', 'Empty'] },
  { value: { foo: 'hello', bar: undefined }, passes: ['OptionalKey', 'Empty'] },
  { value: { foo: 4, bar: 'baz' }, passes: ['ReadonlyRecord', 'ReadonlyPartial', 'Empty'] },
  { value: narcissist, passes: ['Person', 'Empty'] },
  { value: [narcissist, narcissist], passes: ['ArrayPerson'] },
  { value: barbell, passes: ['Graph'] },
  { value: nodeA, passes: ['Graph', 'BarbellBall'] },
  { value: srDict, passes: ['SRDict', 'Empty'] },
  { value: leftHand, passes: ['Hand', 'SRDict', 'Empty'] },
  { value: ambi, passes: ['Ambi', 'Hand', 'SRDict', 'Empty'] },
  { value: partialNarcissus, passes: ['PartialPerson', 'Empty'] },
];

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '<Circular Reference>';
      }
      seen.add(value);
    } else if (typeof value === 'symbol' || typeof value === 'function') return value.toString();
    return value;
  };
};

for (const { value, passes } of testValues) {
  const valueName =
    value === undefined ? 'undefined' : JSON.stringify(value, getCircularReplacer());
  const shouldPass: { [_ in RuntypeName]?: boolean } = {};

  shouldPass.Unknown = true;
  shouldPass.Void = true;

  for (const name of passes) shouldPass[name] = true;
  describe(`${valueName} - ${Object.keys(shouldPass).join(', ')}`, () => {
    for (const name of runtypeNames) {
      if (shouldPass[name]) {
        it(`should be valid for ${name}`, () => assertAccepts(value, runtypes[name]));
      } else {
        it(`should NOT be valid for ${name}`, () => assertRejects(value, runtypes[name]));
      }
    }
  });
}

describe('contracts', () => {
  it('0 args', () => {
    const f = () => 3;
    expect(Contract([], Number).enforce(f)()).toBe(3);
    try {
      Contract([], String).enforce(f as any)();
      fail('contract was violated but no exception was thrown');
    } catch (exception) {
      expect(exception).toBeInstanceOf(ValidationError);
      /* success */
    }
  });

  it('1 arg', () => {
    const f = (x: string) => x.length;
    expect(Contract([String], Number).enforce(f)('hel')).toBe(3);
    try {
      (Contract([String], Number).enforce(f) as any)(3);
      fail('contract was violated but no exception was thrown');
    } catch (exception) {
      expect(exception).toBeInstanceOf(ValidationError);
      /* success */
    }
  });

  it('2 args', () => {
    const f = (x: string, y: boolean) => (y ? x.length : 4);
    expect(Contract([String, Boolean], Number).enforce(f)('hello', false)).toBe(4);
    try {
      (Contract([String, Boolean], Number).enforce(f) as any)('hello');
      fail('contract was violated but no exception was thrown');
    } catch (exception) {
      expect(exception).toBeInstanceOf(ValidationError);
      /* success */
    }
  });
});

describe('check errors', () => {
  it('tuple type', () => {
    assertThrows(
      [false, '0', true],
      Tuple(Number, String, Boolean),
      'Expected number, but was false in [0]',
      '[0]',
    );
  });

  it('tuple length', () => {
    assertThrows(
      [0, '0'],
      Tuple(Number, String, Boolean),
      'Expected an array of length 3, but was 2',
    );
  });

  it('tuple nested', () => {
    assertThrows(
      [0, { name: 0 }],
      Tuple(Number, ObjectType({ name: String })),
      'Expected string, but was 0 in [1].name',
      '[1].name',
    );
  });

  it('tuple 0', () => {
    assertAccepts([], Tuple());
  });

  it('array', () => {
    assertThrows(
      [0, 2, 'test'],
      Array(Number),
      'Expected number, but was "test" (i.e. a string literal) in [2]',
      '[2]',
    );
  });

  it('array nested', () => {
    assertThrows(
      [{ name: 'Foo' }, { name: false }],
      Array(ObjectType({ name: String })),
      'Expected string, but was false in [1].name',
      '[1].name',
    );
  });

  it('array null', () => {
    assertThrows(
      [{ name: 'Foo' }, null],
      Array(ObjectType({ name: String })),
      'Expected { name: string; }, but was null in [1]',
      '[1]',
    );
  });

  it('readonly array', () => {
    assertThrows(
      [0, 2, 'test'],
      Array(Number).asReadonly(),
      'Expected number, but was "test" (i.e. a string literal) in [2]',
      '[2]',
    );
  });

  it('readonly array nested', () => {
    assertThrows(
      [{ name: 'Foo' }, { name: false }],
      Array(ObjectType({ name: String })).asReadonly(),
      'Expected string, but was false in [1].name',
      '[1].name',
    );
  });

  it('readonly array null', () => {
    assertThrows(
      [{ name: 'Foo' }, null],
      Array(ObjectType({ name: String })).asReadonly(),
      'Expected { name: string; }, but was null in [1]',
      '[1]',
    );
  });

  it('dictionary', () => {
    assertThrows(null, Record(String, String), 'Expected { [_: string]: string }, but was null');
  });

  it('dictionary invalid type', () => {
    assertThrows(
      undefined,
      Record(String, ObjectType({ name: String })),
      'Expected { [_: string]: { name: string; } }, but was undefined',
    );
    assertThrows(
      1,
      Record(String, ObjectType({ name: String })),
      'Expected { [_: string]: { name: string; } }, but was 1',
    );
  });

  it('dictionary complex', () => {
    assertThrows(
      { foo: { name: false } },
      Record(String, ObjectType({ name: String })),
      'Expected string, but was false in foo.name',
      'foo.name',
    );
  });

  it('string dictionary', () => {
    assertThrows(
      { foo: 'bar', test: true },
      Record(String, String),
      'Expected string, but was true in test',
      'test',
    );
  });

  it('number dictionary', () => {
    assertThrows(
      { 1: 'bar', 2: 20 },
      Record(Number, String),
      'Expected string, but was 20 in 2',
      '2',
    );
  });

  it('object', () => {
    assertThrows(
      { name: 'Jack', age: '10' },
      ObjectType({
        name: String,
        age: Number,
      }),
      'Expected number, but was "10" (i.e. a string literal) in age',
      'age',
    );
  });

  it('object missing keys', () => {
    assertThrows(
      { name: 'Jack' },
      ObjectType({
        name: String,
        age: Number,
      }),
      'Expected number, but was undefined in age',
      'age',
    );
  });

  it('object complex', () => {
    assertThrows(
      { name: 'Jack', age: 10, likes: [{ title: false }] },
      ObjectType({
        name: String,
        age: Number,
        likes: Array(ObjectType({ title: String })),
      }),
      'Expected string, but was false in likes.[0].title',
      'likes.[0].title',
    );
  });

  it('readonly object', () => {
    assertThrows(
      { name: 'Jack', age: '10' },
      ObjectType({
        name: String,
        age: Number,
      }).asReadonly(),
      'Expected number, but was "10" (i.e. a string literal) in age',
      'age',
    );
  });

  it('readonly object missing keys', () => {
    assertThrows(
      { name: 'Jack' },
      ObjectType({
        name: String,
        age: Number,
      }).asReadonly(),
      'Expected number, but was undefined in age',
      'age',
    );
  });

  it('readonly object complex', () => {
    assertThrows(
      { name: 'Jack', age: 10, likes: [{ title: false }] },
      ObjectType({
        name: String,
        age: Number,
        likes: Array(ObjectType({ title: String }).asReadonly()),
      }).asReadonly(),
      'Expected string, but was false in likes.[0].title',
      'likes.[0].title',
    );
  });

  it('partial', () => {
    assertThrows(
      { name: 'Jack', age: null },
      RTPartial({
        name: String,
        age: Number,
      }),
      'Expected number, but was null in age',
      'age',
    );
  });

  it('partial complex', () => {
    assertThrows(
      { name: 'Jack', likes: [{ title: 2 }] },
      RTPartial({
        name: String,
        age: Number,
        likes: Array(ObjectType({ title: String })),
      }),
      'Expected string, but was 2 in likes.[0].title',
      'likes.[0].title',
    );
  });

  it('constraint standard message', () => {
    assertThrows(
      new SomeClass(1),
      Unknown.withConstraint<SomeClass>((o: any) => o.n > 3, {
        name: 'SomeClass',
      }),
      '{n: 1} failed SomeClass check',
    );
  });

  it('constraint custom message', () => {
    assertThrows(
      new SomeClass(1),
      Unknown.withConstraint<SomeClass>((o: any) => (o.n > 3 ? true : 'n must be 3+'), {
        name: 'SomeClass',
      }),
      'n must be 3+',
    );
  });

  it('union', () => {
    assertThrows(false, Union(Number, String), 'Expected number | string, but was false');
  });
});

describe('reflection', () => {
  const X = Literal('x');
  const Y = Literal('y');

  it('unknown', () => {
    expectLiteralField(Unknown, 'tag', 'unknown');
  });

  it('never', () => {
    expectLiteralField(Never, 'tag', 'never');
  });

  it('boolean', () => {
    expectLiteralField(Boolean, 'tag', 'boolean');
  });

  it('number', () => {
    expectLiteralField(Number, 'tag', 'number');
  });

  it('string', () => {
    expectLiteralField(String, 'tag', 'string');
  });

  it('symbol', () => {
    expectLiteralField(Sym, 'tag', 'symbol');
  });

  it('literal', () => {
    expectLiteralField(X, 'tag', 'literal');
    expectLiteralField(X, 'value', 'x');
  });

  it('array', () => {
    expectLiteralField(Array(X), 'tag', 'array');
    expectLiteralField(Array(X).element, 'tag', 'literal');
    expectLiteralField(Array(X).element, 'value', 'x');
    expectLiteralField(Array(X), 'isReadonly', false);
  });

  it('array (asReadonly)', () => {
    expectLiteralField(Array(X).asReadonly(), 'tag', 'array');
    expectLiteralField(Array(X).asReadonly().element, 'tag', 'literal');
    expectLiteralField(Array(X).asReadonly().element, 'value', 'x');
    expectLiteralField(Array(X).asReadonly(), 'isReadonly', true);
  });

  it('tuple', () => {
    expectLiteralField(Tuple(X, X), 'tag', 'tuple');
    expect(Tuple(X, X).components.map(C => C.tag)).toEqual(['literal', 'literal']);
    expect(Tuple(X, X).components.map(C => C.value)).toEqual(['x', 'x']);
  });

  it('string dictionary', () => {
    const Rec = Record(String, Unknown);
    expectLiteralField(Rec, 'tag', 'record');
    expectLiteralField(Rec.key, 'tag', 'string');
  });

  it('number dictionary', () => {
    const Rec = Record(Number, Unknown);
    expectLiteralField(Rec, 'tag', 'record');
    expectLiteralField(Rec.key, 'tag', 'number');
  });

  it('object', () => {
    const Rec = ObjectType({ x: Number, y: Literal(3) });
    expectLiteralField(Rec, 'tag', 'object');
    expectLiteralField(Rec.fields.x, 'tag', 'number');
    expectLiteralField(Rec.fields.y, 'tag', 'literal');
    expectLiteralField(Rec.fields.y, 'value', 3);
    expectLiteralField(Rec, 'isReadonly', false);
  });

  it('object (asReadonly)', () => {
    const Rec = ObjectType({ x: Number, y: Literal(3) }).asReadonly();
    expectLiteralField(Rec, 'tag', 'object');
    expectLiteralField(Rec.fields.x, 'tag', 'number');
    expectLiteralField(Rec.fields.y, 'tag', 'literal');
    expectLiteralField(Rec.fields.y, 'value', 3);
    expectLiteralField(Rec, 'isReadonly', true);
  });

  it('partial', () => {
    const Opt = RTPartial({ x: Number, y: Literal(3) });
    expectLiteralField(Opt, 'tag', 'object');
    expectLiteralField(Opt.fields.x, 'tag', 'number');
    expectLiteralField(Opt.fields.y, 'tag', 'literal');
    expectLiteralField(Opt.fields.y, 'value', 3);
  });

  it('union', () => {
    expectLiteralField(Union(X, Y), 'tag', 'union');
    expectLiteralField(Union(X, Y), 'tag', 'union');
    expect(Union(X, Y).alternatives.map(A => A.tag)).toEqual(['literal', 'literal']);
    expect(Union(X, Y).alternatives.map(A => A.value)).toEqual(['x', 'y']);
  });

  it('intersect', () => {
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect');
    expectLiteralField(Intersect(X, Y), 'tag', 'intersect');
    expect(Intersect(X, Y).intersectees.map(A => A.tag)).toEqual(['literal', 'literal']);
    expect(Intersect(X, Y).intersectees.map(A => A.value)).toEqual(['x', 'y']);
  });

  it('function', () => {
    expectLiteralField(Function, 'tag', 'function');
  });

  it('lazy', () => {
    const L = Lazy(() => X);
    expectLiteralField(L, 'tag', 'lazy');
    expectLiteralField(L.underlying(), 'tag', 'literal');
    expectLiteralField(L.underlying(), 'value', 'x');
  });

  it('constraint', () => {
    const C = Number.withConstraint(n => n > 0, { name: 'PositiveNumber' });
    expectLiteralField(C, 'tag', 'constraint');
    expectLiteralField(C.underlying, 'tag', 'number');
    expectLiteralField(C, 'name', 'PositiveNumber');
  });

  it('instanceof', () => {
    class Test {}
    expectLiteralField(InstanceOf(Test), 'tag', 'instanceof');
    expectLiteralField(Record(String, Array(InstanceOf(Test))), 'tag', 'record');
  });

  it('brand', () => {
    const C = Number.withBrand('someNumber');
    expectLiteralField(C, 'tag', 'brand');
    expectLiteralField(C.entity, 'tag', 'number');
  });
});

describe('change static type with Constraint', () => {
  const test = (value: SomeClassV1): SomeClassV2 => {
    const C = Unknown.withConstraint<SomeClassV2>(SomeClassV2.isSomeClass, {
      name: 'SomeClass',
    });

    if (C.test(value)) {
      return value;
    } else {
      return new SomeClassV2(3);
    }
  };
  it('change static type', () => {
    const value = new SomeClassV1(42);
    const result = test(value);
    // confirm that it's really a SomeClassV1, even though it's type-cast to SomeClassV2
    expect(result instanceof SomeClassV1).toBe(true);
    expect(result.n).toBe(42);
  });
});

// Static tests of reflection
(
  X:
    | Unknown
    | Never
    | Boolean
    | Number
    | String
    | Sym
    | Literal<boolean | number | string>
    | Array<String | Number>
    | ReadonlyArray<String | Number>
    | ObjectType<{ [_ in string]: String | Number }, false>
    | ObjectType<{ [_ in string]: String | Number }, true>
    | RTPartial<{ [_ in string]: String | Number }, false>
    | RTPartial<{ [_ in string]: String | Number }, true>
    | Tuple<[String, String | Number]>
    | Union<[String, String | Number]>
    | Intersect<[String | Number, String | Number]>
    | Function
    | Constraint<String | Number, any, any>
    | InstanceOf<Constructor<never>>
    | Brand<string, String | Number>,
) => {
  const check = <A>(X: Runtype<A>): A => X.parse({});

  switch (X.tag) {
    case 'unknown':
      check<unknown>(X);
      break;
    case 'never':
      check<never>(X);
      break;
    case 'boolean':
      check<boolean>(X);
      break;
    case 'number':
      check<number>(X);
      break;
    case 'string':
      check<string>(X);
      break;
    case 'symbol':
      check<symbol>(X);
      break;
    case 'literal':
      check<typeof X.value>(X);
      break;
    case 'array':
      check<readonly Static<typeof X.element>[]>(X);
      break;
    case 'object':
      if (X.isPartial) {
        check<{ readonly [K in keyof typeof X.fields]?: Static<typeof X.fields[K]> }>(X);
      } else {
        check<{ readonly [K in keyof typeof X.fields]: Static<typeof X.fields[K]> }>(X);
      }
      break;
    case 'tuple':
      check<[Static<typeof X.components[0]>, Static<typeof X.components[1]>]>(X);
      break;
    case 'union':
      check<Static<typeof X.alternatives[0]> | Static<typeof X.alternatives[1]>>(X);
      break;
    case 'intersect':
      check<Static<typeof X.intersectees[0]> & Static<typeof X.intersectees[1]>>(X);
      break;
    case 'function':
      check<(...args: any[]) => any>(X);
      break;
    case 'constraint':
      check<Static<typeof X.underlying>>(X);
      break;
    case 'instanceof':
      check<typeof X.ctor>(X);
      break;
    case 'brand':
      check<Static<typeof X.entity>>(X);
      break;
  }
};

function expectLiteralField<O, K extends keyof O, V extends O[K]>(o: O, k: K, v: V) {
  expect(o[k]).toBe(v);
}

function assertAccepts<A>(value: unknown, runtype: Runtype<A>) {
  const result = runtype.safeParse(value);
  if (result.success === false) fail(result.message);
}

function assertRejects<A>(value: unknown, runtype: Runtype<A>) {
  const result = runtype.safeParse(value);
  if (result.success === true) fail('value passed validation even though it was not expected to');
}

function assertThrows<A>(value: unknown, runtype: Runtype<A>, error: string, key?: string) {
  try {
    runtype.parse(value);
    fail('value passed validation even though it was not expected to');
  } catch (exception) {
    const { shortMessage: errorMessage, key: errorKey } = exception;

    expect(exception).toBeInstanceOf(ValidationError);
    expect(errorMessage + (key ? ` in ${key}` : ``)).toBe(error);
    expect(errorKey).toBe(key);
  }
}
