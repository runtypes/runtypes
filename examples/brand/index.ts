/* eslint-disable import/no-named-export */
import { String, Static, Record, Array, Runtype, Partial } from "../../src/index.ts"

export const ArrayNonEmpty = <T extends Runtype>(element: T) =>
	Array(element).withConstraint(a => 0 < a.length || "array must not be empty")

export const ID = String.withBrand("ID")

export const IDRequiredAndOptional = Record({ required: ArrayNonEmpty(ID) })
	.And(Partial({ optional: ArrayNonEmpty(ID) }))
	.withBrand("IDRequiedAndOptional")

export const test: IDRequiedAndOptional = IDRequiredAndOptional.check({
	required: ["a"],
	optional: ["b"],
})

export type ID = Static<typeof ID>

export type IDRequiedAndOptional = Static<typeof IDRequiredAndOptional>