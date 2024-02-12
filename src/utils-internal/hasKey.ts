// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
const hasKey = <K extends string | number | symbol>(
	key: K,
	object: unknown,
): object is { [_ in K]: unknown } => typeof object === "object" && object !== null && key in object

export default hasKey