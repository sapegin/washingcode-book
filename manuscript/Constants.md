### Constants

There are many good reasons to use constants and some good reasons not to use them.

#### Making magic numbers less magic

By introducing a constant instead of a magic number we give it a meaningful name. Consider this example:

```js
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / 3600);
```

<!-- expect(getHoursSinceLastChange(36000)).toBe(10) -->

A seasoned developer would likely guess that 3600 is the number of seconds in an hour, but the actual number is less important than what this code does, and we can make it clear by moving the magic number to a constant:

```js
const SECONDS_IN_AN_HOUR = 3600;
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / SECONDS_IN_AN_HOUR);
```

<!-- expect(getHoursSinceLastChange(36000)).toBe(10) -->

I like to include a unit in a name if it’s not obvious otherwise:

```js
const FADE_TIMEOUT_MS = 2000;
```

Another perfect example where constants make code more readable is days of week:

<!--
const Calendar = props => <div>{props.disabledDaysOfWeek.join(':')}</div>;
const Test = () => (
-->

```jsx
<Calendar disabledDaysOfWeek={[1, 6]} />
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('1:6')
-->

Is 6 Saturday, Sunday or Monday? Are we counting from 0 or 1? Does week start on Monday or Sunday?

Defining constants for these values makes it clear:

```js
const WEEKDAY_MONDAY = 1;
const WEEKDAY_SATURDAY = 6;
```

<!-- -->

<!--
const WEEKDAY_MONDAY = 1;
const WEEKDAY_SATURDAY = 6;
const Calendar = props => <div>{props.disabledDaysOfWeek.join(':')}</div>;
const Test = () => (
-->

```jsx
<Calendar disabledDaysOfWeek={[WEEKDAY_MONDAY, WEEKDAY_SATURDAY]} />
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('1:6')
-->

However, having a clear name is sometimes not enough:

<!-- const date = '2023-03-22T08:20:00+01:00' -->

```js
const CHARACTERS_IN_ISO_DATE = 10;
const dateWithoutTime = date.slice(0, CHARACTERS_IN_ISO_DATE);
```

<!-- expect(dateWithoutTime).toBe('2023-03-22') -->

Here, we remove the time portion of a string containing date ane time in ISO format (for example, `2023-03-22T08:20:00+01:00`) by keeping only the first 10 characters – the length of the date part. The name is quite clear but the code is still a bit confusing and brittle. We can do better:

<!-- const date = '2023-03-22T08:20:00+01:00' -->

```js
const DATE_FORMAT_ISO = 'YYYY-MM-DD';
const dateWithoutTime = date.slice(0, DATE_FORMAT_ISO.length);
```

<!-- expect(dateWithoutTime).toBe('2023-03-22') -->

Now, it’s easier to visualize what the code is doing, and we don’t need to count characters manually to be sure that The Very Magic number 10 is correct.

Code reuse is another good reason to introduce constants. However, we need to wait for the moment when the code is actually reused.

#### Not all numbers are magic

Sometimes people replace absolutely all literal values with constants, ideally stored in a separate module:

```js
const ID_COLUMN_WIDTH = 40;
const TITLE_COLUMN_WIDTH = 120;
const TYPE_COLUMN_WIDTH = 60;
const DATE_ADDED_COLUMN_WIDTH = 50;
const CITY_COLUMN_WIDTH = 80;
const COUNTRY_COLUMN_WIDTH = 90;
const USER_COLUMN_WIDTH = 70;
const STATUS_COLUMN_WIDTH = 50;
const columns = [
  {
    header: 'ID',
    accessor: 'id',
    width: ID_COLUMN_WIDTH
  }
  // …
];
```

<!-- expect(columns[0].width).toBe(40) -->

But not every value is magic, some values are just values. Here it’s clear that the value is the width of the ID column, and a constant doesn’t add any information that’s not in the code already, but makes the code harder to read: we need to go to the constant definition to see the actual value.

Often, code reads perfectly even without constants:

<!--
const Modal = (props) => <div>{props.title}:{props.minWidth}</div>;
const Test = () => (
-->

```jsx
<Modal title="Out of cheese error" minWidth="50vw" />
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('Out of cheese error:50vw')
-->

Here it’s clear that the minimum width of a modal is 50vw. Adding a constant won’t make this code any clearer:

```js
const MODAL_MIN_WIDTH = '50vw';
```

<!-- -->

<!--
const MODAL_MIN_WIDTH = '50vw';
const Modal = (props) => <div>{props.title}:{props.minWidth}</div>;
const Test = () => (
-->

```jsx
<Modal title="Out of cheese error" minWidth={MODAL_MIN_WIDTH} />
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('Out of cheese error:50vw')
-->

I’d avoid such constants unless the values are reused.

Sometimes, such constants are even misleading:

```js
const ID_COLUMN_WIDTH = 40;
const columns = [
  {
    header: 'ID',
    accessor: 'id',
    minWidth: ID_COLUMN_WIDTH
  }
];
```

<!-- expect(columns[0].minWidth).toBe(40) -->

Here, the name is not precise: instead of minimum width it only has width.

Often, _zeroes_ and _ones_ aren’t magic, and code is easier to understand when we use `0` and `1` directly instead of constants with inevitably awkward names:

<!--
const addDays = (x, y) => x + y * 10
const addSeconds = (x, y) => x + y
const startOfDay = x => x - 0.1
-->

```js
const DAYS_TO_ADD_IN_TO_FIELD = 1;
const SECONDS_TO_REMOVE_IN_TO_FIELD = -1;
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), DAYS_TO_ADD_IN_TO_FIELD);
  return addSeconds(nextDay, SECONDS_TO_REMOVE_IN_TO_FIELD);
};
```

<!-- expect(getEndOfDayFromDate(10)).toBe(18.9) -->

This function returns the last second of a day. And here 1 and -1 really mean “next” and “previous”. They are also an essential part of an algorithm, not configuration. It doesn’t make sense to change 1 to 2, because it will break the function. Constants make the code longer and don’t help with understanding it. Let’s remove them:

<!--
const addDays = (x, y) => x + y * 10
const addSeconds = (x, y) => x + y
const startOfDay = x => x - 0.1
-->

```js
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), 1);
  return addSeconds(nextDay, -1);
};
```

<!-- expect(getEndOfDayFromDate(10)).toBe(18.9) -->

Now, the code is short and clear, with enough information to understand it.

#### Group related constants

We often use constans for ranges of values:

```js
const SMALL = 'small';
const MEDIUM = 'medium';
```

These constants are related – they define different values of the same scale, size of something, and likely could be used interchangeably. However, it’s not clear from the names that they are related. We could add a suffix:

```js
const SMALL_SIZE = 'small';
const MEDIUM_SIZE = 'medium';
```

Now, it’s clear that these values are related, thanks to the `_SIZE` suffix. But we can do better:

```js
const SIZE_SMALL = 'small';
const SIZE_MEDIUM = 'medium';
```

Here, the common part of the names, the `SIZE_` prefix, is aligned. I call this _parallel coding_. (We talk more about parallel coding in the [Don’t make me think](#dont-make-me-think) chapter.)

Another option is to use an object:

```js
const SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium'
};
```

It has some additional benefits over separate constants:

- We only need to import it once (`import { SIZE } from '...'` vs `import { SIZE_SMALL, SIZE_MEDIUM } from '...'`).
- Better autocomplete after typing `SIZE.`

And yet another option is to use a TypeScript enum:

```ts
enum Size {
  Small = 'small',
  Medium = 'medium'
}
```

Which is essentially the same as an object but we can also use it as a type:

```ts
interface ButtonProps {
  size: Size;
}
```

The latter would be my choice for TypeScript.

---

Start thinking about:

- Is a literal value, like a number or a string, is unclear and needs a name?
- Is knowing the value itself is less important to understand the code than knowing the name?
- Is a value reused multiple times?
- Is a value represents the configuration or an essential part of an algorithm?
- Are several constants representing a range or a scale, and could be merged into an object or enum?
