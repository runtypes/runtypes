import { type RuntypeBase } from "../Runtype.ts"

/**
 * Obtains the static type associated with a Runtype.
 */
type Static<A extends RuntypeBase> = A["_falseWitness"]

export default Static