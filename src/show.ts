import { RuntypeBase } from './runtype';

export const parenthesize = (s: string, needsParens: boolean) => (needsParens ? `(${s})` : s);
const circular = new Set<RuntypeBase<unknown>>();
const show = (runtype: RuntypeBase<unknown>, needsParens: boolean = false): string => {
  if (circular.has(runtype) && runtype.tag !== 'lazy') {
    return parenthesize(`CIRCULAR ${runtype.tag}`, needsParens);
  }

  if (runtype.show) {
    circular.add(runtype);

    try {
      return runtype.show(needsParens);
    } finally {
      circular.delete(runtype);
    }
  }

  return runtype.tag;
};

export default show;
