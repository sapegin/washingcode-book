{#naming}

# Naming is hard

<!-- description: How clear names make it easier to understand the code, and how to improve naming in our code -->

We all know that naming is one of the hardest problems in programming, and most of us have probably written code like this when we just started programming:

<!-- prettier-ignore -->
```pascal
            // reading file signature
try
        AssignFile(fp, path+sr.Name);
                    Reset(fp, 1);
    if FileSize(fp) < sizeof(buf) then
                            continue
    else
                            BlockRead(fp, buf, sizeof(buf));
    CloseFile(fp);
except
    on E : Exception do
    begin
            ShowError(E.Message+#13#10+'('+path+sr.Name+')');
        continue;
    end; // on
end; // try
// compare
for i:=0 to FormatsCnt do
begin
    if AnsiStartsStr(Formats[i].Signature, buf) then
    begin
            // Check second signature
        if (Formats[i].Signature2Offset>0) then
            if Formats[i].Signature2Offset <> Pos(Formats[i].Signature2, buf) then
                    continue;
            // Check extension
        found := false;
        ext := LowerCase(ExtractFileExt(sr.Name));
        for j:=0 to High(Formats[i].Extensions) do
        begin
            if ext='.'+Formats[i].Extensions[j] then
            begin
                    found := true;
                break;
            end; // if
        end; // for j
        if found then
            break;
        // ..
    end;
end;
```

I wrote this code more than 20 years ago in Delphi, and, honestly, I don’t really remember what the app was supposed to do. It has it all: single-character names (`i`, `j`, `E`), abbreviations (`FormatsCnt`, `buf`), acronyms (`sr`, `fp`), and a mix of different naming conventions. It has some comments, though! (And I kept the original indentation for complete immersion.)

I once worked with a very seasoned developer who mostly used very short names and never wrote any comments or tests. Working with their code was like working with Assembler — it was very difficult. Often, we wasted days tracking and fixing bugs.

Let’s look at these (and many other) naming antipatterns and how to fix them.

{#func-param-naming}

## Name function parameters

Function calls with multiple parameters can be hard to understand, when there are too many of them or some are optional. Consider this function call:

<!--
let x, target, fixedRequest, ctx
const resolver = { doResolve: (...args) => x = args.length }
-->

```js
resolver.doResolve(
  target,
  fixedRequest,
  null,
  ctx,
  (error, result) => {
    /* … */
  }
);
```

<!-- expect(x).toBe(5) -->

This `null` in the middle is grotesque — who knows what was supposed to be there and why it’s missing…

However, the worst programming pattern of all time is likely positional boolean function parameters:

<!-- let x; const appendScriptTag = (a, b) => x=b -->

```js
appendScriptTag(`https://example.com/falafel.js`, false);
```

<!-- expect(x).toBe(false) -->

What are we disabling here? It’s impossible to answer without reading the `appendScriptTag()` function’s code.

How many parameters are too many? In my experience, more than two parameters are already too many. Additionally, any boolean parameter is automatically too many.

Some languages have _named parameters_ to solve these problems. For example, in Python we could write this:

```python
appendScriptTag('https://example.com/falafel.js', useCORS=false)
```

It’s obvious what the code above does. Names serve as inline documentation.

Unfortunately, JavaScript doesn’t support named parameters yet, but we can use an object instead:

<!-- let x; const appendScriptTag = (a, b) => x = b.useCORS -->

```js
appendScriptTag(`https://example.com/falafel.js`, {
  useCORS: false
});
```

<!-- expect(x).toBe(false) -->

The code is slightly more verbose than in Python, but it achieves the same outcome.

## Name complex conditions

Some conditions are short and obvious, while others are long and require deep code knowledge to understand.

Consider this code:

<!-- let x; const useAuth = () => ({status: 'fetched', userDetails: {}}) -->

```js
function Toggle() {
  const { userDetails, status } = useAuth();

  if (status === 'fetched' && Boolean(userDetails)) {
    return null;
  }

  /* … */
}
```

<!-- expect(Toggle()).toBe(null) -->

In the code above, it’s hard to understand why we’re shortcutting the component. However, if we give the condition a name:

<!-- let x; const useAuth = () => ({status: 'fetched', userDetails: {}}) -->

```js
function Toggle() {
  const { userDetails, status } = useAuth();
  const isUserLoggedIn =
    status === 'fetched' && Boolean(userDetails);

  if (isUserLoggedIn) {
    return null;
  }

  /* … */
}
```

<!-- expect(Toggle()).toBe(null) -->

This makes the code clear and obvious: if we have user details after the data has been fetched, the user must be logged in.

{#negative-booleans}

## Negative booleans are not not hard to read

Consider this example:

<!-- let displayErrors = vi.fn() -->

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
    displayErrors(errorMessages);
  }

  return noErrorsFound;
}
```

<!--
expect(validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(displayErrors).not.toHaveBeenCalled()

expect(validateInputs({})).toBe(false)
expect(displayErrors).toHaveBeenCalledWith(['First name is required', 'Last name is required'])
-->

I can say a lot about this code, but let’s focus on this line first:

<!-- const noErrorsFound = false -->

```js
if (!noErrorsFound) {
  // No errors were fond
}
```

<!-- expect($1).toBe(true) -->

The double negation, “if not no errors found…”, makes my brain itch, and I almost want to take a red marker and start crossing out `!`s and `no`s on my screen to be able to read the code.

In most cases, we can significantly improve code readability by converting negative booleans to positive ones:

<!-- let displayErrors = vi.fn() -->

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
    displayErrors(errorMessages);
  }

  return !errorsFound;
}
```

<!--
expect(validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(displayErrors).not.toHaveBeenCalled()

expect(validateInputs({})).toBe(false)
expect(displayErrors).toHaveBeenCalledWith(['First name is required', 'Last name is required'])
-->

Positive names and positive conditions are usually easier to read than negative ones.

By this time, we should notice that we don’t need the `errorsFound` variable at all: its value can be derived from the `errorMessages` array — _errors found_ when we have any _error messages_ to show:

<!-- let displayErrors = vi.fn() -->

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
    displayErrors(errorMessages);
    return false;
  } else {
    return true;
  }
}
```

<!--
expect(validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(displayErrors).not.toHaveBeenCalled()

expect(validateInputs({})).toBe(false)
expect(displayErrors).toHaveBeenCalledWith(['First name is required', 'Last name is required'])
-->

Here’s another example:

<!--
let store = {}
const bookID = 'book', data = [1]
const $ = (key) => ({
  toggleClass: (cls, val) => { store[key] = {}, store[key][cls] = val },
  attr: (attr, val) => { store[key] = {}, store[key][attr] = val }
})
-->

```js
const noData = data.length === 0;
$(`#${bookID}_download`).toggleClass('hidden-node', noData);
$(`#${bookID}_retry`).attr('disabled', !noData);
```

<!--
expect(store['#book_download']['hidden-node']).toBe(false)
expect(store['#book_retry']['disabled']).toBe(true)
-->

Again, every time we read `noData` in the code, we need to mentally _unnegate_ it to understand what’s really happening. And the negative `disabled` attribute with double negation (`!noData`) makes things even worse. Let’s fix it:

<!--
let store = {}
const bookID = 'book', data = [1]
const $ = (key) => ({
  toggleClass: (cls, val) => { store[key] = {}, store[key][cls] = val },
  attr: (attr, val) => { store[key] = {}, store[key][attr] = val }
})
-->

```js
const hasData = data.length > 0;
$(`#${bookID}_download`).toggleClass(
  'hidden-node',
  hasData === false
);
$(`#${bookID}_retry`).attr('disabled', hasData);
```

<!--
expect(store['#book_download']['hidden-node']).toBe(false)
expect(store['#book_retry']['disabled']).toBe(true)
-->

Now, it’s much easier to read.

I> We talk about names like `data` later in this chapter.

## The larger the scope, the longer the name

My rule of thumb is that the shorter the scope of a variable, the shorter its name should be.

I generally avoid very short variable names, but I prefer them for one-liners. Consider this example:

<!-- let BREAKPOINT_MOBILE = 480, BREAKPOINT_TABLET = 768, BREAKPOINT_DESKTOP = 1024 -->

```js
const breakpoints = [
  BREAKPOINT_MOBILE,
  BREAKPOINT_TABLET,
  BREAKPOINT_DESKTOP
].map(x => `${x}px`);
// → ['480px', '768px', '1024px']
```

<!--
expect(breakpoints).toEqual(['480px', '768px', '1024px'])
-->

It’s clear what `x` is, and a longer name would bloat the code without making it more readable, likely less. We already have the full name in the parent function: we map over a list of breakpoints and convert numbers to strings. It also helps that here we only have a single variable, so any short name will be read as “whatever we map over.”

I usually use `x` in such cases. I think it’s clear enough that it’s a placeholder and not an acronym for a particular word, and it’s a common convention.

Some developers prefer `_`, and it’s a good choice for any programming language except JavaScript, where `_` is often used for the [Lodash](https://lodash.com/) utility library.

Another convention I’m okay with is using `a`/`b` names for sorting and comparison functions:

<!-- const dates = ['2022-02-26T00:21:00.000+01:00', '2021-05-11T10:30:00.000+01:00'] -->

```js
const sortedDates = dates.toSorted(
  (a, b) => new Date(a).valueOf() - new Date(b).valueOf()
);
```

<!-- expect(sortedDates).toEqual(['2021-05-11T10:30:00.000+01:00', '2022-02-26T00:21:00.000+01:00']) -->

Loop indices `i`, `j`, and `k` are some of the most common variable names ever. They are moderately readable in short, non-nested loops, and only because programmers are so used to seeing them in the code:

<!--
let calls = 0
const pizzaController = { one: {mockReset(){ calls++ }}, two: {mockReset(){ calls++ }} }
-->

<!-- eslint-disable unicorn/no-for-loop -->

```js
const keys = Object.keys(pizzaController);
for (let i = 0; i < keys.length; i += 1) {
  pizzaController[keys[i]].mockReset();
}
```

<!-- expect(calls).toBe(2) -->

I> I used longer names for index variables, like `somethingIdx`, for a very long time. Surely, it’s way more readable than `i`, but, luckily, most modern languages allow us to iterate over things without coding artisan loops and without the need for an index variable. We talk more about this in the [Avoid loops](#no-loops) chapter.

However, in nested loops, it’s difficult to understand which index belongs to which array:

<!-- let console = { log: vi.fn() } -->

<!-- eslint-disable unicorn/no-for-loop -->

```js
const array = [
  ['eins', 'zwei', 'drei'],
  ['uno', 'dos', 'tres']
];
for (let i = 0; i < array.length; i++) {
  for (let j = 0; j < array[i].length; j++) {
    console.log(array[i][j]);
  }
}
```

<!-- expect(console.log.mock.calls).toEqual([
  ['eins'], ['zwei'], ['drei'], ['uno'], ['dos'], ['tres']
]) -->

It’s difficult to understand what’s going on here because variables `i` and `j` have no meaning. It works for non-nested loops, where `i` means “whatever the array contains,” but for nested arrays and loops, it’s not clear enough.

In the end, `x`, `a`, `b`, and `i` are pretty much all single-character names I ever use.

However, when the scope is longer or when we have multiple variables, short names can be confusing:

<!--
let result = [
  {edit: { range: [5, 10]}},
  {edit: { range: [3, 4]}},
  {edit: { range: [12, 20]}},
  {edit: { range: [7, 7]}},
  {edit: { range: [5, 6]}},
  {edit: { range: [12, 12]}},
  {edit: { range: [19, 19]}},
  {edit: { range: [5, 12]}},
  {edit: { range: [3, 3]}},
]
-->

```js
result.sort((a, b) => {
  const d0 = a.edit.range[0] - b.edit.range[0];
  if (d0 !== 0) {
    return d0;
  }
  // Both edits have now the same start offset.

  // Length of a and length of b
  const al = a.edit.range[1] - a.edit.range[0];
  const bl = b.edit.range[1] - b.edit.range[0];
  // Both has the same start offset and length.
  if (al === bl) {
    return 0;
  }

  if (al === 0) {
    return -1;
  }
  if (bl === 0) {
    return 1;
  }
  return al - bl;
});
```

<!--
expect(result).toEqual([
  {edit: { range: [3, 3]}},
  {edit: { range: [3, 4]}},
  {edit: { range: [5, 6]}},
  {edit: { range: [5, 10]}},
  {edit: { range: [5, 12]}},
  {edit: { range: [7, 7]}},
  {edit: { range: [12, 12]}},
  {edit: { range: [12, 20]}},
  {edit: { range: [19, 19]}},
])
-->

In the code above, `a` and `b` are okay (we talked about them earlier), but `d0`, `al`, and `bl` make this code more complex than it should be.

Let’s try to improve it a bit:

<!--
let result = [
  {edit: { range: [5, 10]}},
  {edit: { range: [3, 4]}},
  {edit: { range: [12, 20]}},
  {edit: { range: [7, 7]}},
  {edit: { range: [5, 6]}},
  {edit: { range: [12, 12]}},
  {edit: { range: [19, 19]}},
  {edit: { range: [5, 12]}},
  {edit: { range: [3, 3]}},
]
-->

```js
result.sort((a, b) => {
  const startDifference = a.edit.range[0] - b.edit.range[0];

  // If start offsets are different, sort by the start offset
  if (startDifference !== 0) {
    return startDifference;
  }

  // Otherwise, sort by the range length
  const lengthA = a.edit.range[1] - a.edit.range[0];
  const lengthB = b.edit.range[1] - b.edit.range[0];
  return lengthA - lengthB;
});
```

<!--
expect(result).toEqual([
  {edit: { range: [3, 3]}},
  {edit: { range: [3, 4]}},
  {edit: { range: [5, 6]}},
  {edit: { range: [5, 10]}},
  {edit: { range: [5, 12]}},
  {edit: { range: [7, 7]}},
  {edit: { range: [12, 12]}},
  {edit: { range: [12, 20]}},
  {edit: { range: [19, 19]}},
])
-->

Now, it’s clearer what the code is doing, and the comments explain the high-level idea instead of repeating the code.

On the other hand, long names in a short scope make the code cumbersome:

<!-- const purchaseOrders = [{poNumber: 11}, {poNumber: 22}], purchaseOrderData = {poNumber: 22} -->

```js
const index = purchaseOrders.findIndex(
  purchaseOrder =>
    purchaseOrder.poNumber === purchaseOrderData.poNumber
);
```

<!-- expect(index).toBe(1) -->

We can shorten the names to make the code more readable:

<!-- const purchaseOrders = [{poNumber: 11}, {poNumber: 22}], purchaseOrder = {poNumber: 22} -->

```js
const index = purchaseOrders.findIndex(
  po => po.poNumber === purchaseOrder.poNumber
);
```

<!-- expect(index).toBe(1) -->

{#var-lifespan}

## The shorter the scope, the better

We talked about the scope in the previous section. A variable’s scope size affects readability too. The shorter the scope, the easier it is to keep track of a variable.

The extreme cases would be:

- One-liner functions, where the scope of a variable is a single line: easy to follow (example: `[8, 16].map(x => x + 'px')`).
- Global variables, whose scope is infinite: a variable can be used or modified anywhere in the project, and there’s no way to know which value it holds at any given moment, which often leads to bugs. That’s why many developers have been [advocating against global variables](https://wiki.c2.com/?GlobalVariablesAreBad) for decades.

Usually, the shorter the scope, the better. However, extreme scope shortening has the same issues as splitting code into many teeny-tiny functions: it’s easy to overdo it and hurt readability.

I> We talk about splitting code into functions in the [Divide and conquer, or merge and relax](#divide) chapter.

I found that _reducing the lifespan of variables_ works as well and doesn’t produce lots of tiny functions. The idea here is to reduce the number of lines between the variable declaration and the line where the variable is accessed for the last time. A variable’s _scope_ might be a whole 200-line function, but if the lifespan of a particular variable is three lines, then we only need to look at these three lines to understand how this variable is used.

<!-- const MAX_RELATED = 3 -->

```ts
function getRelatedPosts(
  posts: {
    slug: string;
    tags: string[];
    timestamp: string;
  }[],
  { slug, tags }: { slug: string; tags: string[] }
) {
  const weighted = posts
    .filter(post => post.slug !== slug)
    .map(post => {
      const common = (post.tags || []).filter(t =>
        (tags || []).includes(t)
      );
      return {
        ...post,
        weight: common.length * Number(post.timestamp)
      };
    })
    .filter(post => post.weight > 0);

  const sorted = weighted.toSorted(
    (a, b) => b.weight - a.weight
  );
  return sorted.slice(0, MAX_RELATED);
}
```

<!--
const posts = [{slug: 'a', tags: ['cooking'], timestamp: 111}, {slug: 'b', tags: ['cooking', 'sleeping'], timestamp: 222}, {slug: 'c', tags: ['cooking', 'tacos'], timestamp: 333}]
expect(getRelatedPosts(posts, {slug: 'd', tags: ['cooking', 'tacos'], timestamp: 444})).toEqual([{slug: 'c', tags: ['cooking', 'tacos'], timestamp: 333, weight: 666}, {slug: 'b', tags: ['cooking', 'sleeping'], timestamp: 222, weight: 222}, {slug: 'a', tags: ['cooking'], timestamp: 111, weight: 111}])
-->

In the code above, the lifespan of the `sorted` variable is only two lines. This kind of sequential processing is a common use case for this technique.

T> Double-click on a variable name to select all its appearances in the code. This helps to quickly see the variable’s lifespan.

I> See a larger example in the [Avoid Pascal-style variables](#no-pascal-vars) section in the _Avoid reassigning variables_ chapter.

{#magic-numbers}

## Making magic numbers less magic

Magic numbers are any numbers that might be unclear to the code reader. Consider this example:

```js
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / 3600);
```

<!-- expect(getHoursSinceLastChange(36000)).toBe(10) -->

A seasoned developer would likely guess that 3600 is the number of seconds in an hour, but the actual number is less important to understand what this code does than the meaning of this number. We can make the meaning clearer by moving the magic number into a constant:

```js
const SECONDS_IN_AN_HOUR = 60 * 60;
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / SECONDS_IN_AN_HOUR);
```

<!-- expect(getHoursSinceLastChange(36000)).toBe(10) -->

I also like to include a unit in a name if it’s not obvious otherwise:

```js
const FADE_TIMEOUT_MS = 2000;
```

<!-- expect(FADE_TIMEOUT_MS).toBe(2000) -->

A perfect example where constants make code more readable is days of the week:

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

Is 6 a Saturday, Sunday, or Monday? Are we counting days from 0 or 1? Does the week start on Monday or Sunday?

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
<Calendar
  disabledDaysOfWeek={[WEEKDAY_MONDAY, WEEKDAY_SATURDAY]}
/>
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('1:6')
-->

Another common use case for magic numbers, which is somehow widely accepted, is HTTP status codes:

```js
function getErrorMessage(error) {
  if (error.response?.status === 404) {
    return 'Not found';
  }

  if (error.response?.status === 429) {
    return 'Rate limit exceeded';
  }

  return 'Something went wrong';
}
```

<!--
expect(getErrorMessage({ response: { status: 404 } })).toBe('Not found')
expect(getErrorMessage({ response: { status: 429 } })).toBe('Rate limit exceeded')
expect(getErrorMessage({ response: { status: 500 } })).toBe('Something went wrong')
-->

I know what the [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) status is, but who remembers what the [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) status means?

Let’s replace the magic numbers with constants:

```js
const STATUS_NOT_FOUND = 404;
const STATUS_TOO_MANY_REQUESTS = 429;

