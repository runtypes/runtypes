import { Runtype, create, validationError } from "../runtype";

export interface InstanceOf<V> extends Runtype<V> {
  tag: "instanceof";
  ctor: V;
}

export function InstanceOf<V extends Function>(ctor: V) {
  return create<InstanceOf<V>>(
    x => {
      if (!(x instanceof ctor)) {
        throw validationError(
          `Expected a ${(ctor as any).name} but was ${typeof x}`
        );
      }
      return x as V;
    },
    { tag: "instanceof", ctor: ctor }
  );
}
