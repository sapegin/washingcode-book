## Constants

There are many good reasons to use constants and some good reasons not to use them.

### Making magic numbers less magic

By introducing a constant instead of a magic number we give it a meaningful name. Consider this example:

```js
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / 3600);
```

Most likely you’ll guess that 3600 is the number of seconds in an hour, but the actual number is less important than what this code does, and we can make this clear by moving the magic number to a const:

```js
const SECONDS_IN_AN_HOUR = 3600;
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / SECONDS_IN_AN_HOUR);
```

I like to include a unit in a name if it’s not obvious otherwise:

```js
const FADE_TIMEOUT_MS = 2000;
```

Another perfect example where constants makes code more readable is days of week:

```
<Calendar disabledDaysOfWeek={[1, 6]} />
```

Is 6 Saturday, Sunday or Monday? Are we counting from 0 or 1? Does week start on Monday or Sunday?

Defining constants for these values makes it clear:

```
const WEEKDAY_MONDAY = 1;
const WEEKDAY_SATURDAY = 6;
// …
<Calendar disabledDaysOfWeek={[WEEKDAY_MONDAY, WEEKDAY_SATURDAY]} />
```

Code reuse is another good reason to introduce constants but you need to wait for the moment when the code is actually reused.

### Not all numbers are magic

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

But not every value is magic, some values are just values. Here it’s clear that the value is the width of the ID column, and a constant doesn’t add any information that’s not in the code already, but makes the code harder to read: you need to go to the constant definition to see the actual value.

Often code reads perfectly even without constants:

<!-- const Modal = () => <></>; -->

```jsx
<Modal title="Out of cheese error" minWidth="50vw" />
```

Here it’s clear that the minimum width of a modal is 50vw. Adding a constant won’t make this code any clearer:

<!-- const Modal = () => <></>; -->

```jsx
const MODAL_MIN_WIDTH = '50vw';
// ...
<Modal title="Out of cheese error" minWidth={MODAL_MIN_WIDTH} />;
```

I’d avoid such constants unless the values are reused.

Sometimes such constants are even misleading:

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

Here the name is not precise: instead of minimum width it only has width.

Often 0 and 1 aren’t magic and code with them is easier to understand than with constant that will inevitably have awkward names:

```js
const DAYS_TO_ADD_IN_TO_FIELD = 1;
const SECONDS_TO_REMOVE_IN_TO_FIELD = -1;
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), DAYS_TO_ADD_IN_TO_FIELD);
  return addSeconds(nextDay, SECONDS_TO_REMOVE_IN_TO_FIELD);
};
```

This function returns the last second of a day. And here 1 and -1 really mean “next” and “previous”. They are also an essential part of an algorithm, not configuration. It doesn’t make sense to change 1 to 2, because it will break the function. Constants make the code longer and don’t help with understanding it. Let’s remove them:

```js
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), 1);
  return addSeconds(nextDay, -1);
};
```

Now the code is short and clear, with enough information to understand it.

---

Start thinking about:

- Is a literal value, like a number or a string, is unclear and needs a name?
- Is value of a literal unclear and we can use a constant?
- Is knowing the value itself is less important to understanding the code than knowing the name?
- Is a value reused multiple times?