function getErrorMessage(error) {
  if (error.response?.status === STATUS_NOT_FOUND) {
    return 'Not found';
  }

  if (error.response?.status === STATUS_TOO_MANY_REQUESTS) {
    return 'Rate limit exceeded';
  }

  return 'Something went wrong';
}
```

<!--
expect(getErrorMessage({ response: { status: 404 } })).toBe('Not found')
expect(getErrorMessage({ response: { status: 429 } })).toBe('Rate limit exceeded')
expect(getErrorMessage({ response: { status: 500 } })).toBe('Something went wrong')
-->

Now, it’s clear which status codes we’re handling.

Personally, I’d use a library like [http-status-codes](https://github.com/prettymuchbryce/http-status-codes) here if I needed to work with status codes often or use not-so-common codes:

```js
import { StatusCodes } from 'http-status-codes';

function getErrorMessage(error) {
  if (error.response?.status === StatusCodes.NOT_FOUND) {
    return 'Not found';
  }

  if (
    error.response?.status === StatusCodes.TOO_MANY_REQUESTS
  ) {
    return 'Rate limit exceeded';
  }

  return 'Something went wrong';
}
```

<!--
expect(getErrorMessage({ response: { status: 404 } })).toBe('Not found')
expect(getErrorMessage({ response: { status: 429 } })).toBe('Rate limit exceeded')
expect(getErrorMessage({ response: { status: 500 } })).toBe('Something went wrong')
-->

However, having a clear name is sometimes not enough:

```js
const date = '2023-03-22T08:20:00+01:00';
const CHARACTERS_IN_ISO_DATE = 10;
const dateWithoutTime = date.slice(0, CHARACTERS_IN_ISO_DATE);
// → '2023-03-22'
```

<!-- expect(dateWithoutTime).toBe('2023-03-22') -->

In the code above, we remove the time portion of a string containing a date and time in the ISO format (for example, `2023-03-22T08:20:00+01:00`) by keeping only the first ten characters — the length of the date part. The name is quite clear, but the code is still a bit confusing and brittle. We can do better:

```js
const date = '2023-03-22T08:20:00+01:00';
const DATE_FORMAT_ISO = 'YYYY-MM-DD';
const dateWithoutTime = date.slice(0, DATE_FORMAT_ISO.length);
// → '2023-03-22'
```

<!-- expect(dateWithoutTime).toBe('2023-03-22') -->

Now, it’s easier to visualize what the code does, and we don’t need to count characters manually to be sure that The Very Magic number 10 is correct.

Code reuse is another good reason to introduce constants. However, we need to wait for the moment when the code is actually reused.

## Not all numbers are magic

Sometimes, programmers replace absolutely all literal values with constants, ideally stored in a separate module:

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

However, not every value is magic; some values are just values. Here, it’s clear that the value is the width of the ID column, and a constant doesn’t add any information that’s not in the code already. Instead, it makes the code harder to read: we need to go to the constant definition to see the actual value.

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

In the code above, it’s clear that the minimum width of a modal is 50vw. Adding a constant won’t make this code any clearer:

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
<Modal
  title="Out of cheese error"
  minWidth={MODAL_MIN_WIDTH}
/>
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('Out of cheese error:50vw')
-->

I avoid such constants unless the values are reused.

Sometimes, such constants are misleading:

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

The `ID_COLUMN_WIDTH` name is imprecise: it says that the value is the _width_, but it’s the _minimum width_.

Often, _zeroes_ and _ones_ aren’t magic, and code is easier to understand when we use `0` and `1` directly instead of constants with inevitably awkward names:

<!--
const addDays = (x, y) => x + y * 10
const addSeconds = (x, y) => x + y
const startOfDay = x => x - 0.1
-->

```js
const DAYS_TO_ADD_IN_TO_FIELD = 1;
const SECONDS_TO_REMOVE_IN_TO_FIELD = -1;

