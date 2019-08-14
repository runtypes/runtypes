import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

interface Sym extends Runtype<symbol> {
  tag: 'symbol';
}

/**
 * Validates that a value is a symbol.
 */
const Sym = create<Sym>(
  x => {
    if (typeof x !== 'symbol')
      throw new ValidationError(
        `Expected symbol, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'symbol' },
);

export { Sym as Symbol };
