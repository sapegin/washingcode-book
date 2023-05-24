### Naming is hard

#### Negative booleans

Consider this code:

```js
function validateInputs(values) {
  let noErrorsFound = true;
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
    noErrorsFound = false;
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
    noErrorsFound = false;
  }

  if (!noErrorsFound) {
    this.set('error_message', errorMessages);
  }

  return noErrorsFound;
}
```

I can say a lot about this code but let’s focus on this line first:

<!-- test-skip -->

```js
if (!noErrorsFound) {
}
```

This double negation, “if not no errors found…”, makes it harder to read than necessary. And in most cases you can avoid it.

Let’s make the `noErrorsFound` variable positive:

```js
function validateInputs(values) {
  let errorsFound = false;
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
    errorsFound = true;
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
    errorsFound = true;
  }

  if (errorsFound) {
    this.set('error_message', errorMessages);
  }

  return !errorsFound;
}
```

Positive names and positive conditions are usually easier to read then negative ones.

Hopefully by this time you’ve noticed that we don’t need this `errorsFound` variable at all: its value can alway be derived from `errorMessages`:

```js
function validateInputs(values) {
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
  }

  if (errorMessages.length > 0) {
    this.set('error_message', errorMessages);
    return false;
  }

  return true;
}
```

I’d also split this method into two to isolate side effects and make this code more testable, then remove the condition around `this.set('error_message', errorMessages)`, setting an empty object when there are no errors seems safe enough:

```js
function getErrorMessages(values) {
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
  }

  return errorMessages;
}

function validateInputs(values) {
  const errorMessages = getErrorMessages(values);
  this.set('error_message', errorMessages);

  return errorMessages.length == 0;
}
```

TODO:

<!-- const $ = () => ({toggleClass: () => {}, attr: () => {}}), data = [], bookID = 'book' -->

```js
const noData = data.length === 0;
$(`#${bookID}_download`).toggleClass('hidden-node', noData);
$(`#${bookID}_retry`).attr('disabled', !noData);
```

### The larger the scope, the longer the name

My rule of thumb: the shorter the scope of a variable, the shorter should be its name.

Consider these two examples:

<!-- const TRANSITION = {'0xbada55': 0, '0xc0ffee': 1}, BREAKPOINT_MOBILE = 480, BREAKPOINT_TABLET = 768, BREAKPOINT_DESKTOP = 1024 -->

```js
const inputRange = Object.keys(TRANSITION).map(x => parseInt(x, 16));

const breakpoints = [
  BREAKPOINT_MOBILE,
  BREAKPOINT_TABLET,
  BREAKPOINT_DESKTOP
].map(x => `${x}px`);
```

<!--
expect(inputRange).toEqual([12245589, 12648430])
expect(breakpoints).toEqual(['480px', '768px', '1024px'])
-->

Here, it’s clear what `x` is, and a longer name would bloat the code without making it more readable, likely less. The name is read in the parent function: we’re mapping over the `TRANSITION` object keys, and parse each key, or we’re mapping over a list of breakpoints, and convert them to strings. It also helps that here we only have a single variable, so any short name will be read as "whatever we’re mapping over".

On the other hand, when the scope is longer, or when we have multiple variables, short names could be confusing:

```js
const hasDiscount = customers => {
  let result = false;
  const customerIds = Object.keys(customers);
  for (let k = 0; k < customerIds.length; k++) {
    const c = customers[customerIds[k]];
    if (c.ages) {
      for (let j = 0; j < c.ages.length; j++) {
        const a = c.ages[j];
        if (a && a.customerCards.length) {
          result = true;
          break;
        }
      }
    }
    if (result) {
      break;
    }
  }
  return result;
};
```

<!--
expect(hasDiscount({gandalf: {}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}]}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}, {customerCards: ['DISCOUNT']}]}})).toBe(true)
expect(hasDiscount({gandalf: {ages: [{customerCards: ['DISCOUNT']}]}})).toBe(true)
-->

Here, it’s absolutely impossible to understand what’s going on, and meaningless names are one of the main reasons for this.

Let’s try to refactor it a bit:

```js
const hasDiscount = customers => {
  return Object.entries(customers).some(([customerId, customer]) => {
    return customer.ages?.some(
      ageGroup => ageGroup.customerCards.length > 0
    );
  });
};
```

<!--
expect(hasDiscount({gandalf: {}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}]}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}, {customerCards: ['DISCOUNT']}]}})).toBe(true)
expect(hasDiscount({gandalf: {ages: [{customerCards: ['DISCOUNT']}]}})).toBe(true)
-->

Not only the refactored code is three times shorter but it’s also much clearer: are there any (some) customers with at least one customer card in any (some) age group?

#### Prefixes, suffixes and abbreviations

TODO: data, list, util, etc. in names

TODO: Don’t go too far with naming conventions — Hungarian notation

TODO: Avoid abbreviations: accepted in smaller scope when the bigger scope has a full name: it’s okay to use `op` inside `filterPurchageOrders()` function

TODO: The smaller the scope of a variable the better

TODO: Use destructuring to avoid inventing a new variable name: function parameters, result of function call

TODO: Shorten variable life by grouping code that’s using this variable together

TODO: Avoid slang or words that have simpler alternative, non-native English speakers will thank you. https://github.com/facebook/react/issues/3951

Types (like Flow or TypeScript) helps to see when names don’t represent the data correctly:

```ts
type Order = {
  id: number;
  title: string;
};

type State = {
  filteredOrder: Order[];
  selectedOrder: number[];
};
```

Looking at the types it’s clear that both names should be plural (they keep arrays) and the second one only contains order IDs but not whole order objects:

<!-- type Order = { id: number, title: string } -->

```ts
type State = {
  filteredOrders: Order[];
  selectedOrderIds: number[];
};
```

TODO: `util` and `utils` (what about them?): keep each function in it’s own file

> Aside: Make a util directory and keep different utilities in different files. A single util file will always grow until it is too big and yet too hard to split apart. Using a single util file is unhygienic.

#### Beware of imprecise names

Imprecise or incorrect names are worse than magic numbers. With magic numbers you can make a correct guess but with incorrect names you have no chances to understand the code.

Consider this example:

```js
// Constant used to correct a Date object's time to reflect a UTC timezone
const TIMEZONE_CORRECTION = 60000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * TIMEZONE_CORRECTION
  );
```

Even a comment doesn’t help to understand what this code does.

What’s actually happening here is `getTime()` returns milliseconds and `getTimezoneOffset()` returns minutes, so we need to convert minutes to milliseconds by multiplying minutes by the number of milliseconds in one minute. 60000 is exactly this number.

Let’s correct the name:

```js
const MILLISECONDS_IN_MINUTE = 60000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
  );
```

Now it’s much easer to understand the code.