function getEndOfDayFromDate(date) {
  const nextDay = addDays(
    startOfDay(date),
    DAYS_TO_ADD_IN_TO_FIELD
  );
  return addSeconds(nextDay, SECONDS_TO_REMOVE_IN_TO_FIELD);
}
```

<!-- expect(getEndOfDayFromDate(10)).toBe(18.9) -->

This function returns the last second of a given date. Here, 1 and -1 really mean _next_ and _previous_. They are also an essential part of the algorithm, not a configuration. It doesn’t make sense to change 1 to 2 because it will break the function. Constants make the code longer and don’t help us understand it. Let’s remove them:

<!--
const addDays = (x, y) => x + y * 10
const addSeconds = (x, y) => x + y
const startOfDay = x => x - 0.1
-->

```js
function getEndOfDayFromDate(date) {
  const nextDay = addDays(startOfDay(date), 1);
  return addSeconds(nextDay, -1);
}
```

<!-- expect(getEndOfDayFromDate(10)).toBe(18.9) -->

Now, the code is short and clear, with enough information to understand it.

{#enums}

## Group related constants

We often use constants for ranges of values:

```js
const SMALL = 'small';
const MEDIUM = 'medium';
```

These constants are related — they define different values of the same scale, size of something, and are likely to be used interchangeably. However, it’s not clear from the names that they are related. We could add a suffix:

```js
const SMALL_SIZE = 'small';
const MEDIUM_SIZE = 'medium';
```

Now, it’s clear that these values are related, thanks to the `_SIZE` suffix. But we can do better:

```js
const SIZE_SMALL = 'small';
const SIZE_MEDIUM = 'medium';
```

The common part of the names, the `SIZE_` prefix, is aligned, making it easier to notice related constants in the code.

Another option is to use an object:

```js
const Size = {
  Small: 'small',
  Medium: 'medium'
};
```

It has some additional benefits over separate constants:

- We only need to import it once (`import { Size } from '...'` instead of `import { SIZE_SMALL, SIZE_MEDIUM } from '...'`).
- Better autocomplete after typing `Size.`

However, my favorite approach is to use a TypeScript enum:

```ts
enum Size {
  Small = 'small',
  Medium = 'medium'
}
```

T> Usually, enum names are singular nouns in PascalCase, like `Month`, `Color`, `OrderStatus`, or `ProductType`.

Which is essentially the same as an object, but we can also use it as a type:

```ts
interface ButtonProps {
  size: Size;
}
```

This gives us better type checking and even better autocomplete. For example, we can define separate types for button sizes and modal sizes, so the button component will only accept valid button sizes.

{#abbr}

## Abbreviations and acronyms

The road to hell is paved with abbreviations. What do you think OTC, RN, PSP, or SDL mean? I also don’t know, and these are just from one project. That’s why I try to avoid abbreviations almost everywhere, not just in code.

There’s a [list of dangerous abbreviations](https://www.nccmerp.org/recommendations-enhance-accuracy-prescription-writing) for doctors prescribing medicine. We should have the same for IT professionals.

I’d even go further and create a list of _approved_ abbreviations. I could only find one example of such a list — [from Apple](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CodingGuidelines/Articles/APIAbbreviations.html) — and I think it could be a great start.

Common abbreviations are okay; we don’t even think of most of them as abbreviations:

| Abbreviation | Full term |
| --- | --- |
| `alt` | alternative |
| `app` | application |
| `arg` | argument |
| `err` | error |
| `info` | information |
| `init` | initialize |
| `max` | maximum |
| `min` | minimum |
| `param` | parameter |
| `prev` | previous (especially when paired with `next`) |

As well as common acronyms, such as:

- HTML;
- HTTP;
- JSON;
- PDF;
- RGB;
- URL.

And possibly a few very common ones used on a project, but they still should be documented (new team members will be very thankful for that!) and shouldn’t be ambiguous.

{#prefixes-suffixes}

## Prefixes and suffixes

I like to use the following prefixes for function names:

- `get`: returns a value (example: `getPageTitle`).
- `set`: stores a value or updates React state (example: `setProducts`)
- `fetch`: fetches data from the backend (example: `fetchMessages`).
- `reset`: resets something to its initial state (example: `resetForm`).
- `remove`: removes something from somewhere (example: `removeFilter`).
- `to`: converts the data to a certain type (examples: `toString`, `hexToRgb`, `urlToSlug`).
- `on` and `handle` for event handlers (examples: `onClick`, `handleSubmit`).

I> Verb prefixes are also called _actions_ in the A/HC/LC pattern. See more in the [Use the A/HC/LC pattern](#a-hc-lc) section later in this chapter.

And the following prefixes for boolean variables or functions that return a boolean value:

- `is`, `are`, `has`, or `should` (examples: `isPhoneNumberValid`, `hasCancelableTickets`).

These conventions make code easier to read and distinguish functions that return values from those with side effects.

T> Don’t combine `get` with other prefixes: I often see names like `getIsCompaniesFilterDisabled` or `getShouldShowPasswordHint`, which should be just `isCompaniesFilterDisabled` or `shouldShowPasswordHint`, or even better `isCompaniesFilterEnabled`. On the other hand, `setIsVisible` is perfectly fine when paired with `isVisible`.

I also make an exception for React components, where I prefer to skip the `is` prefix, similar to HTML properties like `<button disabled>`:

<!-- const ButtonStyled = ({children}) => children -->

```jsx
function PayButton({ loading, onClick, id, disabled }) {
  return (
    <ButtonStyled
      id={id}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      Pay now!
    </ButtonStyled>
  );
}
```

<!--
const {container: c1} = RTL.render(<PayButton />);
expect(c1.textContent).toEqual('Pay now!')
-->

And I wouldn’t use `get` [for class property accessors](https://www.nikolaposa.in.rs/blog/2019/01/06/better-naming-convention/) (even read-only):

```js
class User {
  #firstName;
  #lastName;

