import { Runtype, Rt, Static } from '../runtype';
interface Arr<E extends Rt> extends Runtype<Static<E>[]> {
    tag: 'array';
    element: E;
}
/**
 * Construct an array runtype from a runtype for its elements.
 */
declare function Arr<E extends Rt>(element: E): Arr<E>;
export { Arr as Array };
