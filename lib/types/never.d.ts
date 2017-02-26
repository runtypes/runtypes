import { Runtype } from '../runtype';
export interface Never extends Runtype<never> {
    tag: 'never';
}
/**
 * Validates nothing (always fails).
 */
export declare const Never: Never;
