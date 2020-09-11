import { RuntypeBase, Static } from './runtype';

export function assertType<TRuntypeBase extends RuntypeBase>(
  rt: TRuntypeBase,
  v: unknown,
): asserts v is Static<TRuntypeBase> {
  rt.assert(v);
}
