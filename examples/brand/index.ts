/* eslint-disable import/no-named-export */
import { String, type Static, Object, Array, type Runtype } from "../../src/index.ts"

export const ArrayNonEmpty = <T extends Runtype.Core>(element: T) =>
	Array(element).withConstraint(a => 0 < a.length || "array must not be empty")

export const ID = String.withBrand("ID")

export const IDRequiredAndOptional = Object({
	required: ArrayNonEmpty(ID),
	optional: ArrayNonEmpty(ID).optional(),
}).withBrand("IDRequiedAndOptional")

export const test: IDRequiedAndOptional = IDRequiredAndOptional.check({
	required: ["a"],
	optional: ["b"],
})

export type ID = Static<typeof ID>

export type IDRequiedAndOptional = Static<typeof IDRequiredAndOptional>