import { Reflect } from '../reflect';
import { Runtype, create, RuntypeBase, Static } from '../runtype';
import show from '../show';
import { FAILURE, SUCCESS } from '../util';
import { literal } from './literal';

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

// export function Template<A extends readonly (string | RuntypeBase<string>)[]>(
//   ...args: A
// ): Template<ExtractStrings<A>, ExtractRuntypes<B>>

type ExtractStrings<A extends readonly (string | RuntypeBase<string>)[]> = A extends readonly [
  infer carA,
  ...infer cdrA
]
  ? carA extends string
    ? [
        carA,
        ...(cdrA extends [infer cadrA, ...infer cddrA]
          ? cadrA extends RuntypeBase<string>
            ? cddrA extends readonly any[]
              ? ExtractStrings<cddrA>
              : never
            : never // cadrA is string
          : []) // cdrA is empty
      ]
    : never
  : never;

type ExtractRuntypes<A extends readonly (string | RuntypeBase<string>)[]> = A extends readonly [
  infer carA,
  ...infer cdrA
]
  ? carA extends string
    ? [
        ...(cdrA extends [infer cadrA, ...infer cddrA]
          ? cadrA extends RuntypeBase<string>
            ? cddrA extends readonly any[]
              ? [cadrA, ...ExtractRuntypes<cddrA>]
              : never
            : never // cadrA is string
          : []) // cdrA is empty
      ]
    : never
  : never;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
export function Template<A extends (string | RuntypeBase<string>)[]>(
  ...args: A
): Template<ExtractStrings<A>, ExtractRuntypes<A>>;
export function Template<
  A extends
    | [readonly string[], ...(readonly RuntypeBase<string>[])]
    | (string | RuntypeBase<string>)[]
>(
  ...args: A
): A extends (string | RuntypeBase<string>)[]
  ? Template<ExtractStrings<A>, ExtractRuntypes<A>>
  : A extends [infer carA, ...infer cdrA]
  ? carA extends readonly string[]
    ? cdrA extends readonly RuntypeBase<string>[]
      ? Template<carA, cdrA>
      : never
    : never
  : never {
  const [stringsOrFirstString, ...runtypesOrRestItems] = args;
  const strings: string[] = Array.isArray(stringsOrFirstString)
    ? (stringsOrFirstString as string[])
    : ((args as (string | RuntypeBase<string>)[]).filter(
        arg => typeof arg === 'string',
      ) as string[]);
  const runtypes: RuntypeBase<string>[] = Array.isArray(stringsOrFirstString)
    ? (runtypesOrRestItems as RuntypeBase<string>[])
    : ((args as (string | RuntypeBase<string>)[]).filter(
        arg => typeof arg !== 'string',
      ) as RuntypeBase<string>[]);

  const self = ({ tag: 'template', strings, runtypes } as unknown) as Reflect;

  const pattern = strings.reduce((pattern, string) => {
    return pattern + escapeRegExp(string) + `(.*)`;
  }, '');
  const regexp = new RegExp(`^${pattern}$`);

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

  const displayText = strings.reduce((pattern, string, i) => {
    const runtype = runtypes[i];
    return pattern + string + (runtype ? `\${${show(runtype.reflect)}}` : '');
  }, '');

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
      typeof value === 'string' && test(value)
        ? SUCCESS(value)
        : FAILURE.VALUE_INCORRECT('string', `\`${displayText}\``, `\`${literal(value)}\``),
    self,
  );
}
