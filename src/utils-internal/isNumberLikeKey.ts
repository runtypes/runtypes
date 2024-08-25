const numberString = /^(?:-?\d+(?:\.\d+)?|NaN|-?Infinity)$/

/**
 * Mimicking the behavior of type-level `` `${number}` ``.
 *
 * Note that `` `${NaN}` `` is not assignable to a variable of type `` `${number}` ``, but `` `${NaN as number}` `` is assignable, thus this function also accepts `"NaN"`. The same applies to `Infinity` and `-Infinity`.
 */
const isNumberLikeKey = (key: string | symbol): key is `${number}` =>
	typeof key === "string" && numberString.test(key)

export default isNumberLikeKey