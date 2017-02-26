import { Rt } from '../runtype';
/**
 * Construct a possibly-recursive Runtype.
 */
export declare function Lazy<A extends Rt>(delayed: () => A): A;
