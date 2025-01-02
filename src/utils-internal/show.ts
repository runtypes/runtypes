import enumerableKeysOf from "./enumerableKeysOf.ts"
import type Optional from "../Optional.ts"
import type Runtype from "../Runtype.ts"

/**
 * Return the display string for the stringified version of a type, e.g.
 *
 * - `Number` -> `` `${number}` ``
 * - `String` -> `string`
 * - `Literal(42)` -> `"42"`
 * - `Union(Literal("foo"), Number)` -> `` "foo" | `${number}` ``
 */
const showStringified =
	(circular: Set<Runtype.Core>) =>
	(runtype: Runtype): string => {
		switch (runtype.tag) {
			case "literal":
				return `"${globalThis.String(runtype.value)}"`
			case "string":
				return "string"
			case "brand":
				return runtype.brand
			case "constraint":
				return showStringified(circular)(runtype.underlying as Runtype)
			case "union":
				return runtype.alternatives
					.map(alternative => showStringified(circular)(alternative as Runtype))
					.join(" | ")
			case "intersect":
				return runtype.intersectees
					.map(alternative => showStringified(circular)(alternative as Runtype))
					.join(" & ")
			default:
				break
		}
		return `\`\${${show(false, circular)(runtype)}}\``
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
	(circular: Set<Runtype.Core>) =>
	(runtype: Runtype): string => {
		switch (runtype.tag) {
			case "literal":
				return String(runtype.value)
			case "brand":
				return `\${${runtype.brand}}`
			case "constraint":
				return showEmbedded(circular)(runtype.underlying as Runtype)
			case "union":
				if (runtype.alternatives.length === 1) {
					const inner = runtype.alternatives[0]!
					return showEmbedded(circular)(inner as Runtype)
				}
				break
			case "intersect":
				if (runtype.intersectees.length === 1) {
					const inner = runtype.intersectees[0]!
					return showEmbedded(circular)(inner as Runtype)
				}
				break
			default:
				break
		}
		return `\${${show(false, circular)(runtype)}}`
	}

const show =
	(needsParens: boolean, circular: Set<Runtype.Core>) =>
	(runtype: Runtype): string => {
		const parenthesize = (s: string) => (needsParens ? `(${s})` : s)

		if (circular.has(runtype)) return parenthesize(`CIRCULAR ${runtype.tag}`)
		else circular.add(runtype)

		try {
			switch (runtype.tag) {
				// Primitive types
				case "unknown":
				case "never":
				case "boolean":
				case "number":
				case "bigint":
				case "string":
				case "symbol":
				case "function":
					return runtype.tag
				case "literal": {
					const { value } = runtype
					return typeof value === "string" ? `"${value}"` : String(value)
				}

				// Complex types
				case "template": {
					if (runtype.strings.length === 0) return '""'
					else if (runtype.strings.length === 1) return `"${runtype.strings[0]}"`
					else if (runtype.strings.length === 2) {
						if (runtype.strings.every(string => string === "")) {
							const r = runtype.runtypes[0]!
							return showStringified(circular)(r as Runtype)
						}
					}
					let backtick = false
					const inner = runtype.strings.reduce((inner, string, i) => {
						const prefix = inner + string
						const r = runtype.runtypes[i]
						if (r) {
							const suffix = showEmbedded(circular)(r as Runtype)
							if (!backtick && suffix.startsWith("$")) backtick = true
							return prefix + suffix
						} else return prefix
					}, "")
					return backtick ? `\`${inner}\`` : `"${inner}"`
				}
				case "array":
					return `${show(true, circular)(runtype.element as Runtype)}[]`
				case "record":
					return `{ [_: ${show(false, circular)(runtype.key as Runtype)}]: ${show(false, circular)(runtype.value as Runtype)} }`
				case "object": {
					const keys = enumerableKeysOf(runtype.fields)
					return keys.length
						? `{ ${keys
								.map(
									key =>
										`${key.toString()}${optionalTag(runtype, key)}: ${
											runtype.fields[key]!.tag === "optional"
												? show(
														false,
														circular,
													)((runtype.fields[key]! as Optional).underlying as Runtype)
												: show(false, circular)(runtype.fields[key]! as Runtype)
										};`,
								)
								.join(" ")} }`
						: "{}"
				}
				case "tuple":
					return !Array.isArray(runtype.components) &&
						runtype.components.leading.length === 0 &&
						runtype.components.trailing.length === 0
						? show(false, circular)(runtype.components.rest as Runtype)
						: `[${(Array.isArray(runtype.components)
								? runtype.components.map(component => show(false, circular)(component as Runtype))
								: [
										...runtype.components.leading.map(component =>
											show(false, circular)(component as Runtype),
										),
										`...${show(true, circular)(runtype.components.rest as Runtype)}`,
										...runtype.components.trailing.map(component =>
											show(false, circular)(component as Runtype),
										),
									]
							).join(", ")}]`
				case "union":
					return parenthesize(
						`${runtype.alternatives.map(alternative => show(true, circular)(alternative as Runtype)).join(" | ")}`,
					)
				case "intersect":
					return parenthesize(
						`${runtype.intersectees.map(intersectee => show(true, circular)(intersectee as Runtype)).join(" & ")}`,
					)
				case "optional":
					return show(needsParens, circular)(runtype.underlying as Runtype) + " | undefined"
				case "constraint":
					return show(needsParens, circular)(runtype.underlying as Runtype)
				case "instanceof":
					return (runtype.ctor as any).name
				case "brand":
					return runtype.brand
			}
		} finally {
			circular.delete(runtype)
		}
	}

const optionalTag = (
	{ fields }: { fields: { [_: string | number | symbol]: Runtype.Core } },
	key: string | number | symbol,
): string => (fields[key]!.tag === "optional" ? "?" : "")

export default show(false, new Set<Runtype.Core>())