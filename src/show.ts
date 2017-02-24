import { Reflect } from './index'

const show = (needsParens: boolean) => (refl: Reflect): string => {

  const parenthesize = (s: string) => needsParens ? `(${s})` : s

  switch (refl.tag) {
    // Primitive types
    case 'always':
    case 'never':
    case 'void':
    case 'boolean':
    case 'number':
    case 'string':
    case 'function':
      return refl.tag

    // Complex types
    case 'literal': {
      const { value } = refl
      return typeof value === 'string'
        ? `"${value}"`
        : String(value)
    }
    case 'array':
      return `${show(true)(refl.Element)}[]`
    case 'dictionary':
      return `{ [_: ${refl.keyType}]: {} }`
    case 'record': {
      const keys = Object.keys(refl.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}: ${show(false)(refl.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'optional': {
      const keys = Object.keys(refl.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}?: ${show(false)(refl.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'tuple':
      return `[${refl.Components.map(show(false)).join(', ')}]`
    case 'union':
      return parenthesize(`${refl.Alternatives.map(show(true)).join(' | ')}`)
    case 'intersect':
      return parenthesize(`${refl.Intersectees.map(show(true)).join(' & ')}`)
    case 'constraint':
      return show(needsParens)(refl.Underlying)
  }
}

export default show(false)
