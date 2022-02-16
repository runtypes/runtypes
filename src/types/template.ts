import { Reflect } from '../reflect';
import {
  Runtype,
  create,
  RuntypeBase,
  Static,
  innerValidate,
  VisitedState,
  isRuntype,
} from '../runtype';
import show from '../show';
import { FAILURE, SUCCESS, typeOf } from '../util';
import { Literal, LiteralBase, literal } from './literal';
import { Union } from './union';
import { Intersect } from './intersect';
import { Result } from '../result';

type TemplateLiteralType<
  A extends readonly LiteralBase[],
  B extends readonly RuntypeBase<LiteralBase>[]
> = A extends readonly [infer carA, ...infer cdrA]
  ? carA extends LiteralBase
    ? B extends readonly [infer carB, ...infer cdrB]
      ? carB extends RuntypeBase<LiteralBase>
        ? cdrA extends readonly LiteralBase[]
          ? cdrB extends readonly RuntypeBase<LiteralBase>[]
            ? `${carA}${Static<carB>}${TemplateLiteralType<cdrA, cdrB>}`
            : `${carA}${Static<carB>}`
          : `${carA}${Static<carB>}`
        : `${carA}`
      : `${carA}`
    : ''
  : '';

export interface Template<
  A extends readonly [string, ...string[]],
  B extends readonly RuntypeBase<LiteralBase>[]
> extends Runtype<A extends TemplateStringsArray ? string : TemplateLiteralType<A, B>> {
  tag: 'template';
  strings: A;
  runtypes: B;
}

type ExtractStrings<
  A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[],
  prefix extends string = ''
> = A extends readonly [infer carA, ...infer cdrA]
  ? cdrA extends readonly any[]
    ? carA extends RuntypeBase<LiteralBase>
      ? [prefix, ...ExtractStrings<cdrA>] // Omit `carA` if it's a `RuntypeBase<LiteralBase>`
      : carA extends LiteralBase
      ? [...ExtractStrings<cdrA, `${prefix}${carA}`>]
      : never // `carA` is neither `RuntypeBase<LiteralBase>` nor `LiteralBase` here
    : never // If `A` is not empty, `cdrA` must be also an array
  : [prefix]; // `A` is empty here

type ExtractRuntypes<
  A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[]
> = A extends readonly [infer carA, ...infer cdrA]
  ? cdrA extends readonly any[]
    ? carA extends RuntypeBase<LiteralBase>
      ? [carA, ...ExtractRuntypes<cdrA>]
      : carA extends LiteralBase
      ? [...ExtractRuntypes<cdrA>]
      : never // `carA` is neither `RuntypeBase<LiteralBase>` nor `LiteralBase`
    : never // If `A` is not empty, `cdrA` must be also an array
  : []; // `A` is empty here

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseArgs = (
  args:
    | readonly [readonly [string, ...string[]], ...RuntypeBase<LiteralBase>[]]
    | readonly (LiteralBase | RuntypeBase<LiteralBase>)[],
): [[string, ...string[]], RuntypeBase<LiteralBase>[]] => {
  // If the first element is an `Array`, maybe it's called by the tagged style
  if (0 < args.length && Array.isArray(args[0])) {
    const [strings, ...runtypes] = args as readonly [
      readonly [string, ...string[]],
      ...RuntypeBase<LiteralBase>[]
    ];
    // For further manipulation, recreate an `Array` because `TemplateStringsArray` is readonly
    return [Array.from(strings) as [string, ...string[]], runtypes];
  } else {
    const convenient = args as readonly (LiteralBase | RuntypeBase<LiteralBase>)[];
    const strings = convenient.reduce<[string, ...string[]]>(
      (strings, arg) => {
        // Concatenate every consecutive literals as strings
        if (!isRuntype(arg)) strings.push(strings.pop()! + String(arg));
        // Skip runtypes
        else strings.push('');
        return strings;
      },
      [''],
    );
    const runtypes = convenient.filter(isRuntype) as RuntypeBase<LiteralBase>[];
    return [strings, runtypes];
  }
};

/**
 * Flatten inner runtypes of a `Template` if possible, with in-place strategy
 */
