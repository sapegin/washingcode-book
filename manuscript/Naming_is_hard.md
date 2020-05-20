## Naming is hard

### Negative booleans

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

### Prefixes, suffixes and abbreviations

TODO: data, list, util, etc. in names

TODO: Don’t go too far with naming conventions — Hungarian notation

TODO: Avoid abbreviations: accepted in smaller scope when the bigger scope has a full name: it’s okay to use `op` inside `filterPurchageOrders` function

TODO: The smaller the scope of a variable the better

TODO: The bigger the scope of a variable the longer should be the name (with a very small scope the name is a bit less important because the code is short and easy to understand)

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

### Beware of imprecise names

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
