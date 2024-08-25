import type Reflect from "../utils/Reflect.ts"

/**
 * Return the display string for the stringified version of a type, e.g.
 *
 * - `Number` -> `` `${number}` ``
 * - `String` -> `string`
 * - `Literal(42)` -> `"42"`
 * - `Union(Literal("foo"), Number)` -> `` "foo" | `${number}` ``
 */
const showStringified =
	(circular: Set<Reflect>) =>
	(refl: Reflect): string => {
		switch (refl.tag) {
			case "literal":
				return `"${String(refl.value)}"`
			case "string":
				return "string"
			case "brand":
				return refl.brand
			case "constraint":
				return refl.name || showStringified(circular)(refl.underlying)
			case "union":
				return refl.alternatives.map(showStringified(circular)).join(" | ")
			case "intersect":
				return refl.intersectees.map(showStringified(circular)).join(" & ")
			default:
				break
		}
		return `\`\${${show(false, circular)(refl)}}\``
	}

/**
 * Return the display string which is to be embedded into the display string of
 * the surrounding template literal type, e.g.
 *
 * - `Number` -> `${number}`
 * - `String` -> `${string}`
 * - `Literal("foo")` -> `foo`
 * - `Union(Literal(42), Number)` -> `${"42" | number}`
 */
const showEmbedded =
	(circular: Set<Reflect>) =>
	(refl: Reflect): string => {
		switch (refl.tag) {
			case "literal":
				return String(refl.value)
			case "brand":
				return `\${${refl.brand}}`
			case "constraint":
				return refl.name ? `\${${refl.name}}` : showEmbedded(circular)(refl.underlying)
			case "union":
				if (refl.alternatives.length === 1) {
					const inner = refl.alternatives[0]!
					return showEmbedded(circular)(inner.reflect)
				}
				break
			case "intersect":
				if (refl.intersectees.length === 1) {
					const inner = refl.intersectees[0]!
					return showEmbedded(circular)(inner.reflect)
				}
				break
			default:
				break
		}
		return `\${${show(false, circular)(refl)}}`
	}

const show =
	(needsParens: boolean, circular: Set<Reflect>) =>
	(refl: Reflect): string => {
		const parenthesize = (s: string) => (needsParens ? `(${s})` : s)

		if (circular.has(refl)) return parenthesize(`CIRCULAR ${refl.tag}`)
		else circular.add(refl)

		try {
			switch (refl.tag) {
				// Primitive types
				case "unknown":
				case "never":
				case "void":
				case "boolean":
				case "number":
				case "bigint":
				case "string":
				case "symbol":
				case "function":
					return refl.tag
				case "literal": {
					const { value } = refl
					return typeof value === "string" ? `"${value}"` : String(value)
				}

				// Complex types
				case "template": {
					if (refl.strings.length === 0) return '""'
					else if (refl.strings.length === 1) return `"${refl.strings[0]}"`
					else if (refl.strings.length === 2) {
						if (refl.strings.every(string => string === "")) {
							const runtype = refl.runtypes[0]!
							return showStringified(circular)(runtype.reflect)
						}
					}
					let backtick = false
					const inner = refl.strings.reduce((inner, string, i) => {
						const prefix = inner + string
						const runtype = refl.runtypes[i]
						if (runtype) {
							const suffix = showEmbedded(circular)(runtype.reflect)
							if (!backtick && suffix.startsWith("$")) backtick = true
							return prefix + suffix
						} else return prefix
					}, "")
					return backtick ? `\`${inner}\`` : `"${inner}"`
				}
				case "array":
					return `${show(true, circular)(refl.element)}[]`
				case "record":
					return `{ [_: ${refl.key}]: ${show(false, circular)(refl.value)} }`
				case "object": {
					const keys = globalThis.Object.keys(refl.fields)
					return keys.length
						? `{ ${keys
								.map(
									k =>
										`${k}${optionalTag(refl, k)}: ${
											refl.fields[k]!.tag === "optional"
												? show(false, circular)(refl.fields[k]!.underlying)
												: show(false, circular)(refl.fields[k]!)
										};`,
								)
								.join(" ")} }`
						: "{}"
				}
				case "tuple":
					return `[${refl.components.map(show(false, circular)).join(", ")}]`
				case "union":
					return parenthesize(`${refl.alternatives.map(show(true, circular)).join(" | ")}`)
				case "intersect":
					return parenthesize(`${refl.intersectees.map(show(true, circular)).join(" & ")}`)
				case "optional":
					return show(needsParens, circular)(refl.underlying) + " | undefined"
				case "constraint":
					return refl.name || show(needsParens, circular)(refl.underlying)
				case "instanceof":
					return (refl.ctor as any).name
				case "brand":
					return show(needsParens, circular)(refl.entity)
			}
		} finally {
			circular.delete(refl)
		}
	}

const optionalTag = (
	{ fields }: { fields: { [_: string | number | symbol]: Reflect } },
	key: string | number | symbol,
): string => (fields[key]!.tag === "optional" ? "?" : "")

export default show(false, new Set<Reflect>())