  constructor(firstName, lastName) {
    this.#firstName = firstName;
    this.#lastName = lastName;
  }

  get fullName() {
    return [this.#firstName, this.#lastName].join(' ');
  }
}
```

<!--
const user = new User('Chuck', 'Norris')
expect(user.fullName).toBe('Chuck Norris')
-->

In general, I don’t like to remember too many rules, and any convention can go too far. A good example, and fortunately almost forgotten, is [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation), where each name is prefixed with its type, or with its intention or kind. For example, `lAccountNum` (long integer), <!-- cspell:disable -->`arru8NumberList`<!-- cspell:enable --> (array of unsigned 8-bit integers), `usName` (unsafe string).

Hungarian notation made sense for old untyped languages like C, but with modern typed languages and IDEs that show types when you hover over the name, it clutters the code and makes reading each name harder. So, keep it simple.

One of the examples of Hungarian notation in the modern frontend is prefixing TypeScript interfaces with `I`:

```ts
interface ICoordinates {
  lat: number;
  lon: number;
}
```

Luckily, most TypeScript developers prefer to drop it these days:

```ts
interface Coordinates {
  lat: number;
  lon: number;
}
```

I would generally avoid repeating information in the name that’s already accessible in its type, class name, or namespace.

I> We talk more about conventions in the [Code style](#code-style) chapter.

## Next and previous values

Often, we need to create a new value based on the previous value of a certain variable or object.

Consider this example:

<!--
let count_
let useState = (initialValue) => {
  count_ = initialValue
  return [initialValue, fn => count_ = fn(count_)]
}
-->

```js
const [count, setCount] = useState(0);
setCount(prevCount => prevCount + 1);
```

<!-- expect(count_).toBe(1) -->

In the code above, we have a basic counter function that returns the next counter value. The `prev` prefix makes it clear that this value is out of date.

Similarly, when we need to store the new value in a variable, we can use the `next` prefix:

<!--
let window = { location: { href: 'http://example.com/?tacos=many' } }
let history = { replaceState: (x, y, z) => window.location.href = z }
-->

```js
function updateUrlState(name, action) {
  const url = new URL(window?.location.href);
  const value = url.searchParams.get(name);
  const nextValue = _.isFunction(action)
    ? action(value)
    : action;
  url.searchParams.set(name, String(nextValue));
  const nextUrl = url.toString();
  history.replaceState(null, '', nextUrl);
}
```

<!--
updateUrlState('tacos', 'lots')
expect(window.location.href).toBe('http://example.com/?tacos=lots')
-->

Both conventions are widely used by React developers.

## Beware of incorrect names

_Incorrect_ names are worse than magic numbers. With magic numbers, there’s a possibility of making a correct guess, but with incorrect names, we have no chance of understanding the code.

Consider this example:

<!-- eslint-disable unicorn/numeric-separators-style -->

```js
// Constant used to correct a Date object's time to reflect
// a UTC timezone
const TIMEZONE_CORRECTION = 60000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * TIMEZONE_CORRECTION
  );
