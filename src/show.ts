import { RuntypeBase } from './runtype';
import { isLazyRuntype } from './types/lazy';

const show = (needsParens: boolean, circular: Set<RuntypeBase<unknown>>) => (
  runtype: RuntypeBase<unknown>,
): string => {
  const parenthesize = (s: string) => (needsParens ? `(${s})` : s);
  const showChild = (runtype: RuntypeBase<unknown>, needsParens: boolean) =>
    show(needsParens, circular)(runtype);

  if (circular.has(runtype)) {
    if (isLazyRuntype(runtype)) {
      const underlying = runtype.underlying();
      if (underlying !== runtype) {
        return show(needsParens, circular)(underlying);
      }
    }
    return parenthesize(`CIRCULAR ${runtype.tag}`);
  }

  if (runtype.show) {
    circular.add(runtype);

    try {
      return runtype.show({ parenthesize, showChild, needsParens });
    } finally {
      circular.delete(runtype);
    }
  }

  return runtype.tag;
};

export default show(false, new Set<RuntypeBase>());
