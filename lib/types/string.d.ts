import { Runtype } from '../runtype';
export interface String extends Runtype<string> {
    tag: 'string';
}
/**
 * Validates that a value is a string.
 */
export declare const String: String;
