import { Reflect } from '../reflect';
import { Runtype, create, RuntypeBase, Static } from '../runtype';
import show from '../show';
import { FAILURE, SUCCESS } from '../util';
import { Literal, literal } from './literal';

export type TemplateLiteralType<
  A extends readonly string[],
  B extends readonly RuntypeBase<string>[]
> = A extends readonly [infer carA, ...infer cdrA]
  ? carA extends string
    ? B extends readonly [infer carB, ...infer cdrB]
      ? carB extends RuntypeBase<string>
        ? cdrA extends readonly string[]
          ? cdrB extends readonly RuntypeBase<string>[]
            ? `${carA}${Static<carB>}${TemplateLiteralType<cdrA, cdrB>}`
            : `${carA}${Static<carB>}`
          : `${carA}${Static<carB>}`
        : `${carA}`
      : `${carA}`
    : ''
  : '';

export interface Template<A extends readonly string[], B extends readonly RuntypeBase<string>[]>
  extends Runtype<TemplateLiteralType<A, B>> {
  tag: 'template';
  strings: A;
  runtypes: B;
}

type ExtractStrings<
  A extends readonly (string | RuntypeBase<string>)[],
  prefix extends string = ''
> = A extends readonly [infer carA, ...infer cdrA]
  ? cdrA extends readonly any[]
    ? carA extends RuntypeBase<string>
      ? [prefix, ...ExtractStrings<cdrA>] // Omit `carA` if it's a `RuntypeBase<string>`
      : carA extends string
      ? [...ExtractStrings<cdrA, `${prefix}${carA}`>]
      : never // `carA` is neither `RuntypeBase<string>` nor `string` here
    : never // If `A` is not empty, `cdrA` must be also an array
  : [prefix]; // `A` is empty here

type ExtractRuntypes<A extends readonly (string | RuntypeBase<string>)[]> = A extends readonly [
  infer carA,
  ...infer cdrA
]
  ? cdrA extends readonly any[]
    ? carA extends RuntypeBase<string>
      ? [carA, ...ExtractRuntypes<cdrA>]
      : carA extends string
      ? [...ExtractRuntypes<cdrA>]
      : never // `carA` is neither `RuntypeBase<string>` nor `string`
    : never // If `A` is not empty, `cdrA` must be also an array
  : []; // `A` is empty here

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseArgs = (
  args:
    | readonly [TemplateStringsArray, ...(readonly RuntypeBase<string>[])]
    | readonly (string | RuntypeBase<string>)[],
): [string[], RuntypeBase<string>[]] => {
  // If the first element is an `Array`, maybe it's called by the tagged style
  if (0 < args.length && Array.isArray(args[0])) {
    const [strings, ...runtypes] = args as [string[], ...RuntypeBase<string>[]];
    // For further manipulation, recreate an `Array` because `TemplateStringsArray` is readonly
    return [Array.from(strings), runtypes];
  } else {
    const convenient = args as readonly (string | RuntypeBase<string>)[];
    const strings = convenient.reduce(
      (strings, arg) => {
        // Concatenate every consecutive strings
        if (typeof arg === 'string') strings.push(strings.pop() + arg);
        else strings.push('');
        return strings;
      },
      [''],
    );
    const runtypes = convenient.filter(arg => typeof arg !== 'string') as RuntypeBase<string>[];
    return [strings, runtypes];
  }
};

const getLiteralsInUnion = (runtype: RuntypeBase<unknown>): Literal<string>[] => {
  switch (runtype.reflect.tag) {
    case 'literal':
      return [runtype as Literal<string>];
    case 'brand':
      return getLiteralsInUnion(runtype.reflect.entity);
    case 'union':
      return runtype.reflect.alternatives.map(getLiteralsInUnion).reduce((a, x) => a.concat(x), []);
    default:
      throw undefined;
  }
};

