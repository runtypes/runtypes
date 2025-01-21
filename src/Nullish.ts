import Null from "./Null.ts"
import Undefined from "./Undefined.ts"
import Union from "./Union.ts"

/**
 * An alias for `Union(Null, Undefined)`.
 */
const Nullish: Union<[typeof Null, typeof Undefined]> = Union(Null, Undefined)

export default Nullish