const flattenInnerRuntypes = (
  strings: [string, ...string[]],
  runtypes: RuntypeBase<LiteralBase>[],
): void => {
  for (let i = 0; i < runtypes.length; ) {
    switch (runtypes[i].reflect.tag) {
      case 'literal': {
        const literal = runtypes[i] as Literal<LiteralBase>;
        runtypes.splice(i, 1);
        const string = String(literal.value);
        strings.splice(i, 2, strings[i] + string + strings[i + 1]);
        break;
      }
      case 'template': {
        const template = runtypes[i] as Template<[string, ...string[]], RuntypeBase<LiteralBase>[]>;
        runtypes.splice(i, 1, ...template.runtypes);
        const innerStrings = template.strings;
        if (innerStrings.length === 1) {
          strings.splice(i, 2, strings[i] + innerStrings[0] + strings[i + 1]);
        } else {
          const first = innerStrings[0];
          const rest = innerStrings.slice(1, -1);
          const last = innerStrings[innerStrings.length - 1];
          strings.splice(i, 2, strings[i] + first, ...rest, last + strings[i + 1]);
        }
        break;
      }
      case 'union': {
        const union = runtypes[i] as Union<
          readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
        >;
        if (union.alternatives.length === 1) {
          try {
            const literal = getInnerLiteral(union);
            runtypes.splice(i, 1);
            const string = String(literal.value);
            strings.splice(i, 2, strings[i] + string + strings[i + 1]);
            break;
          } catch (_) {
            i++;
            break;
          }
        } else {
          i++;
          break;
        }
      }
      case 'intersect': {
        const intersect = runtypes[i] as Intersect<
          readonly [RuntypeBase<unknown>, ...RuntypeBase<unknown>[]]
        >;
        if (intersect.intersectees.length === 1) {
          try {
            const literal = getInnerLiteral(intersect);
            runtypes.splice(i, 1);
            const string = String(literal.value);
            strings.splice(i, 2, strings[i] + string + strings[i + 1]);
            break;
          } catch (_) {
            i++;
            break;
          }
        } else {
          i++;
          break;
        }
      }
      default:
        i++;
        break;
    }
  }
};

const normalizeArgs = (
  args:
    | readonly [readonly [string, ...string[]], ...RuntypeBase<LiteralBase>[]]
    | readonly (LiteralBase | RuntypeBase<LiteralBase>)[],
): [[string, ...string[]], RuntypeBase<LiteralBase>[]] => {
  const [strings, runtypes] = parseArgs(args);
  flattenInnerRuntypes(strings, runtypes);
  return [strings, runtypes];
};

const getInnerLiteral = (runtype: RuntypeBase<unknown>): Literal<LiteralBase> => {
  switch (runtype.reflect.tag) {
    case 'literal':
      return runtype as Literal<LiteralBase>;
    case 'brand':
      return getInnerLiteral(runtype.reflect.entity);
    case 'union':
      if (runtype.reflect.alternatives.length === 1)
        return getInnerLiteral(runtype.reflect.alternatives[0]);
      break;
    case 'intersect':
      if (runtype.reflect.intersectees.length === 1)
        return getInnerLiteral(runtype.reflect.intersectees[0]);
      break;
    default:
      break;
  }
  throw undefined;
};

/**
 *Reviver is used for converting string literals such as `"0x2A"` to the actual `42`
 */
type Reviver = (s: string) => any;
const identity: Reviver = s => s;
const revivers: {
  [tag in string]?: readonly [Reviver, string, ...string[]];
} = {
  string: [s => globalThis.String(s), '.*'],
  number: [
    s => globalThis.Number(s),
    '[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?',
    '0[Bb][01]+',
    '0[Oo][0-7]+',
    '0[Xx][0-9A-Fa-f]+',
    // Note: `"NaN"` isn't here, as TS doesn't allow `"NaN"` to be a `` `${number}` ``
  ],
  bigint: [s => globalThis.BigInt(s), '-?[1-9]d*'],
  boolean: [s => (s === 'false' ? false : true), 'true', 'false'],
  null: [() => null, 'null'],
  undefined: [() => undefined, 'undefined'],
};

