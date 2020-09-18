import { expected, success } from '../result';
import { create, Codec } from '../runtype';

export interface Enum<TEnum extends { [key: string]: number | string }>
  extends Codec<TEnum[keyof TEnum]> {
  readonly tag: 'enum';
  readonly enumObject: TEnum;
}

export function Enum<TEnum extends { [key: string]: number | string }>(
  name: string,
  e: TEnum,
): Enum<TEnum> {
  const values = Object.values(e);
  const enumValues = new Set(
    values.some(v => typeof v === 'number') ? values.filter(v => typeof v === 'number') : values,
  );
  return create<Enum<TEnum>>(
    'enum',
    value => (enumValues.has(value as any) ? success(value as any) : expected(name, value)),
    {
      enumObject: e,
      show: () => name,
    },
  );
}
