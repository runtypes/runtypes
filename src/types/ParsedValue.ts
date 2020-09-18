import { failure, Result } from '../result';
import {
  RuntypeBase,
  Static,
  create,
  Codec,
  innerGuard,
  createGuardVisitedState,
  mapValidationPlaceholder,
  assertRuntype,
} from '../runtype';
import show from '../show';

export interface ParsedValue<TUnderlying extends RuntypeBase<unknown>, TParsed>
  extends Codec<TParsed> {
  readonly tag: 'parsed';
  readonly underlying: TUnderlying;
  readonly config: ParsedValueConfig<TUnderlying, TParsed>;
}

export function isParsedValueRuntype(
  runtype: RuntypeBase,
): runtype is ParsedValue<RuntypeBase, unknown> {
  return 'tag' in runtype && (runtype as ParsedValue<RuntypeBase, unknown>).tag === 'parsed';
}

export interface ParsedValueConfig<TUnderlying extends RuntypeBase<unknown>, TParsed> {
  name?: string;
  parse: (value: Static<TUnderlying>) => Result<TParsed>;
  serialize?: (value: TParsed) => Result<Static<TUnderlying>>;
  test?: RuntypeBase<TParsed>;
}
export function ParsedValue<TUnderlying extends RuntypeBase<unknown>, TParsed>(
  underlying: TUnderlying,
  config: ParsedValueConfig<TUnderlying, TParsed>,
): ParsedValue<TUnderlying, TParsed> {
  assertRuntype(underlying);
  return create<ParsedValue<TUnderlying, TParsed>>(
    'parsed',
    {
      p: (value, _innerValidate, innerValidateToPlaceholder) => {
        return mapValidationPlaceholder<any, TParsed>(
          innerValidateToPlaceholder(underlying, value),
          source => config.parse(source),
          config.test,
        );
      },
      t(value, internalTest) {
        return config.test
          ? internalTest(config.test, value)
          : failure(
              `${config.name || `ParsedValue<${show(underlying)}>`} does not support Runtype.test`,
            );
      },
      s(value, _internalSerialize, _internalSerializeToPlaceholder) {
        if (!config.serialize) {
          return failure(
            `${
              config.name || `ParsedValue<${show(underlying)}>`
            } does not support Runtype.serialize`,
          );
        }
        const testResult = config.test
          ? innerGuard(config.test, value, createGuardVisitedState())
          : undefined;

        if (testResult) {
          return testResult;
        }

        const serialized = config.serialize(value);

        if (!serialized.success) {
          return serialized;
        }

        return _internalSerializeToPlaceholder(underlying, serialized.value);
      },
    },
    {
      underlying,
      config,

      show() {
        return config.name || `ParsedValue<${show(underlying, false)}>`;
      },
    },
  );
}