type Revivers = Reviver | Revivers[];
const getReviversFor = (reflect: Reflect): Revivers => {
  switch (reflect.tag) {
    case 'literal': {
      const [reviver] = revivers[typeOf(reflect.value)] || [identity];
      return reviver;
    }
    case 'brand':
      return getReviversFor(reflect.entity);
    case 'constraint':
      return getReviversFor(reflect.underlying);
    case 'union':
      return reflect.alternatives.map(getReviversFor);
    case 'intersect':
      return reflect.intersectees.map(getReviversFor);
    default:
      const [reviver] = revivers[reflect.tag] || [identity];
      return reviver;
  }
};

/** Recursively map corresponding reviver and  */
const reviveValidate = (reflect: Reflect, visited: VisitedState) => (
  value: string,
): Result<unknown> => {
  const revivers = getReviversFor(reflect);
  if (Array.isArray(revivers)) {
    switch (reflect.tag) {
      case 'union':
        for (const alternative of reflect.alternatives) {
          const validated = reviveValidate(alternative.reflect, visited)(value);
          if (validated.success) return validated;
        }
        return FAILURE.TYPE_INCORRECT(reflect, value);
      case 'intersect':
        for (const intersectee of reflect.intersectees) {
          const validated = reviveValidate(intersectee.reflect, visited)(value);
          if (!validated.success) return validated;
        }
        return SUCCESS(value);
      default:
        /* istanbul ignore next */
        throw Error('impossible');
    }
  } else {
    const reviver = revivers;
    const validated = innerValidate(reflect, reviver(value), visited);
    if (!validated.success && validated.code === 'VALUE_INCORRECT' && reflect.tag === 'literal')
      // TODO: Temporary fix to show unrevived value in message; needs refactor
      return FAILURE.VALUE_INCORRECT('literal', `"${literal(reflect.value)}"`, `"${value}"`);
    return validated;
  }
};

const getRegExpPatternFor = (reflect: Reflect): string => {
  switch (reflect.tag) {
    case 'literal':
      return escapeRegExp(String(reflect.value));
    case 'brand':
      return getRegExpPatternFor(reflect.entity);
    case 'constraint':
      return getRegExpPatternFor(reflect.underlying);
    case 'union':
      return reflect.alternatives.map(getRegExpPatternFor).join('|');
    case 'template': {
      return reflect.strings.map(escapeRegExp).reduce((pattern, string, i) => {
        const prefix = pattern + string;
        const runtype = reflect.runtypes[i];
        if (runtype) return prefix + `(?:${getRegExpPatternFor(runtype.reflect)})`;
        else return prefix;
      }, '');
    }
    default:
      const [, ...patterns] = revivers[reflect.tag] || [undefined, '.*'];
      return patterns.join('|');
  }
};

const createRegExpForTemplate = (reflect: Reflect & { tag: 'template' }) => {
  const pattern = reflect.strings.map(escapeRegExp).reduce((pattern, string, i) => {
    const prefix = pattern + string;
    const runtype = reflect.runtypes[i];
    if (runtype) return prefix + `(${getRegExpPatternFor(runtype.reflect)})`;
    else return prefix;
  }, '');
  return new RegExp(`^${pattern}$`, 'su');
};

/**
 * Validates that a value is a string that conforms to the template.
 *
 * You can use the familiar syntax to create a `Template` runtype:
 *
 * ```ts
 * const T = Template`foo${Literal('bar')}baz`;
 * ```
 *
 * But then the type inference won't work:
 *
 * ```ts
 * type T = Static<typeof T>; // inferred as string
 * ```
 *
 * Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.
 *
 * If you want the type inference rather than the tagged syntax, you have to manually write a function call:
 *
 * ```ts
 * const T = Template(['foo', 'baz'] as const, Literal('bar'));
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * As a convenient solution for this, it also supports another style of passing arguments:
 *
 * ```ts
 * const T = Template('foo', Literal('bar'), 'baz');
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * You can pass various things to the `Template` constructor, as long as they are assignable to `string | number | bigint | boolean | null | undefined` and the corresponding `Runtype`s:
 *
 * ```ts
 * // Equivalent runtypes
 * Template(Literal('42'));
 * Template(42);
 * Template(Template('42'));
 * Template(4, '2');
 * Template(Literal(4), '2');
 * Template(String.withConstraint(s => s === '42'));
 * Template(
 *   Intersect(
 *     Number.withConstraint(n => n === 42),
 *     String.withConstraint(s => s.length === 2),
 *     // `Number`s in `Template` accept alternative representations like `"0x2A"`,
 *     // thus we have to constraint the length of string, to accept only `"42"`
 *   ),
 * );
 * ```
 *
 * Trivial items such as bare literals, `Literal`s, and single-element `Union`s and `Intersect`s are all coerced into strings at the creation time of the runtype. Additionally, `Union`s of such runtypes are converted into `RegExp` patterns like `(?:foo|bar|...)`, so we can assume `Union` of `Literal`s is a fully supported runtype in `Template`.
 *
 * ### Caveats
 *
 * A `Template` internally constructs a `RegExp` to parse strings. This can lead to a problem if it contains multiple non-literal runtypes:
 *
 * ```ts
 * const UpperCaseString = Constraint(String, s => s === s.toUpperCase(), {
 *   name: 'UpperCaseString',
 * });
 * const LowerCaseString = Constraint(String, s => s === s.toLowerCase(), {
 *   name: 'LowerCaseString',
 * });
 * Template(UpperCaseString, LowerCaseString);
 * ```
 *
 * The only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraints, which must be hardly done. Actually `Template` treats `String` runtypes as the simplest `RegExp` pattern `.*` and the “greedy” strategy is always used, that is, the above runtype won't work expectedly because the entire pattern is just `^(.*)(.*)$` and the first `.*` always wins. You have to avoid using `Constraint` this way, and instead manually parse it using a single `Constraint` which covers the entire string.
 */
