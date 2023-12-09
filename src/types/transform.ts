import { Runtype, RuntypeBase, Static, create } from '../runtype';
import { FAILURE, SUCCESS } from '../util';

export type Transformer<A extends RuntypeBase, B> = (value: Static<A>) => B;

export interface Transform<A extends RuntypeBase, B> extends Runtype<Static<A>, B> {
  tag: 'transform';
  validator: A;
  transformer: Transformer<A, B>;
}

export function Transform<A extends RuntypeBase, B>(
  validator: A,
  transformer: Transformer<A, B>,
): Transform<A, B> {
  return create<Transform<A, B>>(
    value => {
      const validated = validator.validate(value);
      if (!validated.success) return validated;
      try {
        const value = transformer(validated.value);
        return SUCCESS(value);
      } catch (error) {
        return FAILURE.TRANSFORM_FAILED(error);
      }
    },
    {
      tag: 'transform',
      validator,
      transformer,
    },
  );
}
