import { Runtype } from './runtype';
import { ValidationError } from './errors';

type PropKey = string | symbol;
const prototypes = new WeakMap<any, Map<PropKey, number[]>>();

/**
 * A parameter decorator. Explicitly mark the parameter as checked on every method call in combination with `@checked` method decorator. The number of `@check` params must be the same as the number of provided runtypes into `@checked`.\
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype3)
 * method(@check p1: Static1, p2: number, @check p3: Static3) { ... }
 * ```
 */
export function check(target: any, propertyKey: PropKey, parameterIndex: number) {
  const prototype = prototypes.get(target) || new Map();
  prototypes.set(target, prototype);

  const validParameterIndices = prototype.get(propertyKey) || [];
  prototype.set(propertyKey, validParameterIndices);

  validParameterIndices.push(parameterIndex);
}

function getValidParameterIndices(target: any, propertyKey: PropKey, runtypeCount: number) {
  const prototype = prototypes.get(target);
  const validParameterIndices = prototype && prototype.get(propertyKey);
  if (validParameterIndices) {
    // used with `@check` parameter decorator
    return validParameterIndices;
  }

  const indices = [];
  for (let i = 0; i < runtypeCount; i++) {
    indices.push(i);
  }
  return indices;
}

/**
 * A method decorator. Takes runtypes as arguments which correspond to the ones of the actual method.
 *
 * Usually, the number of provided runtypes must be _**the same as**_ or _**less than**_ the actual parameters.
 *
 * If you explicitly mark which parameter shall be checked using `@check` parameter decorator, the number of `@check` parameters must be _**the same as**_ the runtypes provided into `@checked`.
 *
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype2)
 * method1(param1: Static1, param2: Static2, param3: any) {
 *   ...
 * }
 *
 * @checked(Runtype1, Runtype3)
 * method2(@check param1: Static1, param2: any, @check param3: Static3) {
 *   ...
 * }
 * ```
 */
export function checked(...runtypes: Runtype[]) {
  if (runtypes.length === 0) {
    throw new Error('No runtype provided to `@checked`. Please remove the decorator.');
  }
  return (target: any, propertyKey: PropKey, descriptor: PropertyDescriptor) => {
    const method: Function = descriptor.value!;
    const methodId =
      (target.name || target.constructor.name + '.prototype') +
      (typeof propertyKey === 'string' ? `["${propertyKey}"]` : `[${String(propertyKey)}]`);

    const validParameterIndices = getValidParameterIndices(target, propertyKey, runtypes.length);
    if (validParameterIndices.length !== runtypes.length) {
      throw new Error('Number of `@checked` runtypes and @check parameters not matched.');
    }
    if (validParameterIndices.length > method.length) {
      throw new Error('Number of `@checked` runtypes exceeds actual parameter length.');
    }

    descriptor.value = function(...args: any[]) {
      runtypes.forEach((type, typeIndex) => {
        const parameterIndex = validParameterIndices[typeIndex];
        const validated = type.validate(args[parameterIndex]);
        if (!validated.success) {
          throw new ValidationError(
            `${methodId}, argument #${parameterIndex}: ${validated.message}`,
            validated.key,
          );
        }
      });
      return method.apply(this, args);
    };
  };
}
