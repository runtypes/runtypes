import { Runtype, create } from '../runtype';
import { ValidationError } from '../errors';

interface Sym extends Runtype<symbol> {
  tag: 'symbol';
}

function guard(x: unknown): x is symbol {
  return typeof x === 'symbol';
}

/**
 * Validates that a value is a symbol.
 */
const Sym = create<Sym>(
  x => {
    if (!guard(x))
      throw new ValidationError(
        `Expected symbol, but was ${x === null || x === undefined ? x : typeof x}`,
      );
    return x;
  },
  { tag: 'symbol', guard },
);

export { Sym as Symbol };
