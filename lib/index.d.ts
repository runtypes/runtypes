export declare type Success<A> = {
    success: true;
    value: A;
};
export declare type Failure = {
    success: false;
    message: string;
};
export declare type Result<A> = Success<A> | Failure;
export declare type Validator<A> = {
    falseWitness: A;
    coerce(x: {}): A;
    validate(x: {}): Result<A>;
    guard(x: {}): x is A;
};
export declare const anything: Validator<{}>;
export declare const nothing: Validator<never>;
export declare const boolean: Validator<boolean>;
export declare const number: Validator<number>;
export declare const string: Validator<string>;
export declare function literal<K extends string | number | boolean>(l: K): Validator<K>;
export declare function array<A>(v: Validator<A>): Validator<A[]>;
export declare function tuple<A>(a: Validator<A>, strict?: boolean): Validator<[A]>;
export declare function tuple<A, B>(a: Validator<A>, b: Validator<B>, strict?: boolean): Validator<[A, B]>;
export declare function tuple<A, B, C>(a: Validator<A>, b: Validator<B>, c: Validator<C>, strict?: boolean): Validator<[A, B, C]>;
export declare function tuple<A, B, C, D>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, strict?: boolean): Validator<[A, B, C, D]>;
export declare function tuple<A, B, C, D, E>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, strict?: boolean): Validator<[A, B, C, D, E]>;
export declare function tuple<A, B, C, D, E, F>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, strict?: boolean): Validator<[A, B, C, D, E, F]>;
export declare function tuple<A, B, C, D, E, F, G>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, g: Validator<G>, strict?: boolean): Validator<[A, B, C, D, E, F, G]>;
export declare function record<O>(validators: {
    [K in keyof O]: Validator<O[K]>;
}): Validator<O>;
export declare function union(): Validator<never>;
export declare function union<A>(a: Validator<A>): Validator<A>;
export declare function union<A, B>(a: Validator<A>, b: Validator<B>): Validator<A | B>;
export declare function union<A, B, C>(a: Validator<A>, b: Validator<B>, c: Validator<C>): Validator<A | B | C>;
export declare function union<A, B, C, D>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>): Validator<A | B | C | D>;
export declare function union<A, B, C, D, E>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>): Validator<A | B | C | D | E>;
export declare function union<A, B, C, D, E, F>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>): Validator<A | B | C | D | E | F>;
export declare function union<A, B, C, D, E, F, G>(a: Validator<A>, b: Validator<B>, c: Validator<C>, d: Validator<D>, e: Validator<E>, f: Validator<F>, g: Validator<G>): Validator<A | B | C | D | E | F | G>;
