import show from "./show.ts"
import typeOf from "./typeOf.ts"
import type Runtype from "../Runtype.ts"
import Failcode from "../result/Failcode.ts"
import type Failure from "../result/Failure.ts"

const FAILURE = globalThis.Object.assign(
	(code: Failcode, message: string, details?: Failure.Details): Failure => ({
		success: false,
		code,
		message,
		...(details ? { details } : {}),
	}),
	{
		TYPE_INCORRECT: (self: Runtype.Core, value: unknown) => {
			const message = `Expected ${
				self.tag === "template" ? `string ${show(self as Runtype)}` : show(self as Runtype)
			}, but was ${typeOf(value)}`
			return FAILURE(Failcode.TYPE_INCORRECT, message)
		},
		VALUE_INCORRECT: (name: string, expected: unknown, received: unknown) => {
			return FAILURE(
				Failcode.VALUE_INCORRECT,
				`Expected ${name} ${String(expected)}, but was ${String(received)}`,
			)
		},
		KEY_INCORRECT: (self: Runtype.Core, expected: Runtype.Core, value: unknown) => {
			return FAILURE(
				Failcode.KEY_INCORRECT,
				`Expected ${show(self as Runtype)} key to be ${show(expected as Runtype)}, but was ${typeOf(value)}`,
			)
		},
		CONTENT_INCORRECT: (self: Runtype.Core, details: Failure.Details) => {
			const formattedDetails = JSON.stringify(details, null, "\t").replace(/^ *null,\n/gm, "")
			const message = `Validation failed:\n${formattedDetails}.\nObject should match ${show(self as Runtype)}`
			return FAILURE(Failcode.CONTENT_INCORRECT, message, details)
		},
		ARGUMENT_INCORRECT: (message: string) => {
			return FAILURE(Failcode.ARGUMENT_INCORRECT, message)
		},
		RETURN_INCORRECT: (message: string) => {
			return FAILURE(Failcode.RETURN_INCORRECT, message)
		},
		CONSTRAINT_FAILED: (self: Runtype.Core, message?: string) => {
			const info = message ? `: ${message}` : ""
			return FAILURE(
				Failcode.CONSTRAINT_FAILED,
				`Failed constraint check for ${show(self as Runtype)}${info}`,
			)
		},
		PROPERTY_MISSING: (self: Runtype.Core) => {
			const message = `Expected ${show(self as Runtype)}, but was missing`
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