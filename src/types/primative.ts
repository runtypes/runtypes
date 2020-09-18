import { failure, success } from '../result';
import { create, Codec } from '../runtype';
import { showValueNonString } from '../showValue';

export interface Boolean extends Codec<boolean> {
  readonly tag: 'boolean';
}

export interface Function extends Codec<(...args: any[]) => any> {
  readonly tag: 'function';
}

export interface Number extends Codec<number> {
  readonly tag: 'number';
}

export interface String extends Codec<string> {
  readonly tag: 'string';
}

interface Sym extends Codec<symbol> {
  readonly tag: 'symbol';
}

function createPrimative<
  TType extends 'boolean' | 'function' | 'number' | 'string' | 'symbol',
  TValue
>(type: TType): Codec<TValue> & { readonly tag: TType } {
  return create<Codec<TValue> & { readonly tag: TType }>(
    type,
    value =>
      typeof value === type
        ? success<TValue>(value)
        : failure(`Expected ${type}, but was ${showValueNonString(value)}`),
    {},
  );
}

/**
 * Validates that a value is a boolean.
 */
export const Boolean: Boolean = createPrimative('boolean');

/**
 * Validates that a value is a function.
 */
export const Function: Function = createPrimative('function');

/**
 * Validates that a value is a number.
 */
export const Number: Number = createPrimative('number');

/**
 * Validates that a value is a string.
 */
export const String: String = createPrimative('string');

/**
 * Validates that a value is a symbol.
 */
const Sym: Sym = createPrimative('symbol');
export { Sym as Symbol };
