// Inspired by https://github.com/Microsoft/TypeScript/issues/165#issuecomment-342989523

import { match, Object, Number, Union, when } from "../../src/index.ts"

const Square = Object({ size: Number })
const Rectangle = Object({ width: Number, height: Number })
const Circle = Object({ radius: Number })

const Shape = Union(Square, Rectangle, Circle)

const area = Shape.match(
	({ size }) => Math.pow(size, 2),
	({ width, height }) => width * height,
	({ radius }) => Math.PI * Math.pow(radius, 2),
)

const hasCorners = match(
	when(Circle, () => false),
	when(Union(Square, Rectangle), () => true),
)