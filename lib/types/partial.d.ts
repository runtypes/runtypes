import { Runtype, Rt, Static } from '../runtype';
export interface Part<O extends {
    [_ in string]: Rt;
}> extends Runtype<{
    [K in keyof O]?: Static<O[K]>;
}> {
    tag: 'partial';
    fields: O;
}
/**
 * Construct a runtype for partial records
 */
export declare function Part<O extends {
    [_: string]: Rt;
}>(fields: O): Part<O>;
export { Part as Partial };