```

<!-- expect(getUTCDateTime({ getTime: () => 1686815699187, getTimezoneOffset: () => -120 }).toISOString()).toBe('2023-06-15T09:54:59.187Z') -->

Even a comment doesn’t help us understand what this code does.

What’s actually happening here is that the `getTime()` function returns milliseconds while the `getTimezoneOffset()` returns minutes, so we need to convert minutes to milliseconds by multiplying minutes by the number of milliseconds in one minute. 60000 is exactly this number.

Let’s correct the name:

```js
const MILLISECONDS_IN_MINUTE = 60_000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
  );
```

<!-- expect(getUTCDateTime({ getTime: () => 1686815699187, getTimezoneOffset: () => -120 }).toISOString()).toBe('2023-06-15T09:54:59.187Z') -->

Now, it’s much easier to understand the code.

I> Underscores (`_`) as separators for numbers were introduced in ECMAScript 2021 and make long numbers easier to read: `60_000` instead of `60000`.

Types often make incorrect names more noticeable:

```ts
interface Order {
  id: number;
  title: string;
}
interface State {
  filteredOrder: Order[];
  selectedOrder: number[];
}
```

By looking at the types, it’s clear that both names should be plural (they contain arrays), and the `selectedOrder` only contains order IDs, not whole order objects:

<!-- type Order = { id: number, title: string } -->

```ts
interface State {
  filteredOrders: Order[];
  selectedOrderIds: number[];
}
```

We often change the logic but forget to update the names to reflect that. This makes understanding the code much harder and can lead to bugs when we later change the code and make incorrect assumptions based on incorrect names.

## Beware of abstract and imprecise names

_Abstract_ and _imprecise_ names are less dangerous than incorrect names. However, they are unhelpful and make the code harder to understand.

**Abstract names** are too generic to give any useful information about the value they hold:

- `data`;
- `list`;
- `array`;
- `object`.

The problem with such names is that any variable contains _data_, and any array is a _list_ of something. These names don’t say what kind of data it is or what kind of things are in the list. Essentially, such names aren’t better than `x`/`y`/`z`, `foo`/`bar`/`baz`, `New Folder 39`, or `Untitled 47`.

Consider this example:

<!--
import { Record } from 'immutable'
const UPDATE_RESULTS = 'ur', UPDATE_CART = 'uc'
const Currency = Record({
  iso: '',
  name: '',
  symbol: '',
})
-->

<!-- eslint-skip -->

```js
function currencyReducer(state = new Currency(), action) {
  switch (action.type) {
    case UPDATE_RESULTS:
    case UPDATE_CART:
      if (!action.res.data.query) {
        return state;
      }

      const iso = _.get(
        action,
        'res.data.query.userInfo.userCurrency'
      );
      const obj = _.get(
        action,
        `res.data.currencies[${iso}]`
      );

      return state
        .set('iso', iso)
        .set('name', _.get(obj, 'name'))
        .set('symbol', _.get(obj, 'symbol'));
    default:
      return state;
  }
}
```

<!--
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: { eur: {name: 'Euro', symbol: '€' } } } } }).toJS()).toEqual({iso: 'eur', name: 'Euro', symbol: '€'})
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: {} } } }).toJS()).toEqual({iso: 'eur', name: '', symbol: ''})
-->

Besides using Immutable.js and Lodash’s [`get()` method](https://lodash.com/docs#get), which already makes the code hard to read, the `obj` variable makes the code even harder to understand.

All this code does is reorganize the data about the user’s currency into a neat object:

<!--
import { Record } from 'immutable'
const UPDATE_RESULTS = 'ur', UPDATE_CART = 'uc'
const Currency = Record({
  iso: '',
  name: '',
  symbol: '',
})
-->

```js
const currencyReducer = (state = new Currency(), action) => {
  switch (action.type) {
    case UPDATE_RESULTS:
    case UPDATE_CART: {
      const { data } = action.res;
      if (data.query === undefined) {
        return state;
      }

      const iso = data.query.userInfo?.userCurrency;
      const { name = '', symbol = '' } =
        data.currencies[iso] ?? {};

      return state.merge({ iso, name, symbol });
    }
    default: {
      return state;
    }
  }
};
```

<!--
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: { eur: {name: 'Euro', symbol: '€' } } } } }).toJS()).toEqual({iso: 'eur', name: 'Euro', symbol: '€'})
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: {} } } }).toJS()).toEqual({iso: 'eur', name: '', symbol: ''})
-->

Now, it’s clearer what shape of data we’re building here, and even Immutable.js isn’t so intimidating. I kept the `data` name because that’s how it’s coming from the backend, and it’s commonly used as a root object for whatever the backend API is returning. As long as we don’t leak it into the app code and only use it during the initial processing of the raw backend data, it’s okay.

Abstract names are also okay for generic utility functions, like array filtering or sorting:

```js
function findFirstNonEmptyArray(...arrays) {
  return (
    arrays.find(
      array => Array.isArray(array) && array.length > 0
    ) ?? []
  );
}
```

<!-- expect(findFirstNonEmptyArray([], [1], [2,3])).toEqual([1]) -->

In the code above, `arrays` and `array` are totally fine since that’s exactly what they represent: generic arrays. We don’t yet know what values they will contain, and for the context of this function, it doesn’t matter — it can be anything.

**Imprecise names** don’t describe a value enough to be useful. One of the common cases is names with number suffixes. Usually, this happens for the following reasons:

- **Multiple objects:** we have several entities of the same kind.
- **Data processing:** we process data in some way and use suffixed names to store the result.
- **New version:** we make a new version of an already existing module, function, or component.

In all cases, the solution is to clarify each name.

**For multiple objects and data processing**, I try to find something that differentiates the values to make the names more precise.

Consider this example:

<!--
const StatusCode = {SuccessCreated: 201}
const test = (comment, fn) => fn(), login = () => {}
const request = () => ({get: () => ({set: () => ({set: () => ({headers: {}, status: 200, body: {data: {}}})})}), post: () => ({send: () => ({set: () => ({headers: {}, status: 200, body: {data: {}}, set: () => ({headers: {}, status: 200, body: { data:{}}})})})})})
const users = [], app = () => {}, usersEndpoint = 'http://localhost', loginEndpoint = 'http://localhost'
const collections = { users: { insertMany: () => {} } }
function expect() { return { toBe: () => {}, toHaveProperty: () => {}, toEqual: () => {} } }
expect.stringContaining = () => {}
expect.stringMatching = () => {}
expect.objectContaining = () => {}
expect.arrayContaining = () => {}
-->

```js
test('creates new user', async () => {
  const username = 'cosmo';

  await collections.users.insertMany(users);

  // Log in
  const cookies = await login();

  // Create user
  const response = await request(app)
    .post(usersEndpoint)
    .send({ username })
    .set('Accept', 'application/json')
    .set('Cookie', cookies);

  expect(response.headers).toHaveProperty(
    'content-type',
    expect.stringContaining('json')
  );
  expect(response.status).toBe(StatusCode.SuccessCreated);
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toEqual(
    expect.objectContaining({
      username,
      password: expect.stringMatching(
        /^(?:[a-z]+-){2}[a-z]+$/
      )
    })
  );

  // Log in with the new user
  const response2 = await request(app)
    .post(loginEndpoint)
    .send({
      username,
      password: response.body.data.password
    })
    .set('Accept', 'application/json');

  // Fetch users
  const response3 = await request(app)
    .get(usersEndpoint)
    .set('Accept', 'application/json')
    .set('Cookie', response2.headers['set-cookie']);

  expect(response3.body).toHaveProperty('data');
  expect(response3.body.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ username: 'chucknorris' }),
      expect.objectContaining({ username })
    ])
  );
});
```

<!-- // This would be difficult to test so we only run the text function to make sure there are no syntax errors -->

In the code above, we send a sequence of network requests to test a REST API. However, the names `response`, `response2`, and `response3` make the code harder to understand, especially when we use the data returned by one request to create the next one. We can make the names more precise:

<!--
let test = () => {}, login = () => {}
let collections = { users: { insertMany: () => {} } }
const request = () => ({get: () => ({set: () => ({set: () => ({headers: {}, status: 200, body: {data: {}}})})}), post: () => ({send: () => ({set: () => ({headers: {}, status: 200, body: {data: {}}, set: () => ({headers: {}, status: 200, body: { data:{}}})})})})})
function expect() { return { toBe: () => {}, toHaveProperty: () => {}, toEqual: () => {} } }
expect.stringContaining = () => {}
expect.stringMatching = () => {}
expect.objectContaining = () => {}
-->

```js
test('creates new user', async () => {
  const username = 'cosmo';

  await collections.users.insertMany(users);

  // Log in
  const cookies = await login();

  // Create user
  const createResponse = await request(app)
    .post(usersEndpoint)
    .send({ username })
    .set('Accept', 'application/json')
    .set('Cookie', cookies);

  expect(createResponse.headers).toHaveProperty(
    'content-type',
    expect.stringContaining('json')
  );
  expect(createResponse.status).toBe(
    StatusCode.SuccessCreated
  );
  expect(createResponse.body).toHaveProperty('data');
  expect(createResponse.body.data).toEqual(
    expect.objectContaining({
      username,
      password: expect.stringMatching(
        /^(?:[a-z]+-){2}[a-z]+$/
      )
    })
  );

  // Log in with the new user
  const loginResponse = await request(app)
    .post(loginEndpoint)
    .send({
      username,
      password: createResponse.body.data.password
    })
    .set('Accept', 'application/json');

  // Fetch users
  const usersResponse = await request(app)
    .get(usersEndpoint)
    .set('Accept', 'application/json')
    .set('Cookie', loginResponse.headers['set-cookie']);

  expect(usersResponse.body).toHaveProperty('data');
  expect(usersResponse.body.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ username: 'chucknorris' }),
      expect.objectContaining({ username })
    ])
  );
});
```

<!-- // This would be difficult to test so we only run the text function to make sure there are no syntax errors -->

Now, it’s clear which request data we’re accessing at any given time.

For a **new version**, I try to rename the old module, function, or component to something like `ModuleLegacy` instead of naming the new one `Module2` or `ModuleNew`, and keep using the original name for the new implementation.

It’s not always possible, but it makes using the old, deprecated module more awkward than the new, improved one — exactly what we want to achieve. Also, names tend to stick forever, even when the original module is long gone. Names like `Module2` or `ModuleNew` are fine during development, though, when the new module isn’t yet fully functional or well tested.

{#a-hc-lc}

## Use the A/HC/LC pattern

To improve the consistency and clarity of function names, we can follow the A/HC/LC pattern:

```
prefix? + action (A) + high context (HC) + low context? (LC)
```

Let’s see how it works on several examples:

| Name | Prefix | Action | High context | Low context |
| --- | --- | --- | --- | --- |
| `getRecipe` |  | `get` | `recipe` |  |
| `getRecipeIngredients` |  | `get` | `recipe` | `ingredients` |
| `handleUpdateResponse` |  | `handle` | `update` | `response` |
| `shouldShowFooter` | `should` | `show` | `footer` |  |

I> Read more about the [A/HC/LC pattern](https://github.com/kettanaito/naming-cheatsheet?tab=readme-ov-file#ahclc-pattern) in Artem Zakharchenko’s Naming cheat sheet.

## Use common terms

It’s a good idea to use well-known and widely adopted terms for programming and domain concepts instead of inventing something cute or clever but likely misunderstood. This is especially problematic for non-native English speakers because we usually don’t know many rare and obscure words.

[A “great” example](https://stackoverflow.com/questions/33742899/where-does-reacts-scryrendereddomcomponentswithclass-method-name-come-from) of this is the React codebase, where they used “scry” (meaning something like _peeping into the future through a crystal ball_) instead of “find”.

## Use a single term for each concept

Using different words for the same concept is confusing. A person reading the code may think that since the words are different, these things aren’t the same and will try to find the difference between the two. It will also make the code less _greppable_, meaning it will be harder to find all uses of the same thing.

I> We talk more about greppability in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

T> Having a project dictionary, or even a linter, might be a good idea to avoid using different words for the same things. [CSpell](https://cspell.org) allows us to create a project dictionary and ban certain words that shouldn’t be used. I use a similar approach for writing this book: I use the [Textlint terminology plugin](https://github.com/sapegin/textlint-rule-terminology) to make sure I use the terms consistently and spell them correctly in my writing.

## Prefer US English

Most APIs and programming languages use US English, so it makes a lot of sense to use US English for naming in our project as well. Unless we’re working on a British, Canadian, or Australian project, where the local language may be a better choice.

In any case, consistency is more important than language choice. On several projects, I’ve seen US and UK terms used interchangeably. For example, _canceling_ (US) and _cancelling_ (UK). (Curiously, _cancellation_ is the correct spelling in both.)

Some common words that are spelled differently:

<!-- cspell:disable -->

| US English | UK English |
| ---------- | ---------- |
| behavior   | behaviour  |
| canceling  | cancelling |
| center     | centre     |
| color      | colour     |
| customize  | customise  |
| favorite   | favourite  |
| license    | licence    |
| math       | maths      |
| optimize   | optimise   |

<!-- cspell:enable -->

T> [CSpell](https://cspell.org) allows us to choose between US and UK English and will highlight inconsistencies in code and comments, though some words are present in both dictionaries.

## Use common opposite pairs

Often, we create pairs of variables or functions that do the opposite operations or hold values that are on the opposite ends of the range. For example, `startServer`/`stopServer` or `minWidth`/`maxWidth`. When we see one, we expect to see the other, and we expect it to have a certain name because it either sounds natural in English (if one happened to be a native speaker) or has been used by generations of programmers before us.

Some of these common pairs are:

| Term      | Opposite  |
| --------- | --------- |
| add       | remove    |
| begin     | end       |
| create    | delete    |
| enable    | disable   |
| first     | last      |
| get       | set       |
| increment | decrement |
| lock      | unlock    |
| minimum   | maximum   |
| next      | previous  |
| old       | new       |
| open      | close     |
| read      | write     |
| send      | receive   |
| show      | hide      |
| start     | stop      |
| target    | source    |

T> There’s a certain debate on where to use _remove_ and where _delete_. I’m not so picky about this and recommend sticking to the add/remove and create/delete pairs where it makes sense. Otherwise, I’m okay with either. The difference isn’t as clear as some like to think: for example, on the Unix command line we _remove_ files using the `rm` command, but on Windows we _delete_ them using the `del` command.

## Check the spelling of your names

Typos in names and comments are very common. They don’t cause bugs _most of the time_, but could still reduce readability a bit, and code with many <!-- cspell:disable -->“typoses”<!-- cspell:enable --> looks sloppy. Typos also make the code less greppable. So having a spell checker in the code editor is a good idea.

I> We talk more about spell checking in the [Spell checking](#spell-checking) section of the _Learn your code editor_ chapter, and about code greppability in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

## Use established naming conventions

Each programming language has its own conventions and idiomatic way of doing certain things, including the way programmers spell the names of variables, functions, and other symbols in the code: _naming conventions_.

The most popular naming conventions are:

- camelCase;
- kebab-case.
- PascalCase;
- snake_case;
- SCREAMING_SNAKE_CASE.

T> There are also lowercase, UPPERCASE, and SpoNGEcAsE, but I wouldn’t recommend them because these conventions make it hard to distinguish separate words.

Most JavaScript and TypeScript style guides suggest the following:

- camelCase for variable names and functions;
- PascalCase for class names, types, and components;
- SCREAMING_SNAKE_CASE for constants.

T> One of the benefits of naming conventions that use an underscore (`_`) or nothing to glue words together over conventions that use a dash (`-`) is that we can select a full name using a double-click, or Alt+Shift+Left, or Alt+Shift+Right hotkeys (these hotkeys expand the selection to the word boundary).

The code that doesn’t follow the established naming conventions for a particular language looks awkward for developers who are used to these conventions. For example, here’s a JavaScript snippet that uses snake_case names:

<!-- let console = { log: vi.fn() } -->

```js
const fruits = ['Guava', 'Papaya', 'Pineapple'];
const loud_fruits = fruits.map(fruit => fruit.toUpperCase());
console.log(loud_fruits);
// → ['GUAVA', 'PAPAYA', 'PINEAPPLE']
```

<!-- expect(loud_fruits).toEqual(['GUAVA', 'PAPAYA', 'PINEAPPLE']) -->

Note the use of different naming conventions: `loud_fruits` uses snake_case, and `toUpperCase` uses camelCase.

Now, compare it with the same code using camelCase:

<!-- let console = { log: vi.fn() } -->

```js
const fruits = ['Guava', 'Papaya', 'Pineapple'];
const loudFruits = fruits.map(fruit => fruit.toUpperCase());
console.log(loudFruits);
// → ['GUAVA', 'PAPAYA', 'PINEAPPLE']
```

<!-- expect(loudFruits).toEqual(['GUAVA', 'PAPAYA', 'PINEAPPLE']) -->

Since JavaScript’s own methods and browser APIs all use camelCase (for example, `forEach()`, `toUpperCase()`, or `scrollIntoView()`), using camelCase for our own variables and functions feels natural.

However, in Python, where snake_case is common, it looks natural:

```python
fruits = ['Guava', 'Papaya', 'Pineapple']
loud_fruits = [fruit.upper() for fruit in fruits]
print(loud_fruits)
```

One thing that developers often disagree on is how to spell acronyms (for example, HTML) and words with unusual casing (for example, iOS). There are several approaches:

- Keep the original spelling: `dangerouslySetInnerHTML`, <!-- cspell:disable -->`WebiOS`<!-- cspell:enable -->;
- Do something weird: `XMLHttpRequest`, `DatePickerIOS`, <!-- cspell:disable -->`HTMLHRElement`<!-- cspell:enable -->;
- Normalize the words: `WebIos`, `XmlHttpRequest`, `HtmlHrElement`.

Unfortunately, the most readable approach, normalization, seems to be the least popular. Since we can’t use spaces in names, it can be hard to separate words: <!-- cspell:disable -->`WebiOS`<!-- cspell:enable --> could be read as <!-- cspell:disable -->`webi os`<!-- cspell:enable --> instead of `web ios`, and it takes extra time to read it correctly. Such names also don’t work well with code spell checkers: they mark <!-- cspell:disable -->`webi`<!-- cspell:enable --> and <!-- cspell:disable -->`htmlhr`<!-- cspell:enable --> as incorrect words.

The normalized spelling doesn’t have these issues: `dangerouslySetInnerHtml`, `WebIos`, `XmlHttpRequest`, `DatePickerIos`, or `HtmlHrElement`. The word boundaries are clear.

## Avoid unnecessary variables

Often, we add intermediate variables to store the result of an operation before passing it somewhere else or returning it from the function. In many cases, this variable is unnecessary.

Consider this example:

<!--
let state = null;
let setState = (value) => { state = value }
let handleUpdateResponse = x => x
-->

```js
function handleUpdate(response) {
  const result = handleUpdateResponse(response.status);
  setState(result);
}
```

<!--
handleUpdate({ status: 200 })
expect(state).toBe(200)
-->

And this one:

```js
async function handleResponse(response) {
  const data = await response.json();
  return data;
}
```

<!-- expect(handleResponse({ json: () => Promise.resolve(42) })).resolves.toBe(42) -->

In both cases, the `result` and `data` variables don’t add much to the code. The names don’t adding new information, and the code is short enough to be inlined:

<!--
let state = null;
let setState = (value) => { state = value }
let handleUpdateResponse = x => x
-->

```js
function handleUpdate(response) {
  setState(handleUpdateResponse(response.status));
}
```

<!--
handleUpdate({ status: 200 })
expect(state).toBe(200)
-->

Or for the second example:

```js
function handleResponse(response) {
  return response.json();
}
```

<!-- expect(handleResponse({ json: () => Promise.resolve(42) })).resolves.toBe(42) -->

Here’s another example that checks whether the browser supports CSS transitions by probing available CSS properties:

<!-- function test(document) { -->

```jsx
let b = document.body.style;
if (
  b.MozTransition == '' ||
  b.WebkitTransition == '' ||
  b.OTransition == '' ||
  b.transition == ''
) {
  document.documentElement.className += ' trans';
}
```

<!--
}
let document1 = {
  documentElement: { className: '' },
  body: { style: {} }
}
test(document1)
expect(document1.documentElement.className).toBe('')

let document2 = {
  documentElement: { className: '' },
  body: { style: { transition: '' } }
}
test(document2)
expect(document2.documentElement.className).toBe(' trans')
-->

In the code above, the alias `b` replaces a clear name `document.body.style` with not just an obscure one but misleading: `b` and `styles` are unrelated. Inlining makes the code too long because the style values are accessed many times, but having a clearer shortcut would help a lot:

<!-- function test(document) { -->

```jsx
const { style } = document.body;
if (
  style.MozTransition === '' ||
  style.WebkitTransition === '' ||
  style.OTransition === '' ||
  style.transition === ''
) {
  document.documentElement.className += ' trans';
}
```

<!--
}
let document1 = {
  documentElement: { className: '' },
  body: { style: {} }
}
test(document1)
expect(document1.documentElement.className).toBe('')

let document2 = {
  documentElement: { className: '' },
  body: { style: { transition: '' } }
}
test(document2)
expect(document2.documentElement.className).toBe(' trans')
-->

Another case is when we create an object to hold a group of values but never use it as a whole (for example, to pass it to another function), only to access separate properties in it. It makes us waste time inventing a new variable name, and we often end up with something awkward.

For example, we can use such an object to store a function return value:

<!--
const console = { log: vi.fn() }
const parseMs = (x) => ({minutes: x, seconds: 0}), durationSec = 5
-->

```js
const duration = parseMs(durationSec * 1000);

