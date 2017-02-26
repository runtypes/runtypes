import { Runtype, Rt, Static } from '../runtype';
export interface Tuple1<A extends Rt> extends Runtype<[Static<A>]> {
    tag: 'tuple';
    components: [A];
}
export interface Tuple2<A extends Rt, B extends Rt> extends Runtype<[Static<A>, Static<B>]> {
    tag: 'tuple';
    components: [A, B];
}
export interface Tuple3<A extends Rt, B extends Rt, C extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>]> {
    tag: 'tuple';
    components: [A, B, C];
}
export interface Tuple4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>]> {
    tag: 'tuple';
    components: [A, B, C, D];
}
export interface Tuple5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>]> {
    tag: 'tuple';
    components: [A, B, C, D, E];
}
export interface Tuple6<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>]> {
    tag: 'tuple';
    components: [A, B, C, D, E, F];
}
export interface Tuple7<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>]> {
    tag: 'tuple';
    components: [A, B, C, D, E, F, G];
}
export interface Tuple8<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>]> {
    tag: 'tuple';
    components: [A, B, C, D, E, F, G, H];
}
export interface Tuple9<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>]> {
    tag: 'tuple';
    components: [A, B, C, D, E, F, G, H, I];
}
export interface Tuple10<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>, Static<J>]> {
    tag: 'tuple';
    components: [A, B, C, D, E, F, G, H, I, J];
}
/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export declare function Tuple<A extends Rt>(A: A): Tuple1<A>;
export declare function Tuple<A extends Rt, B extends Rt>(A: A, B: B): Tuple2<A, B>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt>(A: A, B: B, C: C): Tuple3<A, B, C>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(A: A, B: B, C: C, D: D): Tuple4<A, B, C, D>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(A: A, B: B, C: C, D: D, E: E): Tuple5<A, B, C, D, E>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F): Tuple6<A, B, C, D, E, F>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Tuple7<A, B, C, D, E, F, G>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Tuple8<A, B, C, D, E, F, G, H>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Tuple9<A, B, C, D, E, F, G, H, I>;
export declare function Tuple<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J): Tuple10<A, B, C, D, E, F, G, H, I, J>;
