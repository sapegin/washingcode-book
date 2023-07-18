{#naming-is-hard}
# Naming is hard

We all know that naming is one of the hardest problems in programming, and probably most of us have written code like this when we just started programming:

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

I wrote this code more than 20 years ago in Delphi, and, honestly, I don’t really remember what the app was supposed to do. It has it all: single-character names (`i`, `j`), abbreviations (`...Cnt`, `buf`), acronyms (`E`, `sr`, `fp`). It has some comments though! (And I kept the original indentation for full immersion.)

I once worked with a very senior developer who used mostly very short names, and never wrote any comments or tests. Working with their code was like working with Assembler – very difficult. Often we were wasting days tracking and fixing bugs in this code.

Let’s look at these (and many other) naming antipatterns, and how to fix them.

## Negative booleans are not not hard to read

Consider this method:

<!--
class X {
  errors = [];
  set(key, value) { this.errors = value }
-->

```js
validateInputs(values) {
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

<!--
}
const nope = new X();
expect(nope.validateInputs({})).toBe(false)
expect(nope.errors).toEqual(['First name is required', 'Last name is required'])
const yep = new X();
expect(yep.validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(yep.errors).toEqual([])
-->

I can say a lot about this code but let’s focus on this line first:

<!-- const noErrorsFound = true -->

```js
if (!noErrorsFound) {
```

<!-- } -->

The double negation, “if not no errors found…”, makes my brain itch, and I almost want to take a red marker and start crossing out `!`s and `no`s on my screen to be able to read the code.

In most cases we can significantly improve code readability by converting negative booleans to positive ones:

<!--
class X {
  errors = [];
  set(key, value) { this.errors = value }
-->

```js
validateInputs(values) {
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

<!--
}
const nope = new X();
expect(nope.validateInputs({})).toBe(false)
expect(nope.errors).toEqual(['First name is required', 'Last name is required'])
const yep = new X();
expect(yep.validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(yep.errors).toEqual([])
-->

Positive names and positive conditions are usually easier to read than negative ones.

By this time we should already notice that we don’t need the `errorsFound` variable at all: its value can always be derived from the `errorMessages` array:

<!--
class X {
  errors = [];
  set(key, value) { this.errors = value }
-->

```js
validateInputs(values) {
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

<!--
}
const nope = new X();
expect(nope.validateInputs({})).toBe(false)
expect(nope.errors).toEqual(['First name is required', 'Last name is required'])
const yep = new X();
expect(yep.validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(yep.errors).toEqual([])
-->

I’d also split this method into two to isolate side effects and make the code more testable, then remove the condition around `this.set()` call – setting an empty array when there are no errors seems safe enough:

<!--
class X {
  errors = [];
  set(key, value) { this.errors = value }
-->

```js
getErrorMessages(values) {
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
  }

  return errorMessages;
}

validateInputs(values) {
  const errorMessages = this.getErrorMessages(values);
  this.set('error_message', errorMessages);

  return errorMessages.length === 0;
}
```

<!--
}
const nope = new X();
expect(nope.validateInputs({})).toBe(false)
expect(nope.errors).toEqual(['First name is required', 'Last name is required'])
const yep = new X();
expect(yep.validateInputs({firstName: 'Chuck', lastName: 'Norris'})).toBe(true)
expect(yep.errors).toEqual([])
-->

Let’s look at another example:

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

Here, again, every time we read `noData` in the code, we need to mentally _unnegate_ it to understand what’s really happening. And the negative `disabled` attribute makes things even worse. Let’s fix it:

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

Now it’s much easier to read. (And we’ll talk about names like `data` later.)

## The larger the scope, the longer the name

My rule of thumb: the shorter the scope of a variable, the shorter should be its name.

I’m okay, and even prefer, very short variable names for one-liners. Consider these two examples:

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

Here, it’s clear what `x` is in each example, and a longer name would bloat the code without making it more readable, likely less. We already have the full name in the parent function: we’re mapping over the `TRANSITION` object keys, and parsing each key; or we’re mapping over a list of breakpoints, and converting them to strings. It also helps that here we only have a single variable, so any short name will be read as “whatever we’re mapping over”.

I usually use `x` in such cases. I think it’s more or less clear that it’s a placeholder and not an acronym of a particular word.

Some developers prefer `_`, and it’s a good choice for any programming language that’s not JavaScript, where `_` is often used for [Lodash](https://lodash.com/) utility library.

Another convention I’m okay with is using `a`/`b` names for sorting and comparison functions:

<!-- const dates = ['2022-02-26T00:21:00.000+01:00', '2021-05-11T10:30:00.000+01:00'] -->

```js
dates.sort((a, b) => new Date(a).valueOf() - new Date(b).valueOf());
```

<!-- expect(dates).toEqual(['2021-05-11T10:30:00.000+01:00', '2022-02-26T00:21:00.000+01:00']) -->

However, when the scope is longer, or when we have multiple variables, short names could be confusing:

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

Here, it’s totally impossible to understand what’s going on, and meaningless names are one of the main reasons for this.

Let’s try to refactor this code a bit:

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

I’ve seen someone using `_` name for something that’s used across the whole module, possibly dozens or even hundreds of lines or code, an Express router ([the example](https://expressjs.com/en/guide/routing.html) is from Express docs but I changed the name):

```js
const express = require('express');
const _ = express.Router();

// middleware that is specific to this router
_.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});

// define the home page route
_.get('/', (req, res) => {
  res.send('Birds home page');
});

// define the about route
_.get('/about', (req, res) => {
  res.send('About birds');
});

module.exports = _;
```

<!-- // TODO: Can we test this? -->

I cannot imagine the logic behind this convention, and I’m sure it’s going to be confusing for many developers working with the code. It’ll be much worse when the code grows to do something useful.

Let’s bring back the original names:

```js
const express = require('express');
const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', (req, res) => {
  res.send('Birds home page');
});

