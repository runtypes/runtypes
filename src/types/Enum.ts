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
    value => {
      if (enumValues.has(value as any)) {
        return { success: true, value: value as any };
      } else {
        return {
          success: false,
          message: `Expected ${name}, but was '${value}'`,
        };
      }
    },
    {
      tag: 'enum',
      enumObject: e,
      show: () => name,
    },
  );
}
