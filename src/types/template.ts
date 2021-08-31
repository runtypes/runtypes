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
 * However, all the limitation is about static types. Runtime type checking *does* work flawlessly with the above syntax.
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
  const pattern = strings.map(escapeRegExp).join('(.*)');
  const regexp = new RegExp(`^${pattern}$`, 'us');

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
      for (let i = 0; i < runtypes.length; i++) {
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
