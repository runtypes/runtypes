import { Runtype } from '../runtype';
export declare type always = {} | void | null;
export interface Always extends Runtype<always> {
    tag: 'always';
}
/**
 * Validates anything, but provides no new type information about it.
 */
export declare const Always: Always;
