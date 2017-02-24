import { Runtype, Static, runtype } from './base'

export type always = {} | void | null

export interface Always extends Runtype<always> { tag: 'always' }

/**
 * Validates anything, but provides no new type information about it.
 */
export const Always = runtype<Always>(x => x, { tag: 'always' })

