import { Runtype, create } from '../runtype';

interface Sym extends Runtype<symbol> {
  readonly tag: 'symbol';
}

/**
 * Validates that a value is a symbol.
 */
const Sym: Sym = create<Sym>(
  value =>
    typeof value === 'symbol'
      ? { success: true, value }
      : {
          success: false,
          message: `Expected symbol, but was ${value === null ? value : typeof value}`,
        },
  { tag: 'symbol' },
);

export { Sym as Symbol };