export function Template<
  A extends TemplateStringsArray,
  B extends readonly RuntypeBase<LiteralBase>[]
>(strings: A, ...runtypes: B): Template<A & [string, ...string[]], B>;
export function Template<
  A extends readonly [string, ...string[]],
  B extends readonly RuntypeBase<LiteralBase>[]
>(strings: A, ...runtypes: B): Template<A, B>;
export function Template<A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[]>(
  ...args: A
): Template<ExtractStrings<A>, ExtractRuntypes<A>>;
export function Template<
  A extends
    | [readonly [string, ...string[]], ...RuntypeBase<LiteralBase>[]]
    | readonly (LiteralBase | RuntypeBase<LiteralBase>)[]
>(
  ...args: A
): A extends (LiteralBase | RuntypeBase<LiteralBase>)[]
  ? Template<ExtractStrings<A>, ExtractRuntypes<A>> // For tagged function style
  : A extends [infer carA, ...infer cdrA]
  ? carA extends readonly [string, ...string[]]
    ? cdrA extends readonly RuntypeBase<LiteralBase>[]
      ? Template<carA, cdrA> // For convenient parameter style
      : never
    : never
  : never {
  const [strings, runtypes] = normalizeArgs(args);
  const self = ({ tag: 'template', strings, runtypes } as unknown) as Reflect;
  const regexp = createRegExpForTemplate(self as any);

  const test = (value: string, visited: VisitedState): Result<string> => {
    const matches = value.match(regexp);
    if (matches) {
      const values = matches.slice(1);
      for (let i = 0; i < runtypes.length; i++) {
        const runtype = runtypes[i];
        const value = values[i];
        const validated = reviveValidate(runtype.reflect, visited)(value) as Result<string>;
        if (!validated.success) return validated;
      }
      return SUCCESS(value);
    } else {
      return FAILURE.VALUE_INCORRECT('string', `${show(self)}`, `"${literal(value)}"`);
    }
  };

  return create<
    A extends (LiteralBase | RuntypeBase<LiteralBase>)[]
      ? Template<ExtractStrings<A>, ExtractRuntypes<A>>
      : A extends [infer carA, ...infer cdrA]
      ? carA extends readonly [string, ...string[]]
        ? cdrA extends readonly RuntypeBase<LiteralBase>[]
          ? Template<carA, cdrA>
          : never
        : never
      : never
  >((value, visited) => {
    if (typeof value !== 'string') return FAILURE.TYPE_INCORRECT(self, value);
    else {
      const validated = test(value, visited);
      if (!validated.success) {
        const result = FAILURE.VALUE_INCORRECT('string', `${show(self)}`, `"${value}"`);
        if (result.message !== validated.message)
          // TODO: Should use `details` here, but it needs unionizing `string` anew to the definition of `Details`, which is a breaking change
          result.message += ` (inner: ${validated.message})`;
        return result;
      } else return SUCCESS(value);
    }
  }, self);
}