// Then later we access the values like so:
console.log(duration.minutes, duration.seconds);
```

<!-- expect(duration.minutes).toBe(5000)-->

In the code above, the `duration` variable is only used as a container for `minutes` and `seconds` values. By using destructuring we could skip the intermediate variable:

<!-- const parseMs = (x) => ({minutes: x, seconds: 0}), durationSec = 5 -->

```js
const { minutes, seconds } = parseMs(durationSec * 1000);
```

<!-- expect(minutes).toBe(5000)-->

Now, we can access `minutes` and `seconds` directly.

Functions with optional parameters grouped in an object are another common example:

<!--
let document = window.document;
const hiddenInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};
-->

<!-- eslint-skip -->

```js
function submitFormData(action, options) {
  const form = document.createElement('form');

  form.method = options.method;
  form.action = action;
  form.target = options.target;

  if (options.parameters) {
    Object.keys(options.parameters)
      .map(paramName =>
        hiddenInput(paramName, options.parameters[paramName])
      )
      .forEach(form.appendChild.bind(form));
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
```

<!--
expect(submitFormData('/foo', { method: 'post', target: '_top', parameters: {a: 42} }))
expect(submitFormData('/foo', { method: 'post', target: '_top' }))
-->

We can use destructuring again to simplify the code:

<!--
let document = window.document;
const hiddenInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};
-->

<!-- eslint-disable unicorn/prefer-dom-node-append, unicorn/prefer-dom-node-remove -->

```js
function submitFormData(
  action,
  { method, target, parameters }
) {
  const form = document.createElement('form');

  form.method = method;
  form.action = action;
  form.target = target;

  if (parameters) {
    for (const [name, parameter] of Object.entries(
      parameters
    )) {
      const input = hiddenInput(name, parameter);
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
```

<!--
expect(submitFormData('/foo', { method: 'post', target: '_top', parameters: {a: 42} }))
expect(submitFormData('/foo', { method: 'post', target: '_top' }))
-->

We removed the `options` object that was used in almost every line of the function body, making the function shorter and more readable.

Sometimes, intermediate variables can serve as comments, explaining the data they hold that might not otherwise be clear:

<!--
const hasTextLikeOnlyChildren = () => false
const Flex = ({children}) => <>{children}</>
const Body = ({children}) => <>{children}</>
-->

```jsx
function Tip({ type, content }) {
  const shouldBeWrapped = hasTextLikeOnlyChildren(content);

  return (
    <Flex alignItems="flex-start">
      {shouldBeWrapped ? (
        <Body type={type}>{content}</Body>
      ) : (
        content
      )}
    </Flex>
  );
}
```

<!--
const {container: c1} = RTL.render(<Tip type="pizza" content="Hola" />);
expect(c1.textContent).toEqual('Hola')
-->

Another good reason to use an intermediate variable is to split a long line of code into multiple lines. Consider this example of an SVG image stored as a CSS URL:

```js
const borderImage = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M2 2h2v2H2zM4 0h2v2H4zM10 4h2v2h-2zM0 4h2v2H0zM6 0h2v2H6zM8 2h2v2H8zM8 8h2v2H8zM6 10h2v2H6zM0 6h2v2H0zM10 6h2v2h-2zM4 10h2v2H4zM2 8h2v2H2z' fill='%23000'/></svg>")`;
```

<!-- expect(borderImage).toMatch('<svg ') -->

Lack of formatting makes it hard to read and modify. Let’s split it into several variables:

```js
const borderPath = `M2 2h2v2H2zM4 0h2v2H4zM10 4h2v2h-2zM0 4h2v2H0zM6 0h2v2H6zM8 2h2v2H8zM8 8h2v2H8zM6 10h2v2H6zM0 6h2v2H0zM10 6h2v2h-2zM4 10h2v2H4zM2 8h2v2H2z`;
const borderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='${borderPath}' fill='%23000'/></svg>`;
const borderImage = `url("data:image/svg+xml,${borderSvg}")`;
```

<!-- expect(borderImage).toMatch('<svg ') -->

While there’s still some line wrapping, it’s now easier to see the separate parts the image is composed of.

## Avoiding name clashes

We’ve talked about avoiding number suffixes by making names more precise. Now, let’s explore a few other cases of clashing names and [how to avoid them](https://gist.github.com/sapegin/a46ab46cdd4d6b5045027d120b9c967d).

I often struggle with name clashes for two reasons:

1. Storing a function’s return value (example: `const isCrocodile = isCrocodile()`).
2. Creating a React component to display an object of a certain TypeScript type (example: `const User = (props: { user: User }) => null`).

Let’s start with function return values. Consider this example:

<!-- const getCrocodiles = (x) => ([ x.color ]) -->

```js
const crocodiles = getCrocodiles({ color: 'darkolivegreen' });
```

<!-- expect(crocodiles).toEqual(['darkolivegreen']) -->

In the code above, it’s clear which one is the function and which one is the array returned by the function. Now, consider this:

<!--
let crocodiles = [{type: 'raccoon'}]
let isCrocodile = x => x.type === 'croc'
-->

```js
const _o_0_ = isCrocodile(crocodiles[0]);
```

<!-- expect(_o_0_).toBe(false) -->

In this case, our naming choices are limited:

- `isCrocodile` is a natural choice but clashes with the function name;
- `crocodile` could be interpreted as a variable holding one element of the `crocodiles` array.

So, what can we do about it? Not much:

- choose a domain-specific name (example: `shouldShowGreeting`);
- inline the function call and avoid a local variable altogether;
- choose a more specific name (examples: `isFirstItemCrocodile` or `isGreenCrocodile`);
- shorten the name if the scope is small (example: `isCroc`).

Unfortunately, all options are somewhat not ideal:

- Inlining can make the code more verbose, especially if the function’s result is used several times or if the function has multiple parameters. It can also affect performance, though it usually doesn’t.
- Longer names can also make the code a bit more verbose.
- Short names can be confusing.

I usually use domain-specific names or inlining (for very simple calls, used once or twice):

<!-- const isCrocodile = x => x.type === 'croc' -->

```jsx
function UserProfile({ user }) {
  const shouldShowGreeting = isCrocodile(user);
  return (
    <section>
      {shouldShowGreeting && (
        <p>Hola, green crocodile, the ruler of the Galaxy!</p>
      )}
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </section>
  );
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} />);
expect(c1.textContent).toEqual('Hola, green crocodile, the ruler of the Galaxy!Name: GenaAge: 37')
const {container: c2} = RTL.render(<UserProfile user={{type: 'che', name: 'Cheburashka', age: '12'}} />);
expect(c2.textContent).toEqual('Name: CheburashkaAge: 12')
-->

The `shouldShowGreeting` name describes how the value is used (domain-specific name) — to check _whether we need to show a greeting_, as opposed to the value itself — _whether the user is a crocodile_. This has another benefit: if we decide to change the condition, we don’t need to rename the variable.

For example, we could decide to greet crocodiles only in the morning:

<!-- const isCrocodile = x => x.type === 'croc' -->

```jsx
function UserProfile({ user, date }) {
  const shouldShowGreeting =
    isCrocodile(user) && date.getHours() < 10;
  return (
    <section>
      {shouldShowGreeting && (
        <p>Hola, green crocodile, the ruler of the Galaxy!</p>
      )}
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </section>
  );
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} date={new Date(2023,1,1,9,37,0)} />);
expect(c1.textContent).toEqual('Hola, green crocodile, the ruler of the Galaxy!Name: GenaAge: 37')
const {container: c2} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} date={new Date(2023,1,1,17,37,0)} />);
expect(c2.textContent).toEqual('Name: GenaAge: 37')
-->

The name still makes sense when something like `isCroc` becomes incorrect.

Unfortunately, I don’t have a good solution for clashing React components and TypeScript types. This usually happens when we create a component to render an object or a certain type:

```tsx
interface User {
  name: string;
  email: string;
}

export function User({ user }: { user: User }) {
  return (
    <p>
      {user.name} ({user.email})
    </p>
  );
}
```

<!--
const {container: c1} = RTL.render(<User user={{ name: 'Chuck', email: '@' }} />);
expect(c1.textContent).toEqual('Chuck (@)')
-->

Though TypeScript allows using a type and a value with the same name in the same scope, it makes the code confusing.

The only solution I see is renaming either the type or the component. I usually try to rename a component, though it requires some creativity to come up with a name that’s not confusing. For example, names like `UserComponent` or `UserView` would be confusing because other components don’t have these suffixes, but something like `UserProfile` may work in this case:

```tsx
interface User {
  name: string;
  email: string;
}

export function UserProfile({ user }: { user: User }) {
  return (
    <p>
      {user.name} ({user.email})
    </p>
  );
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{ name: 'Chuck', email: '@' }} />);
expect(c1.textContent).toEqual('Chuck (@)')
-->

This matters most when either the type or the component is exported and reused in other places. Local names are more forgiving since they are only used in the same file, and the definition is right there.

---

Names don’t affect the way our code works, but they do affect the way we read it. Misleading or imprecise names can cause misunderstandings and make the code harder to understand and change. They can even cause bugs when we act based on incorrect assumptions caused by bad names.

Additionally, it’s hard to understand what a certain value is when it doesn’t have a name. For example, it could be a mysterious number, an obscure function parameter, or a complex condition. In all these cases, by naming things, we could tremendously improve code readability.

Start thinking about:

- Replacing negative booleans with positive ones.
- Reducing the scope or the lifespan of variables.
- Choosing more specific names for symbols with a larger scope or longer lifespan.
- Choosing shorter names for symbols with a small scope and short lifespan.
- Replacing magic numbers with meaningfully named constants.
- Merging several constants representing a range or a scale into an object or enum.
- Using destructuring or inlining to think less about inventing new names.
- Choosing domain-specific names for local variables instead of more literal names.
