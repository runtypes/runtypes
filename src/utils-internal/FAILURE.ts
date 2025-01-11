import Literal from "../Literal.ts"
import type Runtype from "../Runtype.ts"
import { type Static } from "../Runtype.ts"
import quoteWithDoubleQuote from "./quoteWithDoubleQuote.ts"
import Failcode from "../result/Failcode.ts"
import type Failure from "../result/Failure.ts"
import show from "../utils-internal/show.ts"
import typeOf from "../utils-internal/typeOf.ts"

type FailureInitializer<C extends Failcode> = Failure & { code: C } extends infer F
	? {
			[K in keyof F as K extends "expected" ? K : never]: Runtype.Core
		} & {
			[K in keyof F as K extends "success" | "message" | "code" | "expected" ? never : K]: F[K]
		} extends infer T
		? { [K in keyof T]: T[K] }
		: never
	: never

const FAILURE: {
	[C in Failcode]: (failure: FailureInitializer<C>) => Failure & { code: C }
} = new Proxy<any>(
	{},
	{
		get: (target, key, receiver) => {
			if (key in Failcode)
				return <C extends Failcode>(failure: FailureInitializer<C>) => {
					const content = {
						success: false,
						message: undefined,
						code: key,
						...failure,
					} as unknown as Failure & { code: C }
					content.message = toMessage(content)
					return content
				}
			else return Reflect.get(target, key, receiver)
		},
	},
)

const toMessage = (failure: Failure): string => {
	switch (failure.code) {
		case Failcode.TYPE_INCORRECT:
			return `Expected ${show(failure.expected)}, but was ${"details" in failure || "inner" in failure ? "incompatible" : typeOf(failure.received)}`
		case Failcode.VALUE_INCORRECT:
			switch (failure.expected.tag) {
				case "symbol": {
					const expected = failure.expected.key
					const received = globalThis.Symbol.keyFor(failure.received as symbol)
					const messageExpected =
						expected === undefined
							? "unique symbol"
							: `symbol for key ${quoteWithDoubleQuote(expected)}`
					const messageReceived =
						received === undefined ? "unique" : `for ${quoteWithDoubleQuote(received)}`
					return `Expected ${messageExpected}, but was ${messageReceived}`
				}
				default:
					return `Expected ${show(failure.expected)}, but was ${show(Literal(failure.received as Static<Literal>))}`
			}
		case Failcode.KEY_INCORRECT:
			return `Expected key to be ${show(failure.expected)}, but was ${"details" in failure ? "incompatible" : show(Literal(failure.received as Static<Literal>))}`
		case Failcode.CONTENT_INCORRECT:
			return `Expected ${show(failure.expected)}, but was incompatible`
		case Failcode.ARGUMENTS_INCORRECT:
			return `Received unexpected arguments: ${failure.inner.message}`
		case Failcode.RETURN_INCORRECT:
			return `Returned unexpected value: ${failure.inner.message}`
		case Failcode.RESOLVE_INCORRECT:
			return `Resolved unexpected value: ${failure.inner.message}`
		case Failcode.CONSTRAINT_FAILED:
			return (
				`Constraint failed` +
				(failure.thrown
					? `: ${failure.thrown instanceof Error ? failure.thrown.message : failure.thrown}`
					: "")
			)
		case Failcode.PROPERTY_MISSING:
			return `Expected ${show(failure.expected)}, but was missing`
		case Failcode.PROPERTY_PRESENT:
			return `Expected nothing, but was ${typeOf(failure.received)}`
		case Failcode.NOTHING_EXPECTED:
			return `Expected nothing, but was ${typeOf(failure.received)}`
		case Failcode.PARSING_FAILED:
			return (
				`Parsing failed` +
				("thrown" in failure
					? `: ${failure.thrown instanceof Error ? failure.thrown.message : failure.thrown}`
					: "")
			)
	}
}

export default FAILURE