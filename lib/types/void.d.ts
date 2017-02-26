import { Runtype } from '../runtype';
export interface Void extends Runtype<void> {
    tag: 'void';
}
/**
 * Validates that a value is void (null or undefined).
 */
export declare const Void: Void;
