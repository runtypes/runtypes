import { Result } from '../result';
import {
  RuntypeBase,
  Static,
  create,
  Codec,
  innerGuard,
  createGuardVisitedState,
  mapValidationPlaceholder,
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
  return create<ParsedValue<TUnderlying, TParsed>>(
    {
      validate: (value, _innerValidate, innerValidateToPlaceholder) => {
        return mapValidationPlaceholder<any, TParsed>(
          innerValidateToPlaceholder(underlying, value),
          source => {
            return config.parse(source);
          },
          config.test,
        );
      },
      test(value, internalTest) {
        if (config.test) {
          return internalTest(config.test, value);
        } else {
          return {
            success: false,
            message: `${
              config.name || `ParsedValue<${show(underlying)}>`
            } does not support Runtype.test`,
          };
        }
      },
      serialize(value, _internalSerialize, _internalSerializeToPlaceholder) {
        if (!config.serialize) {
          return {
            success: false,
            message: `${
              config.name || `ParsedValue<${show(underlying)}>`
            } does not support Runtype.serialize`,
          };
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
      tag: 'parsed',
      underlying,
      config,

      show({ showChild }) {
        return config.name || `ParsedValue<${showChild(underlying, false)}>`;
      },
    },
  );
}
