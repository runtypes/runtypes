import { isRuntype } from './runtype';

export default function showValue(
  value: unknown,
  remainingDepth: number = 3,
  remainingLength: number = 30,
): string {
  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'number':
      return `${value}`;
    case 'string':
      return JSON.stringify(value);
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        if (remainingDepth === 0 || remainingLength === 0) {
          return '[Array]';
        } else {
          let result = '[';
          let i = 0;
          for (i = 0; i < value.length && remainingLength > result.length; i++) {
            if (i !== 0) result += ', ';
            result += showValue(value[i], remainingDepth - 1, remainingLength - result.length);
          }
          if (i < value.length) {
            result += ' ... ';
          }
          result += ']';
          return result;
        }
      }
      if (isRuntype(value)) {
        return value.toString();
      }
      if (remainingDepth === 0) {
        return '{Object}';
      } else {
        const props = Object.entries(value);
        let result = '{';
        let i = 0;
        for (i = 0; i < props.length && remainingLength > result.length; i++) {
          if (i !== 0) result += ', ';
          const [key, v] = props[i];
          result += `${/\s/.test(key) ? JSON.stringify(key) : key}: ${showValue(
            v,
            remainingDepth - 1,
            remainingLength - result.length,
          )}`;
        }
        if (i < props.length) {
          result += ' ... ';
        }
        result += '}';
        return result;
      }
    case 'function':
    case 'symbol':
    case 'undefined':
    default:
      return typeof value;
  }
}
export function showValueNonString(value: unknown): string {
  return `${showValue(value)}${typeof value === 'string' ? ` (i.e. a string literal)` : ``}`;
}
