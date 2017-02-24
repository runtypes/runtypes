import { Runtype, create } from '../runtype'

export type always = {} | void | null

export interface Always extends Runtype<always> { tag: 'always' }

/**
 * Validates anything, but provides no new type information about it.
 */
export const Always = create<Always>(x => x, { tag: 'always' })

