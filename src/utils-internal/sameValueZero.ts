/**
 * <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality>
 */
const sameValueZero = (x: unknown, y: unknown) => {
	if (typeof x === "number" && typeof y === "number") {
		// x and y are equal (may be -0 and 0) or they are both NaN
		return x === y || (x !== x && y !== y)
	}
	return x === y
}

export default sameValueZero