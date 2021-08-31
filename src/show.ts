import { Reflect } from './index';

const show = (needsParens: boolean, circular: Set<Reflect>) => (refl: Reflect): string => {
  const parenthesize = (s: string) => (needsParens ? `(${s})` : s);

  if (circular.has(refl)) {
    return parenthesize(`CIRCULAR ${refl.tag}`);
  }

  circular.add(refl);

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
        if (refl.strings.length === 2 && refl.strings.every(s => s === '')) {
          return show(false, circular)(refl.runtypes[0].reflect);
        } else {
          const content = refl.strings.reduce((pattern, string, i) => {
            const runtype = refl.runtypes[i];
            return (
              pattern + string + (runtype ? `\${${show(false, circular)(runtype.reflect)}}` : '')
            );
          }, '');
          return refl.runtypes.length === 0 ? `"${content}"` : `\`${content}\``;
        }
      }
      case 'array':
        return `${readonlyTag(refl)}${show(true, circular)(refl.element)}[]`;
      case 'dictionary':
        return `{ [_: ${refl.key}]: ${show(false, circular)(refl.value)} }`;
      case 'record': {
        const keys = Object.keys(refl.fields);
        return keys.length
          ? `{ ${keys
              .map(
                k =>
                  `${readonlyTag(refl)}${k}${partialTag(refl, k)}: ${
                    refl.fields[k].tag === 'optional'
                      ? show(false, circular)((refl.fields[k] as any).underlying)
                      : show(false, circular)(refl.fields[k])
                  };`,
              )
              .join(' ')} }`
          : '{}';
      }
      case 'tuple':
        return `[${refl.components.map(show(false, circular)).join(', ')}]`;
      case 'union':
        return parenthesize(`${refl.alternatives.map(show(true, circular)).join(' | ')}`);
      case 'intersect':
        return parenthesize(`${refl.intersectees.map(show(true, circular)).join(' & ')}`);
      case 'optional':
        return show(needsParens, circular)(refl.underlying) + ' | undefined';
      case 'constraint':
        return refl.name || show(needsParens, circular)(refl.underlying);
      case 'instanceof':
        return (refl.ctor as any).name;
      case 'brand':
        return show(needsParens, circular)(refl.entity);
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