/**
 * Validates that a value is a string that conforms to the template.
 *
 * ***There's only limited support for static type inference for this runtype.***
 *
 * ## Usage
 *
 * You can use the familiar syntax to create a `Template` runtype:
 *
 * ```ts
 * const T = Template`foo${Literal("bar")}baz`
 * ```
 *
 * But then the type inference won't work:
 *
 * ```ts
 * type T = Static<typeof T> // inferred as ""
 * ```
 *
 * Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.
 *
 * If you want the type inference rather than the tagged syntax, you have to manually write a function call:
 *
 * ```ts
 * const T = Template(["foo", "baz"] as const, Literal("bar"))
 * type T = Static<typeof T> // inferred as "foobarbaz"
 * ```
 *
 * As another solution, it also supports a convenient pattern of parameters:
 *
 * ```ts
 * const T = Template("foo", Literal("bar"), "baz")
 * type T = Static<typeof T> // inferred as "foobarbaz"
 * ```
 *
 * ## Caveats
 *
 * All runtypes except `Literal` or `Union` of `Literal`s won't work expectedly in the cases it should occur immediately one after another, for example:
 *
 * ```ts
 * const UpperCaseString = Constraint(String, s => s === s.toUpperCase(), {
 *   name: 'UpperCaseString',
 * })
 * const LowerCaseString = Constraint(String, s => s === s.toLowerCase(), {
 *   name: 'LowerCaseString',
 * })
 * Template(UpperCaseString, LowerCaseString)
 * ```
 *
 * Because the only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraint, which must be hardly done. Actually runtypes treats `String` runtypes as the simplest `RegExp` pattern `.*`, that is, the above runtype won't work at all because the entire pattern is just `^(.*)(.*)$`. You have to avoid using `Constraint` this way, and instead manually parse the string inside a `Constraint`.
 */
export function Template<A extends readonly string[], B extends readonly RuntypeBase<string>[]>(
  strings: A,
  ...runtypes: B
): Template<A, B>;
export function Template<A extends readonly (string | RuntypeBase<string>)[]>(
  ...args: A
): Template<ExtractStrings<A>, ExtractRuntypes<A>>;
export function Template<
  A extends
    | [TemplateStringsArray, ...(readonly RuntypeBase<string>[])]
    | readonly (string | RuntypeBase<string>)[]
>(
  ...args: A
): A extends (string | RuntypeBase<string>)[]
  ? Template<ExtractStrings<A>, ExtractRuntypes<A>> // For tagged function style
  : A extends [infer carA, ...infer cdrA]
  ? carA extends readonly string[]
    ? cdrA extends readonly RuntypeBase<string>[]
      ? Template<carA, cdrA> // For convenient parameter style
      : never
    : never
  : never {
  const [strings, runtypes] = parseArgs(args);
  const self = ({ tag: 'template', strings, runtypes } as unknown) as Reflect;

  // Flatten inner runtypes if possible
  for (let i = 0; i < runtypes.length; ) {
    switch (runtypes[i].reflect.tag) {
      case 'literal': {
        const literal = runtypes.splice(i, 1)[0] as Literal<string>;
        const string = literal.value;
        strings.splice(i, 2, strings[i] + string + strings[i + 1]);
        break;
      }
      case 'template': {
        const template = runtypes[i] as Template<string[], RuntypeBase<string>[]>;
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
      default:
        i++;
        break;
    }
  }

  const pattern = strings.map(escapeRegExp).reduce((pattern, string, i) => {
    const prefix = pattern + string;
    if (runtypes[i]) {
      try {
        // Union of literals should be treated as a special-case
        const literals = getLiteralsInUnion(runtypes[i]);
        const values = literals.map(literal => literal.value).map(escapeRegExp);
        return prefix + `(?<skip_${i}>${values.join('|')})`;
      } catch (_) {
        return prefix + '(.*)';
      }
    } else return prefix;
  }, '');
  const regexp = new RegExp(`^${pattern}$`, 'su');

  const test = (
    value: string,
  ): value is A extends (string | RuntypeBase<string>)[]
    ? TemplateLiteralType<ExtractStrings<A>, ExtractRuntypes<A>>
    : A extends [infer carA, ...infer cdrA]
    ? carA extends readonly string[]
      ? cdrA extends readonly RuntypeBase<string>[]
        ? TemplateLiteralType<carA, cdrA>
        : never
      : never
    : never => {
    const matches = value.match(regexp);
    if (matches) {
      const values = matches.slice(1);
      const groups = matches.groups;
      for (let i = 0; i < runtypes.length; i++) {
        if (groups && groups[`skip_${i}`]) continue;
        const runtype = runtypes[i];
        const value = values[i];
        const validated = runtype.validate(value);
        if (!validated.success) return false;
        else continue;
      }
      return true;
    } else return false;
  };

  return create<
    A extends (string | RuntypeBase<string>)[]
      ? Template<ExtractStrings<A>, ExtractRuntypes<A>>
      : A extends [infer carA, ...infer cdrA]
      ? carA extends readonly string[]
        ? cdrA extends readonly RuntypeBase<string>[]
          ? Template<carA, cdrA>
          : never
        : never
      : never
  >(
    value =>
      typeof value !== 'string'
        ? FAILURE.TYPE_INCORRECT(self, value)
        : test(value)
        ? SUCCESS(value)
        : FAILURE.VALUE_INCORRECT('string', `${show(self)}`, `\`${literal(value)}\``),
    self,
  );
}
