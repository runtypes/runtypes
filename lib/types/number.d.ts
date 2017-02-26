import { Runtype } from '../runtype';
export interface Number extends Runtype<number> {
    tag: 'number';
}
/**
 * Validates that a value is a number.
 */
export declare const Number: Number;
