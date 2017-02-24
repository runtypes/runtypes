import { Runtype } from './index'

const show = (needsParens: boolean) => ({ reflect: T }: Runtype<any>): string => {

  const parenthesize = (s: string) => needsParens ? `(${s})` : s

  switch (T.tag) {
    // Primitive types
    case 'always':
    case 'never':
    case 'void':
    case 'boolean':
    case 'number':
    case 'string':
    case 'function':
      return T.tag

    // Complex types
    case 'literal': {
      const { value } = T
      return typeof value === 'string'
        ? `"${value}"`
        : String(value)
    }
    case 'array':
      return `${show(true)(T.Element)}[]`
    case 'dictionary':
      return `{ [_: ${T.keyType}]: {} }`
    case 'record': {
      const keys = Object.keys(T.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}: ${show(false)(T.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'optional': {
      const keys = Object.keys(T.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}?: ${show(false)(T.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'tuple':
      return `[${T.Components.map(show(false)).join(', ')}]`
    case 'union':
      return parenthesize(`${T.Alternatives.map(show(true)).join(' | ')}`)
    case 'intersect':
      return parenthesize(`${T.Intersectees.map(show(true)).join(' & ')}`)
    case 'constraint':
      return show(needsParens)(T.Underlying)
  }
}

export default show(false)
