import { Runtype, Rt, Static } from '../runtype';
export interface StringDictionary<V extends Rt> extends Runtype<{
    [_: string]: Static<V>;
}> {
    tag: 'dictionary';
    key: 'string';
    value: V;
}
export interface NumberDictionary<V extends Rt> extends Runtype<{
    [_: number]: Static<V>;
}> {
    tag: 'dictionary';
    key: 'number';
    value: V;
}
/**
 * Construct a runtype for arbitrary dictionaries.
 */
export declare function Dictionary<V extends Rt>(v: V, key?: 'string'): StringDictionary<V>;
export declare function Dictionary<V extends Rt>(v: V, key?: 'number'): NumberDictionary<V>;