// define the about route
router.get('/about', (req, res) => {
  res.send('About birds');
});

module.exports = router;
```

<!-- // TODO: Can we test this? -->

Now I don’t have trouble understanding what’s going on here. (Using `req` for request and `res` for response is an Express convention: huge adoption makes it a good idea to keep using it.)

So, `x`, `a`, and `b` are pretty much all single-character variable names I ever use.

On the other hand, long names in a short scope make code cumbersome:

<!-- const purchaseOrders = [{poNumber: 11}, {poNumber: 22}], purchaseOrderData = {poNumber: 22} -->

```js
const index = purchaseOrders.findIndex(
  purchaseOrder =>
    purchaseOrder.poNumber === purchaseOrderData.poNumber
);
```

<!-- expect(index).toBe(1) -->

Here long names make the code look more complex than it is:

<!-- const purchaseOrders = [{poNumber: 11}, {poNumber: 22}], purchaseOrder = {poNumber: 22} -->

```js
const index = purchaseOrders.findIndex(
  po => po.poNumber === purchaseOrder.poNumber
);
```

<!-- expect(index).toBe(1) -->

I think the second version is easier to read.

One of the most common cases for short names is loops: `i`, `j`, and `k` are one of the most common variable names ever, and are usually used to store loop indices. They are moderately readable in short not nested loops, and only because programmers are so used to seeing them in the code. However, in nested loops, it’s getting difficult to understand which index belongs to which array:

<!--
let calls = 0
const pizzaController = { one: {mockReset(){ calls++ }}, two: {mockReset(){ calls++ }} }
-->

```js
const keys = Object.keys(pizzaController);
for (let i = 0; i < keys.length; i += 1) {
  pizzaController[keys[i]].mockReset();
}
```

<!-- expect(calls).toBe(2) -->

I used to use longer names for index variables for a very long time:

<!--
let calls = 0
const pizzaController = { one: {mockReset(){ calls++ }}, two: {mockReset(){ calls++ }} }
-->

```js
const keys = Object.keys(pizzaController);
for (let keyIdx = 0; keyIdx < keys.length; keyIdx += 1) {
  pizzaController[keys[keyIdx]].mockReset();
}
```

<!-- expect(calls).toBe(2) -->

Surely, `keyIdx` is way more readable than `i` but, luckily, most modern languages allow us to iterate over things without coding artisan loops, and without the need for an index variable:

<!--
let calls = 0
const pizzaController = { one: {mockReset(){ calls++ }}, two: {mockReset(){ calls++ }} }
-->

```js
const keys = Object.keys(pizzaController);
keys.forEach(key => {
  pizzaController[key].mockReset();
});
```

<!-- expect(calls).toBe(2) -->

(See [Avoid loops](#avoid-loops) chapter for more examples.)

## The shorter the scope the better

We talked a bit about the scope in the previous section. The length of the variable’s scope affects readability too. The shorter the scope the easier it is to keep track of what’s happening with a variable.

The extreme cases would be:

- One-liner functions, where the scope of a variable is a single line: easy to follow (example: `[8, 16].map(x => x + 'px')`).
- Global variables: a variable can be used or modified anywhere in the project, and there’s no way to know which value it holds at any given moment, which often leads to bugs. That’s why many developers are [advocating against global variables](https://wiki.c2.com/?GlobalVariablesAreBad) for decades.

Usually, the shorter the scope, the better. However, religious scope shortening has the same issues as splitting code into many teeny-tiny functions (see [Divide and conquer, or merge and relax](#divide-and-conquer) chapter): it’s easy to overdo it and make the code less readable, not more.

I found that reducing the lifespan of a variable works as well, and doesn’t produce lots of tiny functions. The idea here is to reduce the number of lines between the variable declaration and the line where it’s accessed for the last time. The scope might be a whole 200-line function but if the lifespan of a particular variable is three lines, then we only need to look at these three lines to understand how this variable is used.

<!-- const MAX_RELATED = 3 -->

```ts
function getRelatedPosts(
  posts: { slug: string; tags: string[]; timestamp: string }[],
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

  const sorted = sortBy(weighted, 'weight').reverse();
  return sorted.slice(0, MAX_RELATED);
}
```

<!--
const posts = [{slug: 'a', tags: ['cooking'], timestamp: 111}, {slug: 'b', tags: ['cooking', 'sleeping'], timestamp: 222}]
expect(getRelatedPosts(posts, {slug: 'c', tags: ['sleeping', 'tacos'], timestamp: 333})).toEqual([{slug: 'b', tags: ['cooking', 'sleeping'], timestamp: 222, weight: 222}])
-->

Here, the lifespan of the `sorted` variable is only two lines. This kind of sequential processing is a common use case for the technique.

(See a larger example in the “Avoid Pascal style variables” section in the [Avoid reassigning variables](#avoid-reassigning-variables) chapter.)

## Abbreviations and acronyms

The road to hell is paved with abbreviations. What do you think are OTC, RN, PSP, SDL? I also don’t know, and these are just from one project. That’s why I try to avoid abbreviations almost everywhere, not just in code.

There’s a [list of dangerous abbreviations](https://www.nccmerp.org/recommendations-enhance-accuracy-prescription-writing) for doctors prescribing medicine. We should have the same for programmers.

I’d even go further and create a list of _approved_ abbreviations. I could only find one example of such a list: [from Apple](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CodingGuidelines/Articles/APIAbbreviations.html), and I think it could be a great start.

Common abbreviations are okay, we don’t even think of most of them as abbreviations:

| Abbreviation | Full term                                     |
| ------------ | --------------------------------------------- |
| `alt`        | alternative                                   |
| `app`        | application                                   |
| `arg`        | argument                                      |
| `err`        | error                                         |
| `info`       | information                                   |
| `init`       | initialize                                    |
| `lat`        | latitude                                      |
| `lon`        | longitude                                     |
| `max`        | maximum                                       |
| `min`        | minimum                                       |
| `param`      | parameter                                     |
| `prev`       | previous (especially when paired with `next`) |

As well as common acronyms:

- HTML
- HTTP
- JSON
- PDF
- RGB
- URL
- XML

And possibly a few very common ones used on a project but they still should be documented (new team members will be very thankful for that!), and shouldn’t be ambiguous.

## Prefixes and suffixes

I like to use a few prefixes for variable and function names:

- `is`, `are`, `has`, or `should` for booleans (examples: `isPhoneNumberValid`, `hasCancellableTickets`).
- `get` for (mostly) pure functions that return a value (example: `getPageTitle`).
- `set` for functions that store a value or React state (example: `setProducts`)
- `fetch` for functions that fetch data from the backend (example: `fetchMessages`).
- `to` for functions that convert the data to a certain type (examples: `toString`, `hexToRgb`, `urlToSlug`).
- `on` and `handle` for event handlers (examples: `onClick`, `handleSubmit`).

I think these conventions make code easier to read, and distinguish functions that return values and ones with side effects.

However, don’t combine `get` with other prefixes: I often see names like `getIsCompaniesFilterDisabled` or `getShouldShowPasswordHint`, which should be just `isCompaniesFilterDisabled` or `shouldShowPasswordHint`, or even better `isCompaniesFilterEnabled`. On the other hand, `setIsVisible` is perfectly fine when paired with `isVisible`:

<!--
let state;
const useState = (x) => { state = x; return [x, (y) => state = y] }
-->

```jsx
const [isVisible, setIsVisible] = useState(false);
```

<!--
setIsVisible(true)
expect(state).toBe(true)
-->

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

In general, I don’t like to remember too many rules, and any convention can go too far. A good example, and fortunately almost forgotten, is a [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation), where each name is prefixed with its type, or with its intention or kind. For example, `lAccountNum` (long integer), `arru8NumberList` (array of unsigned 8-bit integers), `usName` (unsafe string).

Hungarian notation made sense for old untyped languages, like C, but with modern typed languages and IDEs that show types when you hover over the name it clutters the code and makes reading each name harder. So, keep it simple.

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

(We talk a bit more about conventions in the [Code style](#code-style) chapter.)

## Dealing with updates

Imagine a function that allows us to build a new version of an object based on a previous version of the same object:

<!--
let count = 0, textArray = ['eins', 'zwei', 'polizei'];
const setCount = x => count = x(count)
-->

```js
setCount(prevCount => prevCount + 1);
```

<!-- expect(count).toBe(1) -->

Here, we have a simple counter function that returns the next counter value. The `prev` prefix makes it clear that this value is out of date.

Similarly, when the value is not yet applied and the function either lets us modify it or prevent the update:

<!--
class Component {
  constructor(code) {
    this.props = { code }
  }
}
-->

```tsx
class ReactExample extends Component<ReactExampleProps> {
  public shouldComponentUpdate(nextProps: ReactExampleProps) {
    return this.props.code !== nextProps.code;
  }
  public render() {
    return <pre>{this.props.code}</pre>;
  }
}
```

<!--
const c = new ReactExample('Hello world')
expect(c.shouldComponentUpdate({code: 'Hello world'})).toBe(false)
expect(c.shouldComponentUpdate({code: 'Hello crocodile'})).toBe(true)
const {container: c1} = RTL.render(c.render());
expect(c1.textContent).toEqual('Hello world')
-->

Here, we want to avoid unnecessary component rerenders when the `code` hasn’t changed. The `next` prefix makes it clear that this value is going to be applied to the component after the `shouldComponentUpdate` call.

Both of these conventions are widely used by React developers.

## Beware of incorrect names

_Incorrect_ names are worse than magic numbers (read about them in the [Constants](#constants) chapter). With magic numbers, we can make a correct guess but with incorrect names, we have no chance to understand the code.

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

<!-- expect(getUTCDateTime({ getTime: () => 1686815699187, getTimezoneOffset: () => -120 }).toISOString()).toBe('2023-06-15T09:54:59.187Z') -->

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

<!-- expect(getUTCDateTime({ getTime: () => 1686815699187, getTimezoneOffset: () => -120 }).toISOString()).toBe('2023-06-15T09:54:59.187Z') -->

Now it’s much easier to understand the code.

Types (like TypeScript) could help us see when names don’t represent the data correctly:

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

By looking at the types, it’s clear that both names should be plural (they keep arrays) and the second one only contains order IDs but not whole order objects:

<!-- type Order = { id: number, title: string } -->

```ts
type State = {
  filteredOrders: Order[];
  selectedOrderIds: number[];
};
```

We often change the logic but forget to update the names to reflect that. This makes understanding code much harder and could lead to bugs when we later change the code and make wrong assumptions based on incorrect names.

## Beware of abstract and imprecise names

_Abstract_ and _imprecise_ names are probably more unhelpful than dangerous, like incorrect ones.

**Abstract names** are too generic to give any useful information about the data they hold:

- `data`
- `list`
- `array`
- `object`

The problem with such names is that any variable contains _data_, and any array is a _list_ of something. These names don’t say what kind of data it is, or what kind of things the list holds. Essentially, such names aren’t better than `x`/`y`/`z`, `foo`/`bar`/`baz`, `New Folder 39`, or `Untitled 47`.

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

```js
const currencyReducer = (state = new Currency(), action) => {
  switch (action.type) {
    case UPDATE_RESULTS:
    case UPDATE_CART:
      if (!action.res.data.query) {
        return state;
      }

      const iso = get(action, 'res.data.query.userInfo.userCurrency');
      const obj = get(action, `res.data.currencies[${iso}]`);

      return state
        .set('iso', iso)
        .set('name', get(obj, 'name'))
        .set('symbol', get(obj, 'symbol'));
    default:
      return state;
  }
};
```

<!--
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: { eur: {name: 'Euro', symbol: '€' } } } } }).toJS()).toEqual({iso: 'eur', name: 'Euro', symbol: '€'})
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: {} } } }).toJS()).toEqual({iso: 'eur', name: '', symbol: ''})
-->

Besides using Immutable.js and Lodash’s `get` method, which already makes the code hard to read, the `obj` variable makes the code even harder to understand.

All this code does is reorganizes the data about the user’s currency into a neat object:

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
    case UPDATE_CART:
      const { data } = action.res;
      if (data.query === undefined) {
        return state;
      }

      const iso = data.query.userInfo?.userCurrency;
      const { name = '', symbol = '' } = data.currencies[iso] || {};

      return state.merge({ iso, name, symbol });
    default:
      return state;
  }
};
```

