import { Runtype, Static, createIncremental } from '../runtype';

interface Arr<E extends Runtype> extends Runtype<Static<E>[]> {
  tag: 'array';
  element: E;
}

/**
 * Construct an array runtype from a runtype for its elements.
 */
function Arr<E extends Runtype>(element: E): Arr<E> {
  return createIncremental<Arr<E>>(
    function*(xs) {
      if (!Array.isArray(xs)) yield `Expected array but was ${typeof xs}`;
      else for (const x of xs) for (const message of element._checkIncrementally(x)) yield message;
    },
    { tag: 'array', element },
  );
}

export { Arr as Array };
