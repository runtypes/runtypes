export declare function hasKey<K extends string>(k: K, o: {}): o is {
    [_ in K]: {};
};
