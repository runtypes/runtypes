import { Reflect } from './index';

/**
 * Return the display string for the stringified version of a type, e.g.
 *
 * - `Number` -> `` `${number}` ``
 * - `String` -> `string`
 * - `Literal(42)` -> `"42"`
 * - `Union(Literal("foo"), Number)` -> `` "foo" | `${number}` ``
 */
const showStringified = (circular: Set<Reflect>, verboseTypings: boolean) => (
  refl: Reflect,
): string => {
  switch (refl.tag) {
    case 'literal':
      return `"${String(refl.value)}"`;
    case 'string':
      return 'string';
    case 'brand':
      return refl.brand;
    case 'constraint':
      return refl.name || showStringified(circular, verboseTypings)(refl.underlying);
    case 'union':
      return refl.alternatives.map(showStringified(circular, verboseTypings)).join(' | ');
    case 'intersect':
      return refl.intersectees.map(showStringified(circular, verboseTypings)).join(' & ');
    default:
      break;
  }
  return `\`\${${show(false, circular)(refl, verboseTypings)}}\``;
};

/**
 * Return the display string which is to be embedded into the display string of
 * the surrounding template literal type, e.g.
 *
 * - `Number` -> `${number}`
 * - `String` -> `${string}`
 * - `Literal("foo")` -> `foo`
 * - `Union(Literal(42), Number)` -> `${"42" | number}`
 */
const showEmbedded = (circular: Set<Reflect>, verboseTypings: boolean) => (
  refl: Reflect,
): string => {
  switch (refl.tag) {
    case 'literal':
      return String(refl.value);
    case 'brand':
      return `\${${refl.brand}}`;
    case 'constraint':
      return refl.name
        ? `\${${refl.name}}`
        : showEmbedded(circular, verboseTypings)(refl.underlying);
    case 'union':
      if (refl.alternatives.length === 1) {
        const inner = refl.alternatives[0];
        return showEmbedded(circular, verboseTypings)(inner.reflect);
      }
      break;
    case 'intersect':
      if (refl.intersectees.length === 1) {
        const inner = refl.intersectees[0];
        return showEmbedded(circular, verboseTypings)(inner.reflect);
      }
      break;
    default:
      break;
  }
  return `\${${show(false, circular)(refl, verboseTypings)}}`;
};

const show = (needsParens: boolean, circular: Set<Reflect>) => (
  refl: Reflect,
  verboseTypings: boolean,
): string => {
  const parenthesize = (s: string) => (needsParens ? `(${s})` : s);

  if (circular.has(refl)) return parenthesize(`CIRCULAR ${refl.tag}`);
  else circular.add(refl);

  try {
    switch (refl.tag) {
      // Primitive types
      case 'unknown':
      case 'never':
      case 'void':
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string':
      case 'symbol':
      case 'function':
        return refl.tag;
      case 'literal': {
        const { value } = refl;
        return typeof value === 'string' ? `"${value}"` : String(value);
      }

      // Complex types
      case 'template': {
        if (refl.strings.length === 0) return '""';
        else if (refl.strings.length === 1) return `"${refl.strings[0]}"`;
        else if (refl.strings.length === 2) {
          if (refl.strings.every(string => string === '')) {
            const runtype = refl.runtypes[0];
            return showStringified(circular, verboseTypings)(runtype.reflect);
          }
        }
        let backtick = false;
        const inner = refl.strings.reduce((inner, string, i) => {
          const prefix = inner + string;
          const runtype = refl.runtypes[i];
          if (runtype) {
            const suffix = showEmbedded(circular, verboseTypings)(runtype.reflect);
            if (!backtick && suffix.startsWith('$')) backtick = true;
            return prefix + suffix;
          } else return prefix;
        }, '');
        return backtick ? `\`${inner}\`` : `"${inner}"`;
      }
      case 'array':
        if (!verboseTypings) return 'array';
        return `${readonlyTag(refl)}${show(true, circular)(refl.element, verboseTypings)}[]`;
      case 'dictionary':
        if (!verboseTypings) return 'dictionary';
        return `{ [_: ${refl.key}]: ${show(false, circular)(refl.value, verboseTypings)} }`;
      case 'record': {
        if (!verboseTypings) return 'object';
        const keys = Object.keys(refl.fields);
        return keys.length
          ? `{ ${keys
              .map(
                k =>
                  `${readonlyTag(refl)}${k}${partialTag(refl, k)}: ${
                    refl.fields[k].tag === 'optional'
                      ? show(false, circular)((refl.fields[k] as any).underlying, verboseTypings)
                      : show(false, circular)(refl.fields[k], verboseTypings)
                  };`,
              )
              .join(' ')} }`
          : '{}';
      }
      case 'tuple':
        if (!verboseTypings) return 'tuple';
        return `[${refl.components.map(r => show(false, circular)(r, verboseTypings)).join(', ')}]`;
      case 'union':
        return parenthesize(
          `${refl.alternatives.map(r => show(true, circular)(r, verboseTypings)).join(' | ')}`,
        );
      case 'intersect':
        return parenthesize(
          `${refl.intersectees.map(r => show(true, circular)(r, verboseTypings)).join(' & ')}`,
        );
      case 'optional':
        return show(needsParens, circular)(refl.underlying, verboseTypings) + ' | undefined';
      case 'constraint':
        return refl.name || show(needsParens, circular)(refl.underlying, verboseTypings);
      case 'instanceof':
        return (refl.ctor as any).name;
      case 'brand':
        return show(needsParens, circular)(refl.entity, verboseTypings);
    }
  } finally {
    circular.delete(refl);
  }
  /* istanbul ignore next */
  throw Error('impossible');
};

export default show(false, new Set<Reflect>());

function partialTag(
  {
    isPartial,
    fields,
  }: {
    isPartial: boolean;
    fields: {
      [_: string]: Reflect;
    };
  },
  key?: string,
): string {
  return isPartial || (key !== undefined && fields[key].tag === 'optional') ? '?' : '';
}

function readonlyTag({ isReadonly }: { isReadonly: boolean }): string {
  return isReadonly ? 'readonly ' : '';
}
