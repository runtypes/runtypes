import { Runtype, Static, create, validationError } from '../runtype';

interface Arr<E extends Runtype> extends Runtype<Static<E>[]> {
  tag: 'array';
  element: E;
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Runtype>(element: E): Arr<E> {
  return create<Arr<E>>(
    xs => {
      if (!Array.isArray(xs)) throw validationError(`Expected array, but was ${typeof xs}`);

      for (const x of xs) {
        try {
          element.check(x);
        } catch ({ message, key }) {
          throw validationError(message, key ? `[${xs.indexOf(x)}].${key}` : `[${xs.indexOf(x)}]`);
        }
      }

      return xs;
    },
    { tag: 'array', element },
  );
}

export { Arr as Array };
