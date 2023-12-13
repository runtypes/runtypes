import show from "./show.ts"
import typeOf from "./typeOf.ts"
import Failcode from "../result/Failcode.ts"
import Failure from "../result/Failure.ts"
import Reflect from "../utils/Reflect.ts"

const FAILURE = Object.assign(
	(code: Failcode, message: string, details?: Failure.Details): Failure => ({
		success: false,
		code,
		message,
		...(details ? { details } : {}),
	}),
	{
		TYPE_INCORRECT: (self: Reflect, value: unknown) => {
			const message = `Expected ${
				self.tag === "template" ? `string ${show(self)}` : show(self)
			}, but was ${typeOf(value)}`
			return FAILURE(Failcode.TYPE_INCORRECT, message)
		},
		VALUE_INCORRECT: (name: string, expected: unknown, received: unknown) => {
			return FAILURE(
				Failcode.VALUE_INCORRECT,
				`Expected ${name} ${String(expected)}, but was ${String(received)}`,
			)
		},
		KEY_INCORRECT: (self: Reflect, expected: Reflect, value: unknown) => {
			return FAILURE(
				Failcode.KEY_INCORRECT,
				`Expected ${show(self)} key to be ${show(expected)}, but was ${typeOf(value)}`,
			)
		},
		CONTENT_INCORRECT: (self: Reflect, details: Failure.Details) => {
			const formattedDetails = JSON.stringify(details, null, "\t").replace(/^ *null,\n/gm, "")
			const message = `Validation failed:\n${formattedDetails}.\nObject should match ${show(self)}`
			return FAILURE(Failcode.CONTENT_INCORRECT, message, details)
		},
		ARGUMENT_INCORRECT: (message: string) => {
			return FAILURE(Failcode.ARGUMENT_INCORRECT, message)
		},
		RETURN_INCORRECT: (message: string) => {
			return FAILURE(Failcode.RETURN_INCORRECT, message)
		},
		CONSTRAINT_FAILED: (self: Reflect, message?: string) => {
			const info = message ? `: ${message}` : ""
			return FAILURE(Failcode.CONSTRAINT_FAILED, `Failed constraint check for ${show(self)}${info}`)
		},
		PROPERTY_MISSING: (self: Reflect) => {
			const message = `Expected ${show(self)}, but was missing`
			return FAILURE(Failcode.PROPERTY_MISSING, message)
		},
		PROPERTY_PRESENT: (value: unknown) => {
			const message = `Expected nothing, but was ${typeOf(value)}`
			return FAILURE(Failcode.PROPERTY_PRESENT, message)
		},
		NOTHING_EXPECTED: (value: unknown) => {
			const message = `Expected nothing, but was ${typeOf(value)}`
			return FAILURE(Failcode.NOTHING_EXPECTED, message)
		},
	},
)

export default FAILURE