<!--
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: { eur: {name: 'Euro', symbol: '€' } } } } }).toJS()).toEqual({iso: 'eur', name: 'Euro', symbol: '€'})
expect(currencyReducer(undefined, { type: UPDATE_RESULTS, res: { data: { query: { userInfo: { userCurrency: 'eur' } }, currencies: {} } } }).toJS()).toEqual({iso: 'eur', name: '', symbol: ''})
-->

Now it’s clearer what shape of data we’re building here, and even Immutable.js isn’t so intimidating. I kept the `data` name though because that’s how it’s coming from the backend, and it’s commonly used as a sort of root object for whatever the backend API is returning. As long as we don’t leak it to the app code, and only use it during the initial processing of the raw backend data, it’s okay.

Such names are also okay for generic utility functions, like array filtering or sorting:

```js
function findFirstNonEmptyArray(...arrays) {
  return arrays.find(array => Array.isArray(array) && array.length > 0) || [];
}
```

<!-- expect(findFirstNonEmptyArray([], [1], [2,3])).toEqual([1]) -->

Here `arrays` and `array` are totally fine since that’s exactly what they represent: generic arrays, we don’t yet know what they are going to hold, and for the context of this function it doesn’t matter, it could be anything.

**Imprecise names** are names that don’t describe the object enough. One of the common cases is names with number suffixes. Usually, it happens for three reasons:

