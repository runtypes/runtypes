import { Runtype } from '../runtype';
export interface Boolean extends Runtype<boolean> {
    tag: 'boolean';
}
/**
 * Validates that a value is a boolean.
 */
export declare const Boolean: Boolean;
