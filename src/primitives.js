const primitives = [
  {
    type: Boolean,
    name: 'Boolean',
    typeOf: 'boolean'
  },
  {
    type: Number,
    name: 'Number',
    typeOf: 'number'
  },
  {
    type: String,
    name: 'String',
    typeOf: 'string'
  }
]

export const primByType = new Map()
export const primByTypeOf = new Map()

for (let i = 0; i < primitives.length; i++) {
  const prim = primitives[i]
  primByType.set(prim.type, prim)
  primByTypeOf.set(prim.typeOf, prim)
}