1. We have multiple objects of the same kind.
2. We do some processing of an object and use numbers to store a processed object.
3. We’re making a new version of an already existing module, function, or component.

In all cases, the solution is to clarify each name.

For the first two cases, try to find something that differentiates the objects, and makes the names more precise.

Consider this example:

<!--
const test = () => {}, login = () => {}, request = () => {}
const collections = { users: { insertMany: () => {} } }
const expect = () => ({ toBe: () => {}, toHaveProperty: () => {}, toEqual: () => {} })
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
      password: expect.stringMatching(/^[a-z]+-[a-z]+-[a-z]+$/)
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

<!-- // TODO: Can we test this? -->

Here, we’re sending a sequence of network requests to test a REST API. However, the names `response`, `response2`, and `response3` make the code a bit hard to understand, especially when we use the data returned by one request to create the next one. We could make the names more precise:

<!--
const test = () => {}, login = () => {}, request = () => {}
const collections = { users: { insertMany: () => {} } }
const expect = () => ({ toBe: () => {}, toHaveProperty: () => {}, toEqual: () => {} })
-->

```js
test('creates new user', async () => {
  const username = 'cosmo';

  await collections.users.insertMany(users);

  // Log in
  const cookies = await login();

  // Create user
  const createRes = await request(app)
    .post(usersEndpoint)
    .send({ username })
    .set('Accept', 'application/json')
    .set('Cookie', cookies);

  expect(createRes.headers).toHaveProperty(
    'content-type',
    expect.stringContaining('json')
  );
  expect(createRes.status).toBe(StatusCode.SuccessCreated);
  expect(createRes.body).toHaveProperty('data');
  expect(createRes.body.data).toEqual(
    expect.objectContaining({
      username,
      password: expect.stringMatching(/^[a-z]+-[a-z]+-[a-z]+$/)
    })
  );

  // Log in with the new user
  const loginRes = await request(app)
    .post(loginEndpoint)
    .send({
      username,
      password: createRes.body.data.password
    })
    .set('Accept', 'application/json');

  // Fetch users
  const usersRes = await request(app)
    .get(usersEndpoint)
    .set('Accept', 'application/json')
    .set('Cookie', loginRes.headers['set-cookie']);

  expect(usersRes.body).toHaveProperty('data');
  expect(usersRes.body.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ username: 'chucknorris' }),
      expect.objectContaining({ username })
    ])
  );
});
```

