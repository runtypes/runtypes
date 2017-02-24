import { Union, Literal } from '../index'

const Day = Union(
  Literal('Sunday'),
  Literal('Monday'),
  Literal('Tuesday'),
  Literal('Wednesday'),
  Literal('Thursday'),
  Literal('Friday'),
  Literal('Saturday'),
)

for (const day of Day.alternatives.map(lit => lit.value)) {
  console.log(`Good morning, it's ${day}!`)
}
