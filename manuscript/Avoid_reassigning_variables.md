{#avoid-reassigning-variables}
### Avoid reassigning variables

Reassigning variables is like changing the past. When we see:

```js
let pizza = { toppings: ['salami', 'jalapeños'] };
```

We can’t be sure that our pizza will always have salami and jalapeños on it, because:

- the variable can be reassigned with a new value, even a value of another type;
- the value, if it’s an array or an object, can be mutated.

Knowing that both things are possible makes us think, every time we see `pizza` in the code, which value it has _now_. That’s a huge and unnecessary cognitive load that we should avoid.

And most of the time we can avoid both. Let’s start with reassigning and come back to mutation in the [next chapter](#avoid-mutation).

#### Don’t reuse variables

Sometimes a variable is reused to store different values:

<!-- const loadCategory = (id) => [{name: `${id}1`, onSale: false}, {name: `${id}2`, onSale: true}] -->

```js
function getProductsOnSale(category) {
  category = loadCategory(category);
  category = category.filter(product => product.onSale);
  return category;
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([{name: 'pizzas2', onSale: true}]) -->

Here the `category` variable is used to store a category ID, a list of products in a category, and a list of filtered products. Even types of these values are different. This function isn’t completely hopeless because it’s short, but imagine more code between reassignments.

Also, a new value is reassigned to a function parameter, known as _function parameter shadowing_. I think it’s no different from regular reassignment, so I’ll treat it the same way.

This case is the easiest to fix: we need to use separate variables for each value:

<!-- const loadCategory = (id) => [{name: `${id}1`, onSale: false}, {name: `${id}2`, onSale: true}] -->

```js
function getProductsOnSale(categoryId) {
  const products = loadCategory(categoryId);
  return products.filter(product => product.onSale);
}
```

<!-- expect(getProductsOnSale('pizzas')).toEqual([{name: 'pizzas2', onSale: true}]) -->

By doing this we’re making the lifespan of each variable shorter and choosing clearer names, so the code is easier to understand and we’ll need to read less code to find out the current (and now the only) value of each variable.

#### Incremental computations

Probably the most common use case for reassignment is incremental computations. Consider this example:

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

I’ve shortened the comments a bit, the original code had lines longer than 200 characters. If we have a very big screen, it looks like a pretty table, otherwise like an unreadable mess. Any autoformatting tool, like Prettier, will make an unreadable mess out of it too, so we shouldn’t rely on manual code formatting. It’s also really hard to maintain: if any “column” becomes longer than all existing “columns” after our changes, we have to adjust whitespace for all other “columns”.

Anyway, this code appends an error message to the `errors` string variable for every failed validation. But now it’s hard to see because the message formatting code is mangled with the validation code. This makes it hard to read and modify. To add another validation, we have to understand and copy the formatting code. Or to print errors as an HTML list, we have to change each line of this function.

Let’s separate validation and formatting:

<!--
const console = { log: jest.fn() }
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
    isValid: video => validateVideoFileAndUrl(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoFiles
  },
  {
    // Video URL must be a valid link
    isValid: video => validateVideoURL(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoURL
  },
  {
    // Title cannot be blank
    isValid: video => !!video[INPUT_TYPES.Title],
    message: ERROR_MESSAGES.BlankTitle
  },
  {
    // ID must be alphanumeric
    isValid: video =>
      video[INPUT_TYPES.Id].match(ID_PATTERN) !== null,
    message: ERROR_MESSAGES.InvalidId
  }
];

const validateVideo = video => {
  return VIDEO_VALIDATIONS.map(({ isValid, message }) =>
    isValid(video) ? undefined : message
  ).filter(Boolean);
};

const printVideoErrors = video => {
  console.log(validateVideo(video).join('\n'));
};
```

<!--
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X13'})).toEqual([])
expect(validateVideo({videoFiles: [], title: 'Cat on Roomba', id: 'X-13'})).toEqual(['Invalid ID'])
printVideoErrors({videoFiles: [], title: 'Cat on Roomba', id: 'X-13'})
expect(console.log.mock.calls).toEqual([['Invalid ID']])
-->

We’ve separated validations, validation logic, and formatting. Flies separately, kebabs separately, as we say in Russia. Each piece of code has a single responsibility and a single reason to change. Validations now are defined declaratively and read like a table, not mixed with conditions and string concatenation. We’ve also changed negative conditions (_is invalid?_) to positive (_is valid?_). All this improves the readability and maintainability of the code: it’s easier to see all validations and add new ones because we don’t need to know the implementation details of running validations or formatting.

And now it’s clear that the original code had a bug: there was no space between error messages.

Also now we can swap the formatting function and render errors as an HTML list, for example:

<!-- const Text = ({children}) => children, FileUpload = () => null, validateVideo = () => ['Invalid video'] -->

```jsx
function VideoUploader() {
  const [video, setVideo] = React.useState();
  const errors = validateVideo(video);
  return (
    <>
      <FileUpload value={video} onChange={setVideo} />
      {errors.length > 0 && (
        <>
          <Text variation="error">Nooooo, upload failed:</Text>
          <ul>
            {errors.map(error => (
              <Text key={error} as="li" variation="error">
                {error}
              </Text>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
```

<!--
const {container: c1} = RTL.render(<VideoUploader />);
expect(c1.textContent).toEqual('Nooooo, upload failed:Invalid video')
-->

We can also test each validation separately. Have you noticed that I’ve changed `false` to `null` in the last validation? That’s because `match()` returns `null` when there’s no match, not `false`. The original validation always returns `true`.

I would even inline `ERROR_MESSAGES` constants unless they are reused somewhere else. They don’t make code easier to read but they make it harder to change because we have to make changes in two places.

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

Now all the code we need to touch to add, remove, or change validations is contained in the `VIDEO_VALIDATIONS` array. Keep the code, that’s likely to be changed at the same time, in the same place.

#### Building complex objects

Another common reason to reassign variables is to build a complex object:

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
    from: format(dateRangeFrom.setHours(0, 0, 0, 0), DATE_FORMAT),
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

Here we’re adding `from` and `to` properties only when they aren’t empty.

The code would be clearer if we teach our backend to ignore empty values and build the whole object at once:

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
  from:
    hasDateRange &&
    format(dateRangeFrom.setHours(0, 0, 0, 0), DATE_FORMAT),
  to:
    hasDateRange &&
    format(dateRangeTo.setHours(23, 59, 59), DATE_FORMAT)
};
```

<!-- expect(queryValues).toEqual({
  from: '2/4/2023',
  orderDesc: true,
  sortBy: "id",
  to: '2/14/2023',
  words: ""
}) -->

Now, the query object always has the same shape, but some properties can be `undefined`. The code feels more declarative and it’s easier to understand what it’s doing – building an object – and see the final shape of this object.

#### Avoid Pascal style variables

Some people like to define all variables at the beginning of a function. I call this _Pascal style_, because in Pascal we have to declare all variables at the beginning of a program or a function:

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

Some people use this style in languages where they don’t have to do it:

<!--
const submitOrder = jest.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
const deliveryMethod = DELIVERY_METHODS.PIGEON, products = [], address = '', firstName = '', lastName = ''
-->

```js
let isFreeDelivery;

// 50 lines of code

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

// 30 lines of code

submitOrder({
  products,
  address,
  firstName,
  lastName,
  deliveryMethod,
  isFreeDelivery
});
```

<!-- expect(submitOrder).toBeCalledWith({
  products: [],
  address: "",
  firstName: "",
  lastName: "",
  deliveryMethod: "PIGEON",
  isFreeDelivery: 1
}) -->

Long variable lifespan makes us scroll a lot to understand the current value of a variable. Possible reassignments make it even worse. If there are 50 lines between a variable declaration and its usage, then it can be reassigned in any of these 50 lines.

We can make code more readable by moving variable declarations as close to their usage as possible and by avoiding reassignments:

<!--
const submitOrder = jest.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
const deliveryMethod = DELIVERY_METHODS.PIGEON, products = [], address = '', firstName = '', lastName = ''
-->

```js
const isFreeDelivery = [
  DELIVERY_METHODS.PIGEON,
  DELIVERY_METHODS.TRAIN_CONDUCTOR
].includes(deliveryMethod);
submitOrder({
  products,
  address,
  firstName,
  lastName,
  deliveryMethod,
  isFreeDelivery: isFreeDelivery ? 1 : 0
});
```

<!-- expect(submitOrder).toBeCalledWith({
  products: [],
  address: "",
  firstName: "",
  lastName: "",
  deliveryMethod: "PIGEON",
  isFreeDelivery: 1
}) -->

We’ve shortened `isFreeDelivery` variable lifespan from 100 lines to just 10. Now it’s also clear that its value is the one we assign at the first line.

Don’t mix it with `PascalCase` though, this naming convention is still in use.

#### Avoid temporary variables for function return values

When a variable is used to keep a function result, often we can get rid of that variable:

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

Here we’re checking that _every_ event is valid, which would be more clear with the `every()` array method:

```js
function areEventsValid(events) {
  return events.every(event => event.fromDate <= event.toDate);
}
```

<!--
expect(areEventsValid([{fromDate: 4, toDate: 14}, {fromDate: 1, toDate: 2}])).toBe(true)
expect(areEventsValid([{fromDate: 4, toDate: 1}, {fromDate: 1, toDate: 2}])).toBe(false)
-->

We’ve also removed a temporary variable, avoided reassignment, and made a condition positive (_is valid?_), instead of a negative (_is invalid?_). Positive conditions are usually easier to understand.

For local variables, we can either use a ternary operator:

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

Like this:

```js
const handleChangeEstimationHours = ({ target: { value } }) => {
  const estimationHours = value !== '' && value >= 0 ? value : 0;
  return { estimationHours };
};
```

<!--
expect(handleChangeEstimationHours({target: {value: ''}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: -1}})).toEqual({estimationHours: 0})
expect(handleChangeEstimationHours({target: {value: 1}})).toEqual({estimationHours: 1})
-->

Or we can extract code to a function, for example:

<!--
const isAdminUser = true, REJECTION_REASONS = {HAS_SWEAR_WORDS: 'HAS_SWEAR_WORDS', TOO_DRAMATIC: 'TOO_DRAMATIC'}
const getAllRejectionReasons = () => ([{value: REJECTION_REASONS.TOO_DRAMATIC}])
-->

```js
let rejectionReasons = getAllRejectionReasons();
if (isAdminUser) {
  rejectionReasons = rejectionReasons.filter(
    reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
  );
}
```

<!-- expect(rejectionReasons).toEqual([{"value": "TOO_DRAMATIC"}]) -->

Becomes this:

<!--
const isAdminUser = true, REJECTION_REASONS = {HAS_SWEAR_WORDS: 'HAS_SWEAR_WORDS', TOO_DRAMATIC: 'TOO_DRAMATIC'}
const getAllRejectionReasons = () => ([{value: REJECTION_REASONS.TOO_DRAMATIC}])
-->

```js
const getRejectionReasons = isAdminUser => {
  const rejectionReasons = getAllRejectionReasons();
  if (isAdminUser) {
    return rejectionReasons.filter(
      reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
    );
  }
  return rejectionReasons;
};

// --- 8< -- 8< ---

const rejectionReasons = getRejectionReasons(isAdminUser);
```

<!-- expect(rejectionReasons).toEqual([{"value": "TOO_DRAMATIC"}]) -->

This is less important. You may argue that moving code to a new function just because of a reassignment isn’t a great idea, and you may be right, so use your own judgment here.

#### Indeterminate loops

Sometimes having a reassignment is quite okay. Indeterminate loops, the ones where we don’t know the number of iterations in advance, are a good case for reassignments.

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

Here we’re finding the start of the current week by moving one day back in a `while` loop and checking if it’s already Monday or not.

Even if it’s possible to avoid a reassignment here, it will likely make the code less readable. Feel free to try and let me know how it goes though.

Reassignments aren’t pure evil and exterminating them all won’t make our code better. They are more like signs: if we see a reassignment, we should ask ourselves if rewriting the code without it would make it more readable. There’s no right or wrong answer, but if we do use a reassignment, it’s better to isolate it in a small function, where it’s clear what the current value of a variable is.

#### Help the brain with conventions

In all examples above I’m replacing `let` with `const` in variable declarations. This immediately tells the reader that the variable won’t be reassigned. And we can be sure, it won’t: the compiler will yell at us if we try. Every time we see `let` in the code, we know that this code is likely more complex and needs more brain power to understand.

Another useful convention is using `UPPER_CASE` names for constants. This tells the reader that this is more of a configuration value, than a result of some computation. The lifespan of such constants is usually large: often the whole module or even the whole codebase, so when we read the code we usually don’t see the constant definition, but we still can be sure that the value never changes. And using such a constant in a function doesn’t make the function not pure.

There’s an important difference between a variable defined with the `const` keyword and a true constant in JavaScript. The first only tells the compiler and the reader that the variable won’t be _reassigned_. The second describes the nature of the value as something global and static that never changes at runtime.

Both conventions reduce the cognitive load a little bit and make the code easier to understand.

Unfortunately, JavaScript has no true constants, and _mutation_ is still possible even when we define a variable with the `const` keyword. We’ll talk about mutations in [the next chapter](#avoid-mutation).

---

Start thinking about:

- Using different variables with meaningful names instead of reusing the same variable for different purposes.
- Separating data from an algorithm to make code more readable and maintainable.
- Building a shape of a complex object in a single place instead of building it piece by piece.
- Declaring variables as close as possible to the place where they are used reduces the lifespan of a variable and makes it easier to understand which value a variable has at a particular moment.
- Extracting a piece of code to a small function to avoid a temporary variable and use a function return value instead.