<!-- // TODO: Can we test this? -->

Now it’s clear which request data we’re accessing at any time.

For the new version of a module, I’d try to rename the old one to something like `ModuleLegacy` instead of naming the new one `Module2` or `ModuleNew`, and keep using the original name for the new implementation. It’s not always possible but it makes using the old, deprecated, module more awkward than the new, improved, one – exactly what we want to achieve. Also, names tend to stick forever, even when the original module is long gone. Names like `Module2` or `ModuleNew` are fine during development though, when the new module isn’t yet fully functional or well tested.

## Use common terms

It’s a good idea to use well-known and widely adopted terms for programming and domain concepts instead of inventing something that might be cute or clever but likely will be misunderstood. This is especially problematic for non-native English speakers – we don’t know many rare and obscure words.

[A “great” example](https://stackoverflow.com/questions/33742899/where-does-reacts-scryrendereddomcomponentswithclass-method-name-come-from) of this is React codebase where they used “scry” (which means something like _peeping into the future through a crystal ball_) instead of “find”.

## Use a single term for each concept

Using different words for the same concept is confusing: a person reading the code may think since the words are different then these things aren’t the same and will try to understand the difference between the two. It will also make the code less _greppable_ (meaning it would be harder to find all usages of the same thing, see [Make the code greppable](#make-the-code-greppable) chapter for more).

**Idea:** Having a project dictionary, or even a linter, might be a good idea to avoid using different words for the same things. I use a similar approach for writing this book: I use [Textlint terminology plugin](https://github.com/sapegin/textlint-rule-terminology) to make sure I use the terms consistently and spell them correctly.

## Use common opposite pairs

Often we create pairs of variables or functions that do the opposite operations or hold values that are on the opposite ends of the range. For example, `startServer`/`stopServer`, or `minWidth`/`maxWidth`. When we see one, we expect to see the other, and we expect it to have a certain name because it either sounds natural in English (if one happened to be a native speaker) or has been used by generations of programmers before us.

Some of these common pairs are:

| Term      | Opposite  |
| --------- | --------- |
| add       | remove    |
| begin     | end       |
| create    | destroy   |
| enable    | disable   |
| first     | last      |
| get       | set       |
| increment | decrement |
| insert    | delete    |
| lock      | unlock    |
| minimum   | maximum   |
| next      | previous  |
| old       | new       |
| open      | close     |
| read      | write     |
| show      | hide      |
| start     | stop      |
| target    | source    |

## Check the spelling of your names

Typos in names and comments are very common. They don’t cause bugs _most of the time_ but could still reduce readability a bit, and code with many typoses look sloppy.

Recently, I found this name in our codebase: `depratureDateTime`, and I immediately noticed it because I have a spellchecker enabled in my WebStorm editor:

![Spellchecker in WebStorm](images/spellchecker.png)

Spellchecker helps me immensely, as I’m not a native English speaker. It also helps to make the code more greppable: when we search for a certain term, we likely won’t find misspelled occurrences of it.

{#use-destructuring}
## Use destructuring

Often we end up with awkward names for intermediate values, like function parameters or function return values:

<!-- const parseMs = (x) => ({minutes: x, seconds: 0}), durationSec = 5 -->

```js
const duration = parseMs(durationSec * 1000);
// Then later we work with the result like so:
duration.minutes;
duration.seconds;
```

<!-- expect(duration.minutes).toBe(5000)-->

Here, the `duration` variable is never used as a whole, only as a container for `minutes` and `seconds` values we use in the code. By using destructuring we could skip the intermediate variable:

<!-- const parseMs = (x) => ({minutes: x, seconds: 0}), durationSec = 5 -->

```js
const { minutes, seconds } = parseMs(durationSec * 1000);
```

<!-- expect(minutes).toBe(5000)-->

Now we could access `minutes` and `seconds` directly.

Functions with optional parameters grouped in an object are another common example:

<!--
const hiddenInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};
-->

```ts
function submitFormData(
  action: string,
  options: {
    method: string;
    target: '_top';
    parameters?: { [key: string]: string };
  }
) {
  const form = document.createElement('form');

  form.method = options.method;
  form.action = action;
  form.target = options.target;

  if (options.parameters) {
    Object.keys(options.parameters)
      .map(paramName =>
        hiddenInput(paramName, options.parameters![paramName])
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

Here, `options` object is never used as a whole (for example, to pass it to another function), only to access separate properties in it. We could use destructuring to simplify the code:

<!--
const hiddenInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};
-->

```ts
function submitFormData(
  action: string,
  {
    method,
    target,
    parameters
  }: {
    method: string;
    target: '_top';
    parameters?: { [key: string]: string };
  }
) {
  const form = document.createElement('form');

  form.method = method;
  form.action = action;
  form.target = target;

  if (parameters) {
    Object.keys(parameters)
      .map(paramName =>
        hiddenInput(paramName, parameters![paramName])
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

Here, we’ve removed the `options` object, that was used in almost every line of the function body, which made it shorter and more readable.

## Avoid unnecessary variables

Often we add intermediate variables to store the result of some operation before passing it somewhere else or returning it from the function. In many cases, this variable is unnecessary.

Consider these two examples:

<!--
const handleUpdateResponse = x => x
class X {
  state = null;
  setState(value) { this.state = value }
  update(response) {
-->

```js
const result = handleUpdateResponse(response.status);
this.setState(result);
```

<!--
}}
const instance = new X()
instance.update({ status: 200 })
expect(instance.state).toBe(200)
-->

<!--
const response = { json: () => Promise.resolve(42) }
async function x() {
-->

```js
const data = await response.json();
return data;
```

<!--
}
expect(x()).resolves.toBe(42)
-->

In both cases, the `result` and the `data` variables don’t add much to the code. The names aren’t adding new information, and the code is short enough to be inlined:

<!--
const handleUpdateResponse = x => x
class X {
  state = null;
  setState(value) { this.state = value }
  update(response) {
-->

```js
this.setState(handleUpdateResponse(response.status));
```

<!--
}}
const instance = new X()
instance.update({ status: 200 })
expect(instance.state).toBe(200)
-->

<!--
const response = { json: () => Promise.resolve(42) }
function x() {
-->

```js
      return response.json();
```

<!--
}
expect(x()).resolves.toBe(42)
-->

Here’s another example:

<!--
const BaseComponent = ({x}) => <p>{x}</p>
class X {
  props = {x: 42, y: 24};
-->

```js
render() {
  let p = this.props;
  return <BaseComponent {...p} />;
}
```

<!--
}
const instance = new X()
const {container: c1} = RTL.render(instance.render());
expect(c1.textContent).toEqual('42')
-->

Here, the alias `p` replaces a clear name `this.props` with an obscure one. Again, inlining makes the code more readable:

<!--
const BaseComponent = ({x}) => <p>{x}</p>
class X {
  props = {x: 42, y: 24};
-->

```js
render() {
  return <BaseComponent {...this.props} />;
}
```

<!--
}
const instance = new X()
const {container: c1} = RTL.render(instance.render());
expect(c1.textContent).toEqual('42')
-->

Destructuring could be another solution here, see the [Use destructuring](#use-destructuring) section above.

Sometimes, intermediate variables can serve as comments, explaining the data they hold, that otherwise might not be clear:

<!--
const hasTextLikeOnlyChildren = () => false
const Flex = ({children}) => <>{children}</>
const Body = ({children}) => <>{children}</>
-->

```tsx
function Tip({ type, content }: TipProps) {
  const shouldBeWrapped = hasTextLikeOnlyChildren(content);

  return (
    <Flex alignItems="flex-start">
        {shouldBeWrapped ? <Body type={type}>{content}</Body> : content}
    </Flex>
  );
};
```

<!--
const {container: c1} = RTL.render(<Tip type="pizza" content="Hola" />);
expect(c1.textContent).toEqual('Hola')
-->

Another good reason to use an intermediate variable is to split a long line of code into multiple lines:

```ts
const borderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M2 2h2v2H2zM4 0h2v2H4zM10 4h2v2h-2zM0 4h2v2H0zM6 0h2v2H6zM8 2h2v2H8zM8 8h2v2H8zM6 10h2v2H6zM0 6h2v2H0zM10 6h2v2h-2zM4 10h2v2H4zM2 8h2v2H2z' fill='%23000'/></svg>`;
const borderImage = `url("data:image/svg+xml,${borderSvg}")`;
```

<!-- expect(borderImage).toMatch('<svg ') -->

## Tips to avoid name clashes

We’ve talked about how to avoid number suffixes by making names more precise. Let’s talk about a few other cases where we may have clashing names, and [what can we do to avoid them](https://gist.github.com/sapegin/a46ab46cdd4d6b5045027d120b9c967d).

Most often I struggle with clashing names for two reasons:

1. Storing a function return value (example: `const isCrocodile = isCrocodile()`).
2. Creating a React component to show an object of a certain TypeScript type (example: `const User = (props: { user: User }) => null`).

Let’s start with function return values. Consider this example:

<!-- const getCrocodiles = (x) => ([ x.color ]) -->

```js
const crocodiles = getCrocodiles({ color: 'darkolivegreen' });
```

<!-- expect(crocodiles).toEqual(['darkolivegreen']) -->

Here, it’s clear which one is the function, and which one is the array with the returned from the function value. Now consider this:

<!-- test-skip -->

```js
const isCrocodile = isCrocodile(crocodiles[0]);
```

Here, our naming choices are limited:

- `isCrocodile` is a natural choice but clashes with the function name;
- `crocodile` would mean that this variable holds one item of the `crocodiles` array.

So, what can we do about it? A few things:

- choose a domain-specific name (example: `shouldShowGreeting`);
- inline the function call, and avoid a local variable at all;
- choose a more specific name (examples: `isFirstItemCrocodile` or `isGreenCrocodile`);
- shorten the name, if the scope is small (example: `isCroc`).

All options are somewhat not ideal, though:

- Inlining can make the code more verbose, especially if the result of the function is used several times, or if the function has multiple parameters. It could also affect performance, though it usually doesn’t.
- Longer names could also make the code a bit more verbose.
- Short names could be confusing.

I usually use domain-specific names or inlining (for very simple calls used once or twice):

<!-- const isCrocodile = x => x.type === 'croc' -->

```jsx
function UserProfile({ user }) {
  const shouldShowGreeting = isCrocodile(user);
  return (
    <section>
      {shouldShowGreeting && (
        <p>Welcome back, green crocodile, the ruler of the Earth!</p>
      )}
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </section>
  );
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} />);
expect(c1.textContent).toEqual('Welcome back, green crocodile, the ruler of the Earth!Name: GenaAge: 37')
const {container: c2} = RTL.render(<UserProfile user={{type: 'che', name: 'Cheburashka', age: '12'}} />);
expect(c2.textContent).toEqual('Name: CheburashkaAge: 12')
-->

Here, the name describes how the value is used (domain-specific name) – to check _whether we need to show a greeting_, as opposed to the value itself – _whether the user is a crocodile_. This has another benefit: if we decide to change the condition, we don’t need to rename a variable.

For example, we could decide to greet crocodiles only in the morning:

<!-- const isCrocodile = x => x.type === 'croc' -->

```jsx
function UserProfile({ user, date }) {
  const shouldShowGreeting =
    isCrocodile(user) && date.getHours() < 10;
  return (
    <section>
      {shouldShowGreeting && (
        <p>Guten Morgen, green crocodile, the ruler of the Earth!</p>
      )}
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </section>
  );
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} date={new Date(2023,1,1,9,37,0)} />);
expect(c1.textContent).toEqual('Guten Morgen, green crocodile, the ruler of the Earth!Name: GenaAge: 37')
const {container: c2} = RTL.render(<UserProfile user={{type: 'croc', name: 'Gena', age: '37'}} date={new Date(2023,1,1,17,37,0)} />);
expect(c2.textContent).toEqual('Name: GenaAge: 37')
-->

The name still makes sense, when something like `isCroc` would have to be changed.

Unfortunately, I don’t have a good solution for clashing React components and TypeScript types. This usually happens when we create a component to render an object or a certain type:

```tsx
interface User {
  name: string;
  email: string;
}

export function User({ user }: { user: User }) {
  return <p>{user.name} ({user.email})</p>
}
```

<!--
const {container: c1} = RTL.render(<User user={{ name: 'Chuck', email: '@' }} />);
expect(c1.textContent).toEqual('Chuck (@)')
-->

Though TypeScript allows us to use a type and a value with the same name in the same scope, it makes code confusing.

The only solution I see is renaming either the type or the component. I usually try to rename a component, though it requires some creativity to come up with a name that’s not confusing. For example, names like `UserComponent` or `UserView` would be confusing because other components don’t have these suffixes. But something like `UserProfile` may work in this case:

```tsx
interface User {
  name: string;
  email: string;
}

export function UserProfile({ user }: { user: User }) {
  return <p>{user.name} ({user.email})</p>
}
```

<!--
const {container: c1} = RTL.render(<UserProfile user={{ name: 'Chuck', email: '@' }} />);
expect(c1.textContent).toEqual('Chuck (@)')
-->

This only matters when either the type or the component is exported and reused in other places. Local names are more forgiving since they are only used in the same file and the definition is right here.

---

Start thinking about:

- Replacing negative booleans with positive.
- Reducing the scope or the lifespan of variables.
- Choosing more or less specific names based on their scope or lifespan size.
- Using destructuring to think less about inventing new names.
- Choosing domain-specific names for local variables instead of more literal names.
