import { Runtype, Rt, Static } from '../runtype';
export interface Intersect1<A extends Rt> extends Runtype<Static<A>> {
    tag: 'intersect';
    intersectees: [A];
}
export interface Intersect2<A extends Rt, B extends Rt> extends Runtype<Static<A> & Static<B>> {
    tag: 'intersect';
    intersectees: [A, B];
}
export interface Intersect3<A extends Rt, B extends Rt, C extends Rt> extends Runtype<Static<A> & Static<B> & Static<C>> {
    tag: 'intersect';
    intersectees: [A, B, C];
}
export interface Intersect4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D>> {
    tag: 'intersect';
    intersectees: [A, B, C, D];
}
export interface Intersect5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E];
}
export interface Intersect6<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E, F];
}
export interface Intersect7<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E, F, G];
}
export interface Intersect8<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E, F, G, H];
}
export interface Intersect9<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E, F, G, H, I];
}
export interface Intersect10<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I> & Static<J>> {
    tag: 'intersect';
    intersectees: [A, B, C, D, E, F, G, H, I, J];
}
/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export declare function Intersect<A extends Rt>(A: A): Intersect1<A>;
export declare function Intersect<A extends Rt, B extends Rt>(A: A, B: B): Intersect2<A, B>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt>(A: A, B: B, C: C): Intersect3<A, B, C>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(A: A, B: B, C: C, D: D): Intersect4<A, B, C, D>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(A: A, B: B, C: C, D: D, E: E): Intersect5<A, B, C, D, E>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F): Intersect6<A, B, C, D, E, F>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Intersect7<A, B, C, D, E, F, G>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Intersect8<A, B, C, D, E, F, G, H>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Intersect9<A, B, C, D, E, F, G, H, I>;
export declare function Intersect<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J): Intersect10<A, B, C, D, E, F, G, H, I, J>;
