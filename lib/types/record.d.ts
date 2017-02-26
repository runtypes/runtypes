import { Runtype, Rt, Static } from '../runtype';
export interface Record<O extends {
    [_ in string]: Rt;
}> extends Runtype<{
    [K in keyof O]: Static<O[K]>;
}> {
    tag: 'record';
    fields: O;
}
/**
 * Construct a record runtype from runtypes for its values.
 */
export declare function Record<O extends {
    [_: string]: Rt;
}>(fields: O): Record<O>;
