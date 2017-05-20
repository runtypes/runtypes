import { Static, Union, Literal } from '../index'

// Define the runtype
const Day = Union(
  Literal('Sunday'),
  Literal('Monday'),
  Literal('Tuesday'),
  Literal('Wednesday'),
  Literal('Thursday'),
  Literal('Friday'),
  Literal('Saturday'),
)

// Extract the static type
type Day = Static<typeof Day> // = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

// Extract enumerated literal values
const days: Day[] = Day.alternatives.map(lit => lit.value)

for (const day of days) {
  console.log(`Good morning, it's ${day}!`)
}
