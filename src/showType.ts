import { AnyRuntype } from './index'

const showType = (needsParens: boolean) => (T: AnyRuntype): string => {

  const parenthesize = (s: string) => needsParens ? `(${s})` : s

  switch (T.tag) {
    // Primitive types
    case 'always':
    case 'never':
    case 'undefined':
    case 'null':
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
      return `${showType(true)(T.Element)}[]`
    case 'dictionary':
      return `{ [_: ${T.keyType}]: {} }`
    case 'record': {
      const keys = Object.keys(T.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}: ${showType(false)(T.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'optional': {
      const keys = Object.keys(T.Fields)
      return keys.length ? `{ ${keys
        .map(k => `${k}?: ${showType(false)(T.Fields[k])};`)
        .join(' ')
      } }` : '{}'
    }
    case 'tuple':
      return `[${T.Components.map(showType(false)).join(', ')}]`
    case 'union':
      return parenthesize(`${T.Alternatives.map(showType(true)).join(' | ')}`)
    case 'intersect':
      return parenthesize(`${T.Intersectees.map(showType(true)).join(' & ')}`)
    case 'constraint':
      return showType(needsParens)(T.Underlying)
  }
}

export default showType(false)
