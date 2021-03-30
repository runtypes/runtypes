// Inspired by https://github.com/Microsoft/TypeScript/issues/165#issuecomment-342989523

import { match, Record, Number, Union, Static } from 'runtypes';

const Square = Record({ size: Number });
const Rectangle = Record({ width: Number, height: Number });
const Circle = Record({ radius: Number });

const Shape = Union(Square, Rectangle, Circle);

const area = Shape.match(
  ({ size }) => Math.pow(size, 2),
  ({ width, height }) => width * height,
  ({ radius }) => Math.PI * Math.pow(radius, 2),
);

const hasCorners = match([Circle, () => false], [Union(Square, Rectangle), () => true]);
