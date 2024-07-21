{#no-reassigning}

# Avoid reassigning variables

<!-- description: Improving code readability by making it easier to understand what variables are doing and how they are used in the code -->

Reassigning variables is like changing the past. When we see code like this:

```js
let pizzaTopping = 'salami';
```

<!-- expect(pizzaTopping).toBe('salami') -->

We can’t be sure that our pizza will always have salami on it because variables defined using the `let` keyword can be _reassigned_:

<!-- let pizzaTopping -->

```js
pizzaTopping = 'champignon';
```

<!-- expect(pizzaTopping).toBe('champignon') -->

No salami anymore!

We can even assign it a value of another type:

<!-- let pizzaTopping -->

```js
pizzaTopping = 42;
```

<!-- expect(pizzaTopping).toBe(42) -->

Knowing that this is possible makes us wonder, every time we see `pizzaTopping` in the code, which value it has _now_. That’s a huge and unnecessary cognitive load that we should avoid.

We can declare a variable using the `const` keyword to disallow reassignments:

```js
const pizzaTopping = 'salami';
```

<!-- expect(pizzaTopping).toBe('salami') -->

This pizza will always have salami on it!

I> The `const` and `let` keywords are relatively new in JavaScript, and were introduced in ECMAScript 2015. Before that, we only had the `var` keyword, which is no longer recommended. The main difference is that the `const` and `let` are block-scoped, while the `var` is function-scoped. Additionally, we can now choose whether to allow reassignments or not, depending on which keyword we use to declare a variable.

Most of the time, we can write code without reassignments, making it easier to reason about.

I> Arrays and objects can also be _mutated_, even if they are defined using the `const` keyword. We talk about mutation in the [next chapter](#no-mutation).

## Don’t reuse variables

Sometimes, a variable is reused to store different values:

<!-- const loadCategory = (id) => [{name: `${id}1`, onSale: false}, {name: `${id}2`, onSale: true}] -->

```js
function getProductsOnSale(category) {
  category = loadCategory(category);
  category = category.filter(product => product.onSale);
  return category;
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([{name: 'pizzas2', onSale: true}]) -->

Here, the `category` variable is used to store a category ID (a number or a string), a list of products in a category (an array), and a list of filtered products (also an array). This function isn’t completely hopeless because it’s short, but imagine more code between each reassignment.

On top of that, a new value is reassigned to a function parameter, which is known as _function parameter shadowing_. I think it’s no different from regular reassignment since it only affects the value inside the function, so I’ll treat it the same way.

I> [Variable shadowing](https://en.wikipedia.org/wiki/Variable_shadowing) happens when we define a variable with the same name that already exists in a larger scope. For example, we define a `text` variable inside a function, but there’s already a module-level `text` variable. Shadowing makes it hard to know which variable we’re looking at any given moment.

Such cases are the easiest to fix: we need to use separate variables for each value:

<!-- const loadCategory = (id) => [{name: `${id}1`, onSale: false}, {name: `${id}2`, onSale: true}] -->

```js
function getProductsOnSale(categoryId) {
  const products = loadCategory(categoryId);
  return products.filter(product => product.onSale);
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([{name: 'pizzas2', onSale: true}]) -->

By doing this, we shortened the lifespan of each variable and gave them clearer names, so the code is easier to understand, and we need to read less code to find out the current (and now the only) values of each variable. Also, each variable can have its own type that doesn’t change over its lifespan:

```ts
function loadCategory(categoryId: string): Product[] {
  // Skip the implementation
  return [];
}

function getProductsOnSale(categoryId: string): Product[] {
  const products = loadCategory(categoryId);
  return products.filter(product => product.onSale);
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([]) -->

I> _Variable lifespan_ is the number of lines of code between the variable declaration and the last line where this variable is accessed. The longer the lifespan, the harder it is to follow a variable and know which value it has at any given moment.

This approach makes it significantly easier to reason about the code.

Variables that allow different types end up awkward in TypeScript. I think it’s a clear sign that we’re doing something wrong:

```ts
function loadCategory(categoryId: string): Product[] {
  // Skip the implementation
  return [];
}

function getProductsOnSale(
  category: string | Product[]
): Product[] {
  if (typeof category !== 'string') {
    return [];
  }

  category = loadCategory(category);
  category = category.filter(product => product.onSale);
  return category;
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([]) -->

These extra types and conditions aren’t just cumbersome, they prevent TypeScript from doing its job: now the type of the `getProductsOnSale()` function says that we can call it with a product array, which doesn’t make sense.

## Incremental computations

The most common use case for reassignment is probably incremental computations. Consider this example:

<!--
const ERROR_MESSAGES = {
  InconsistentWidthHeight: 'Inconsistent width and height',
  InvalidVideoFiles: 'Invalid video files',
  InvalidVideoURL: 'Invalid video URL',
  BlankTitle: 'Blank title',
  InvalidId: 'Invalid ID',
}
const INPUT_TYPES = {Title: 'title', Id: 'id'}, ID_PATTERN = /^[a-z0-9]+$/i
const validateHeightWidthConsistency = () => true, validateVideoFileAndUrl = () => true, validateVideoURL = () => true
-->

<!-- prettier-ignore -->
```js
const validateVideo = (video) => {
  let errors = '';

  if (!validateHeightWidthConsistency(video.videoFiles))  {errors = errors + ERROR_MESSAGES.InconsistentWidthHeight;} // Must provide either both a height + width, or neither
  if (!validateVideoFileAndUrl(video.videoFiles))         {errors = errors + ERROR_MESSAGES.InvalidVideoFiles;}       // Must have ONE OF either a file or a URL
  if (!validateVideoURL(video.videoFiles))                {errors = errors + ERROR_MESSAGES.InvalidVideoURL;}         // Video URL must be a valid link
  if (!video[INPUT_TYPES.Title])                          {errors = errors + ERROR_MESSAGES.BlankTitle;}              // Title cannot be blank
  if (!video[INPUT_TYPES.Id].match(ID_PATTERN) !== false) {errors = errors + ERROR_MESSAGES.InvalidId;}               // ID must be alphanumeric

  return errors;
};
```

<!--
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X13'})).toBe('')
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X-13'})).toBe('Invalid ID')
-->

I’ve shortened the comments a bit because the original code had lines longer than 200 characters. On a very big screen, it looks like a pretty table; otherwise, it’s an unreadable mess. Any autoformatting tool, like Prettier, will also turn this code into an unreadable mess. Such formatting handcraft was common in the old days, before autoformatting tools became mainstream. Now, it’s a waste of time.

I> We talk about code formatting and Prettier in the [Autoformat your code](#formatting) chapter.

Anyway, this code appends an error message to the `errors` string variable for every failed validation, but now it’s hard to see this because the message formatting code is intertwined with the validation code. To add another validation, we have to understand and copy the formatting code. To print errors as an HTML list instead of plain text, we have to change each line of this function.

Let’s separate the validation from the formatting:

<!--
const console = { log: vi.fn() }
const ERROR_MESSAGES = {
  InconsistentWidthHeight: 'Inconsistent width and height',
  InvalidVideoFiles: 'Invalid video files',
  InvalidVideoURL: 'Invalid video URL',
  BlankTitle: 'Blank title',
  InvalidId: 'Invalid ID',
}
const INPUT_TYPES = {Title: 'title', Id: 'id'}, ID_PATTERN = /^[a-z0-9]+$/i
const validateHeightWidthConsistency = () => true, validateVideoFileAndUrl = () => true, validateVideoURL = () => true
-->

```js
const VIDEO_VALIDATIONS = [
  {
    // Must provide either both a height + width, or neither
    isValid: video =>
      validateHeightWidthConsistency(video.videoFiles),
    message: ERROR_MESSAGES.InconsistentWidthHeight
  },
  {
    // Must have ONE OF either a file or a URL
    isValid: video =>
      validateVideoFileAndUrl(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoFiles
  },
  {
    // Video URL must be a valid link
    isValid: video => validateVideoURL(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoURL
  },
  {
    // Title cannot be blank
    isValid: video => video[INPUT_TYPES.Title] !== undefined,
    message: ERROR_MESSAGES.BlankTitle
  },
  {
    // ID must be alphanumeric
    isValid: video =>
      video[INPUT_TYPES.Id].match(ID_PATTERN) !== null,
    message: ERROR_MESSAGES.InvalidId
  }
];

function validateVideo(video) {
  return VIDEO_VALIDATIONS.map(({ isValid, message }) =>
    isValid(video) ? undefined : message
  ).filter(Boolean);
}

function printVideoErrors(video) {
  console.log(validateVideo(video).join('\n'));
}
```

<!--
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X13'})).toEqual([])
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X-13'})).toEqual(['Invalid ID'])
printVideoErrors({videoFiles: [], title: 'Cat on Roomba', id: 'X-13'})
expect(console.log.mock.calls).toEqual([['Invalid ID']])
-->

We’ve separated the validations, the validation logic, and the formatting. Flies separately, kebabs separately, as we say in Russia. Each piece of code now has a single responsibility and a single reason to change. The validations are now defined declaratively and read like a list, not mixed with conditions and string concatenation. We’ve also changed negative conditions (_is invalid?_) to positive ones (_is valid?_). All this improves the readability and maintainability of the code: it’s easier to see all validations and add new ones because we don’t need to know the implementation details of running validations or formatting.

On top of that, now it’s clear that the original code had a bug: there was no space between error messages.

Finally, we can now swap the formatting function and render errors as an HTML list, for example:

<!-- const Text = ({children}) => children, FileUpload = () => null, validateVideo = () => ['Invalid video'] -->

```jsx
function VideoUploader() {
  const [video, setVideo] = useState();
  const errors = validateVideo(video);
  return (
    <>
      <FileUpload value={video} onChange={setVideo} />
      <div aria-live="assertive">
        {errors.length > 0 && (
          <>
            <Text variant="error">
              Nooooo, upload failed:
            </Text>
            <ul>
              {errors.map(error => (
                <Text key={error} as="li" variant="error">
                  {error}
                </Text>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
```

<!--
const {container: c1} = RTL.render(<VideoUploader />);
expect(c1.textContent).toEqual('Nooooo, upload failed:Invalid video')
-->

We can also test each validation separately. Have you noticed that I’ve changed `false` to `null` in the last validation? That’s because `match()` returns `null` when there’s no match, not `false`. The original validation always returns `true`.

I would even inline `ERROR_MESSAGES` constants unless they are reused somewhere else. They don’t make the code easier to read, but they make it harder to change because we have change the code in two places.

<!-- const validateHeightWidthConsistency = (x, y) => x === y -->

```js
const VIDEO_VALIDATIONS = [
  {
    // Must provide either both a height + width, or neither
    isValid: video =>
      validateHeightWidthConsistency(video.videoFiles),
    message:
      'You should provide either both a height and a width, or neither'
  }
];
```

<!-- expect(VIDEO_VALIDATIONS[0].isValid(100, 100)).toBe(true) -->

Now, all the code we need to touch to add, remove, or change validations is contained in the `VIDEO_VALIDATIONS` array. Keep the code, that’s likely to be changed at the same time, in the same place.

I> We talk about keeping code that changes at the same time, at the same place in the [Divide and conquer, or merge and relax](#divide) chapter.

## Building complex objects

Another common reason for reassignments is building complex objects:

<!--
const format = x => new Intl.DateTimeFormat().format(x)
const SORT_DESCENDING = 'desc', DATE_FORMAT = 'YYYY-MM-DD'
const dateRangeFrom = new Date(2023, 1, 4), dateRangeTo = new Date(2023, 1, 14), sortField = 'id'
const sortDirection = SORT_DESCENDING, query = ''
-->

```js
let queryValues = {
  sortBy: sortField,
  orderDesc: sortDirection === SORT_DESCENDING,
  words: query
};
if (dateRangeFrom && dateRangeTo) {
  queryValues = {
    ...queryValues,
    from: format(
      dateRangeFrom.setHours(0, 0, 0, 0),
      DATE_FORMAT
    ),
    to: format(dateRangeTo.setHours(23, 59, 59), DATE_FORMAT)
  };
}
```

<!-- expect(queryValues).toEqual({
  from: '2/4/2023',
  orderDesc: true,
  sortBy: "id",
  to: '2/14/2023',
  words: ""
}) -->

Here, we’re adding the `from` and `to` properties only when they aren’t empty.

The code would be clearer if we taught our backend to ignore `undefined` values and build the whole object at once:

<!--
const format = x => new Intl.DateTimeFormat().format(x)
const SORT_DESCENDING = 'desc', DATE_FORMAT = 'YYYY-MM-DD'
const dateRangeFrom = new Date(2023, 1, 4), dateRangeTo = new Date(2023, 1, 14), sortField = 'id'
const sortDirection = SORT_DESCENDING, query = ''
-->

```js
const hasDateRange = dateRangeFrom && dateRangeTo;
const queryValues = {
  sortBy: sortField,
  orderDesc: sortDirection === SORT_DESCENDING,
  words: query,
  from: hasDateRange
    ? format(dateRangeFrom.setHours(0, 0, 0, 0), DATE_FORMAT)
    : undefined,
  to: hasDateRange
    ? format(dateRangeTo.setHours(23, 59, 59), DATE_FORMAT)
    : undefined
};
```

<!-- expect(queryValues).toEqual({
  from: '2/4/2023',
  orderDesc: true,
  sortBy: "id",
  to: '2/14/2023',
  words: ""
}) -->

Now, the query object always has the same shape, but some properties can be `undefined`. The code feels more declarative, and it’s easier to see the final shape of this object.

{#no-pascal-vars}

## Avoid Pascal-style variables

Some people like to define all variables at the beginning of a function. I call this _Pascal style_ because, in the Pascal programming language, we have to declare all variables at the beginning of a program or a function:

```pascal
function max(num1, num2: integer): integer;

var
  result: integer;

begin
  if (num1 > num2) then
    result := num1
  else
    result := num2;
  max := result;
end;
```

Some people use this style in languages that don’t require it:

<!--
const submitOrder = vi.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
-->

```js
function createOrder(
  products,
  firstName,
  lastName,
  deliveryMethod
) {
  let isFreeDelivery;

  // Skipped 50 lines of code…

  if (
    [
      DELIVERY_METHODS.PIGEON,
      DELIVERY_METHODS.TRAIN_CONDUCTOR
    ].includes(deliveryMethod)
  ) {
    isFreeDelivery = 1;
  } else {
    isFreeDelivery = 0;
  }

  // Skipped 30 lines of code…

  submitOrder({
    products,
    firstName,
    lastName,
    deliveryMethod,
    isFreeDelivery
  });
}
```

<!--
createOrder([], 'Chuck', 'Norris', DELIVERY_METHODS.PIGEON)
expect(submitOrder).toBeCalledWith({
  products: [],
  firstName: "Chuck",
  lastName: "Norris",
  deliveryMethod: "PIGEON",
  isFreeDelivery: 1
})
-->

A long variable lifespan requires a lot of scrolling to understand the current value of the variable. Possible reassignments make it even worse. If there are 50 lines between a variable declaration and its usage, the variable can be reassigned at any of these 50 lines.

We can improve readability by moving variable declarations as close to their usage as possible and by avoiding reassignments:

<!--
const submitOrder = vi.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
-->

```js
function createOrder(
  products,
  firstName,
  lastName,
  deliveryMethod
) {
  const isFreeDelivery = [
    DELIVERY_METHODS.PIGEON,
    DELIVERY_METHODS.TRAIN_CONDUCTOR
  ].includes(deliveryMethod);
  submitOrder({
    products,
    firstName,
    lastName,
    deliveryMethod,
    isFreeDelivery: isFreeDelivery ? 1 : 0
  });
}
```

<!--
createOrder([], 'Chuck', 'Norris', DELIVERY_METHODS.PIGEON)
expect(submitOrder).toBeCalledWith({
  products: [],
  firstName: "Chuck",
  lastName: "Norris",
  deliveryMethod: "PIGEON",
  isFreeDelivery: 1
})
-->

We shortened the `isFreeDelivery` variable lifespan from 100 lines to just 10. Now, it’s also clear that its value is the one we assign when we declare it.

Another change here is that the `isFreeDelivery` variable is now boolean, which makes the code more idiomatic. We convert it to a number (a backend requirement) when we submit the order to the server. This is similar to the normalization of variables we talked about in the previous chapter; the only difference is that in the previous chapter we normalized the incoming variable, while here we normalize the outgoing one. The structure of the raw data and the requirements of the backend shouldn’t make us write confusing and non-idiomatic code.

T> Don’t confuse the Pascal-style with PascalCase though, this naming convention is still in use. We talk more about naming conventions in the [Naming is hard](#naming) chapter.

## Avoid temporary variables for function return values

When a variable is used to store the result of a function, we can often get rid of that variable:

```js
function areEventsValid(events) {
  let isValid = true;
  events.forEach(event => {
    if (event.fromDate > event.toDate) {
      isValid = false;
    }
  });
  return isValid;
}
```

<!--
expect(areEventsValid([{fromDate: 4, toDate: 14}, {fromDate: 1, toDate: 2}])).toBe(true)
expect(areEventsValid([{fromDate: 4, toDate: 1}, {fromDate: 1, toDate: 2}])).toBe(false)
-->

Here, we check that _every_ event is valid, which would be clearer with the `every()` array method:

```js
function areEventsValid(events) {
  return events.every(
    event => event.fromDate <= event.toDate
  );
}
```

<!--
expect(areEventsValid([{fromDate: 4, toDate: 14}, {fromDate: 1, toDate: 2}])).toBe(true)
expect(areEventsValid([{fromDate: 4, toDate: 1}, {fromDate: 1, toDate: 2}])).toBe(false)
-->

I> We talk a lot more about array methods in the [Avoid loops](#no-loops) chapter.

We removed a temporary variable, avoided reassignments, and made the condition positive (_is valid?_) instead of negative (_is invalid?_). Positive conditions are generally easier to understand.

Here’s another example:

```js
const handleChangeEstimationHours = event => {
  let estimationHours = event.target.value;
  if (estimationHours === '' || estimationHours < 0) {
    estimationHours = 0;
  }
  return { estimationHours };
};
```

<!--
expect(handleChangeEstimationHours({target: {value: ''}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: -1}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: 1}})).toEqual({estimationHours: 1})
-->

Here, we can use a ternary operator to avoid reassignment:

```js
const handleChangeEstimationHours = ({
  target: { value }
}) => {
  const estimationHours =
    value !== '' && value >= 0 ? value : 0;
  return { estimationHours };
};
```

<!--
expect(handleChangeEstimationHours({target: {value: ''}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: -1}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: 1}})).toEqual({estimationHours: 1})
-->

Now, the flow of the code is more straightforward.

## Functions as the last resort

Sometimes, attempting to avoid reassignments makes the code harder to read. In such cases, we can either leave the code as is or extract the code into a function and use the function’s return value instead of a reassignment.

Consider this example:

<!--
let type;
let displayError = (props) => { type = props.errorType }
let captureException = (channel, message, props) => { type = props.extra.errorType }
let ErrorTypes = {NETWORK_ERROR: 'ne', NOT_FOUND: 'nf', SERVER_ERROR: 'se', OTHER_ERROR: 'oe'}
-->

```js
function errorHandler(code, message) {
  let errorType;
  switch (code) {
    case 2: {
      errorType = ErrorTypes.NETWORK_ERROR;
      break;
    }
    case 3: {
      errorType = ErrorTypes.NOT_FOUND;
      break;
    }
    case 4: {
      errorType = ErrorTypes.SERVER_ERROR;
      break;
    }
    default: {
      errorType = ErrorTypes.OTHER_ERROR;
      break;
    }
  }
  displayError({ errorType, code, message });
  captureException('app', message, {
    extra: { errorType, code, message }
  });
}
```

<!--
errorHandler(4, 'Shit happened')
expect(type).toBe('se')
-->

This code is okay. The function isn’t too long to worry much about reassignments or pretty much anything. However, for the sake of example (and because a more realistic example would make it much larger), let’s extract the error type logic into a function:

<!--
let type;
let displayError = (props) => { type = props.errorType }
let captureException = (channel, message, props) => { type = props.extra.errorType }
let ErrorTypes = {NETWORK_ERROR: 'ne', NOT_FOUND: 'nf', SERVER_ERROR: 'se', OTHER_ERROR: 'oe'}
-->

```js
function errorCodeToType(code) {
  switch (code) {
    case 2: {
      return ErrorTypes.NETWORK_ERROR;
    }
    case 3: {
      return ErrorTypes.NOT_FOUND;
    }
    case 4: {
      return ErrorTypes.SERVER_ERROR;
    }
    default: {
      return ErrorTypes.OTHER_ERROR;
    }
  }
}

function errorHandler(code, message) {
  const errorType = errorCodeToType(code);
  displayError({ errorType, code, message });
  captureException('app', message, {
    extra: { errorType, code, message }
  });
}
```

<!--
errorHandler(4, 'Shit happened')
expect(type).toBe('se')
-->

I often call this method _sweeping under the rug refactoring_: we stash a complex or long piece of code into its own function, making it easier to understand the main function.

T> However, we should avoid splitting code into many small functions: doing so significantly hurts readability because it’s hard to understand the code when useful pieces are hidden in other functions. All good things are best in moderation.

T> For this particular code, I’d prefer to use a table instead of a function. We talk about tables and maps in the [Tables and maps](#tables) section of the _Avoid conditions_ chapter.

## Indeterminate loops

Sometimes, having a reassignment is quite okay. Indeterminate loops, where we don’t know the number of iterations up front, are a good case for reassignments.

Consider this example:

<!-- const WEEK_DAY_MONDAY = 0, addDays = (x, d) => ({getDay: () => x.getDay() + d}) -->

```js
function getStartOfWeek(selectedDay) {
  let startOfWeekDay = selectedDay;
  while (startOfWeekDay.getDay() !== WEEK_DAY_MONDAY) {
    startOfWeekDay = addDays(startOfWeekDay, -1);
  }
  return startOfWeekDay;
}
```

<!-- expect(getStartOfWeek({getDay: () => 3}).getDay()).toEqual(0) -->

Here, we’re finding the start of the current week by moving one day back in a `while` loop and checking if it’s already Monday or not.

Even if it’s possible to avoid reassignments here, it will likely make the code less readable. Feel free to try, and let me know how it goes, though.

## TypeScript-related problems with reassignments

Many practices I discourage in this book make TypeScript code awkward and convoluted. Reassignments are no exception. Consider this example:

<!--
let setTimeout = (fn, time) => fn()
let clearTimeout = (timer) => {}
let hideNotification = vi.fn()
-->

```ts
function setupHideTimeout() {
  let hideTimeout: NodeJS.Timeout;
  // In case the notification is temporary, hide it after x seconds
  if (
    notificationProperties?.hideAfterSeconds &&
    notificationProperties?.hideAfterSeconds > 0
  ) {
    hideTimeout = setTimeout(
      () => hideNotification(),
      notificationProperties?.hideAfterSeconds * 1000
    );
  }
  return () => hideTimeout && clearTimeout(hideTimeout);
}
```

<!--
let notificationProperties = {}
let timeout1 = setupHideTimeout()
expect(timeout1).not.toThrowError()
expect(hideNotification).not.toHaveBeenCalled()
notificationProperties = {hideAfterSeconds: 10}
let timeout2 = setupHideTimeout()
expect(timeout2).not.toThrowError()
expect(hideNotification).toHaveBeenCalled()
-->

TypeScript has great _type inference_, meaning we don’t have to explicitly define types all the time. Often, TypeScript can determine the correct type based on, for example, the value or the function return type. Here, though, we don’t take advantage of type inference: we must specify a type for the `hideTimeout` variable because it has no initial value.

Let’s rewrite this code without reassignments:

<!--
let setTimeout = (fn, time) => fn()
let clearTimeout = (timer) => {}
let hideNotification = vi.fn()
-->

```ts
function setupHideTimeout() {
  const hideAfterSeconds =
    notificationProperties?.hideAfterSeconds ?? 0;
  if (hideAfterSeconds > 0) {
    const hideTimeout = setTimeout(
      () => hideNotification(),
      hideAfterSeconds * 1000
    );
    return () => clearTimeout(hideTimeout);
  } else {
    return () => {};
  }
}
```

<!--
let notificationProperties = {hideAfterSeconds: 0}
let timeout1 = setupHideTimeout()
expect(timeout1).not.toThrowError()
expect(hideNotification).not.toHaveBeenCalled()
notificationProperties = {hideAfterSeconds: 10}
let timeout2 = setupHideTimeout()
expect(timeout2).not.toThrowError()
expect(hideNotification).toHaveBeenCalled()
-->

Now, we’re relying on type inference: TypeScript knows that the `setTimeout()` function returns a `NodeJS.Timeout`, so it can safely assume that `hideTimeout` should use the same type. Additionally, by restructuring the code, we removed the second condition: now we return a _no operation_ function when there’s no need for a timer. This makes the code less cluttered and easier to follow.

I> A _no operation_ or _noop_ function is a function that does nothing. It allows us to write unconditional code that expects a function: if we don’t want any action, we pass a no operation function instead. This makes the code more straightforward. Noop functions are a common pattern in JavaScript, and arrow function syntax gives them a compact and distinctive look: `() => {}`.

We already discussed another example of how reassignments make TypeScript code awkward in the _Don’t reuse variables_ section.

## Help the brain with conventions

In all examples above, we replaced `let` with `const` in variable declarations. This immediately tells the reader that the variable won’t be reassigned. We can be sure it won’t: the compiler will yell at us if we try. Every time we see a `let` declaration, we know that this code is likely more complex and that we should read it more carefully.

Another useful convention is to use SCREAMING_SNAKE_CASE names for constants. This tells the reader that it’s more of a configuration value than a result of some computation. The lifespan of such constants is usually large — often the whole module or even the whole codebase — so when we read the code, we usually don’t see the constant definition, but we can still assume that the value never changes. In addition, using such a constant in a function doesn’t make the function impure.

However, there’s an important difference between a variable defined with the `const` keyword and a true constant in JavaScript. The first only tells the compiler and the reader that the variable won’t be _reassigned_. The second describes the nature of the value as something global and static that never changes at runtime.

Both conventions reduce the cognitive load a bit and make the code easier to understand.

Unfortunately, JavaScript has no true constants, and _mutation_ is still possible even when we define a variable using the `const` keyword.

I> We talk about mutation in [the next chapter](#no-mutation).

## Conclusion

Code without reassignments is often easier to reason about because variables don’t change their values in the middle of their lifespan.

However, reassignments aren’t pure evil, and exterminating them at all costs won’t make the code better. I treat each reassignment as a sign: if I see a reassignment, I ask myself whether rewriting the code without it would improve readability. There’s no right or wrong answer, but if we do use reassignments, it’s better to isolate them in small functions, making it clear what the current value of a variable is.

---

Start thinking about:

- Using different variables with meaningful names instead of reusing the same variable for different purposes.
- Separating the data from the algorithm to make code more readable and maintainable.
- Building a complete complex object in a single place instead of building it field by field.
- Declaring variables as close as possible to where they are used to reduce their lifespan and to make it easier to understand which value a variable has at any particular moment.
- Extracting a piece of code into a small function to avoid a temporary variable, and using a function return value instead.
