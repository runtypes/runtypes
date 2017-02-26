import { Runtype, Rt, Static } from '../runtype';
export interface Optional<O extends {
    [_ in string]: Rt;
}> extends Runtype<{
    [K in keyof O]?: Static<O[K]>;
}> {
    tag: 'optional';
    fields: O;
}
/**
 * Construct a runtype for records of optional values.
 */
export declare function Optional<O extends {
    [_: string]: Rt;
}>(fields: O): Optional<O>;
