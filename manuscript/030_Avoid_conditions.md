{#no-conditions}

# Avoid conditions

<!-- description: Crafting good conditions and simplifying code by removing unnecessary conditions -->

Conditions are essential for writing code that supports multiple use cases. JavaScript offers multiple ways to write conditional code:

<!--
let condition = true
let value = 'value2'
let object = { getValue: () => 'xxx' }
-->

```js
// `if` operator
if (condition) {
  // The condition is true
} else {
  // The condition is false
}

// `switch` operator
switch (value) {
  case 'value1': {
    // Code for value1
    break;
  }
  case 'value2': {
    // Code for value2
    break;
  }
  default: {
    // Code if no cases match
    break;
  }
}

// Ternary operator
const value1 = condition ? 'true value' : 'false value';

// Optional chaining operator
const value2 = object.getValue?.();

// Nullish coalescing operator
const value3 = value ?? 'default value';
```

<!--
expect($1).toBe(true)
// No test for switch block
expect(value1).toBe('true value')
expect(value2).toBe('xxx')
expect(value3).toBe('value2')
-->

We’ll talk about each type in more detail in this chapter.

However, conditions can make code harder to read and test because:

- conditions add nesting and increase code complexity;
- multipart conditions are even harder to understand, especially those that mix positive and negative clauses;
- each condition increases the minimum number of test cases we need to write for a certain module or function.

Thus, reducing the number of conditions in our code makes sense.

## Unnecessary conditions

Many conditions are unnecessary or could be rewritten in a more readable way.

For example, consider the following code that creates two boolean variables:

<!-- eslint-skip -->

```js
const value = '';
const hasValue = value !== '' ? true : false;
// → false

const products = ['taco'];
const hasProducts = products.length > 0 ? true : false;
// → true
```

<!--
expect(hasValue).toBe(false)
expect(hasProducts).toBe(true)
-->

Both `value !== ''` and `products.length > 0` already return boolean values, so we can avoid using the ternary operator:

```js
const value = '';
const hasValue = value !== '';
// → false

const products = ['taco'];
const hasProducts = products.length > 0;
// → true
```

<!--
expect(hasValue).toBe(false)
expect(hasProducts).toBe(true)
-->

Even when the initial value isn’t a boolean:

<!-- eslint-disable no-unneeded-ternary -->

```js
const value = '';
const hasValue = value ? true : false;
// → false
```

<!-- expect(hasValue).toBe(false) -->

We can still avoid the condition by explicitly converting the value to a boolean:

```js
const value = '';
const hasValue = Boolean(value);
// → false
```

<!-- expect(hasValue).toBe(false) -->

In all cases, the code without ternaries is both shorter and easier to read.

Here’s another example of an unnecessary condition:

```js
const products = ['taco'];
const hasProducts =
  products && Array.isArray(products) && products.length > 0;
// → true
```

<!-- expect(hasProducts).toBe(true) -->

First, the `Array.isArray()` method returns `false` for any _falsy_ value, so there’s no need to check this separately. Second, in most cases, we can use the _optional chaining operator_ instead of an explicit array check.

I> A _falsy value_ is a value that is considered `false` during type conversion to a boolean, and includes `false`, `null`, `undefined`, `0`, `''`, and [a few others](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).

```js
const products = ['taco'];
const hasProducts = products?.length > 0;
// → true
```

<!-- expect(hasProducts).toBe(true) -->

I> The _optional chaining operator_ (`?.`) was introduced in ECMAScript 2020 and allows us to access methods or properties of an object only when they exist, so we don’t need to wrap the code in an `if` condition.

The only case when this code might break is if `products` is a string, as strings also have the `length` property.

T> I consider a variable that can be either `undefined` (or `null`) or an `array` an antipattern in most cases. I would track the source of this value, make sure that it’s always an array, and use an empty array instead of `undefined`. This way we can skip a lot of conditions and simplify types: we can just use `products.length > 0`, and not worry that `products` may not have the `length` property.

Here’s a more complex but great (and real!) example of unnecessary conditions:

<!-- const window = { navigator: { userAgent: '' } } -->

<!-- eslint-skip -->

```js
function IsNetscapeOnSolaris() {
  var agent = window.navigator.userAgent;
  if (
    agent.indexOf('Mozilla') != -1 &&
    agent.indexOf('compatible') == -1
  ) {
    if (agent.indexOf('SunOS') != -1) return true;
    else return false;
  } else {
    return false;
  }
}
```

<!--
window.navigator.userAgent = 'Mozilla/3.0 (X11; I; SunOS 5.4 sun4m)'
expect(IsNetscapeOnSolaris()).toBe(true)
window.navigator.userAgent = 'Mozilla/3.0 (Windows 3.11 for Workgroups)'
expect(IsNetscapeOnSolaris()).toBe(false)
window.navigator.userAgent = 'Mozilla/1.22 (compatible; MSIE 2.0; Windows 95)'
expect(IsNetscapeOnSolaris()).toBe(false)
window.navigator.userAgent = 'Opera/9.63 (Macintosh; Intel Mac OS X; U; en) Presto/2.1.1'
expect(IsNetscapeOnSolaris()).toBe(false)
-->

This code checks whether the user has a particular browser and operating system by testing the user agent string. We can replace the nested condition with a single expression that returns a boolean value:

<!-- const window = { navigator: { userAgent: '' } } -->

```js
function IsNetscapeOnSolaris() {
  const { userAgent } = window.navigator;
  return (
    userAgent.includes('Mozilla') &&
    userAgent.includes('SunOS') &&
    userAgent.includes('compatible') === false
  );
}
```

<!--
window.navigator.userAgent = 'Mozilla/3.0 (X11; I; SunOS 5.4 sun4m)'
expect(IsNetscapeOnSolaris()).toBe(true)
window.navigator.userAgent = 'Mozilla/3.0 (Windows 3.11 for Workgroups)'
expect(IsNetscapeOnSolaris()).toBe(false)
window.navigator.userAgent = 'Mozilla/1.22 (compatible; MSIE 2.0; Windows 95)'
expect(IsNetscapeOnSolaris()).toBe(false)
window.navigator.userAgent = 'Opera/9.63 (Macintosh; Intel Mac OS X; U; en) Presto/2.1.1'
expect(IsNetscapeOnSolaris()).toBe(false)
-->

By eliminating two levels of nesting and reducing boilerplate code, we made the actual condition clearer.

I often see two conditions for a single boolean variable:

```jsx
const RefundLabel = ({
  htmlFor,
  type,
  typeLabels,
  hasUserSelectableRefundOptions
}) => (
  <label htmlFor={htmlFor}>
    {type && typeLabels[type]}
    {!type && hasUserSelectableRefundOptions && 'Estimated:'}
    {!type && !hasUserSelectableRefundOptions && 'Total:'}
  </label>
);
```

<!--
const {container: c1} = RTL.render(<RefundLabel type="card" typeLabels={{card: 'Card refund:'}} />);
expect(c1.textContent).toEqual('Card refund:')
const {container: c2} = RTL.render(<RefundLabel hasUserSelectableRefundOptions />);
expect(c2.textContent).toEqual('Estimated:')
const {container: c3} = RTL.render(<RefundLabel />);
expect(c3.textContent).toEqual('Total:')
-->

Here, we compare `type` three times and `hasUserSelectableRefundOptions` twice, which is unnecessary and makes the code confusing:

```jsx
const RefundLabelMessage = ({
  type,
  typeLabels,
  hasUserSelectableRefundOptions
}) => {
  if (type) {
    return typeLabels[type];
  }

  return hasUserSelectableRefundOptions
    ? 'Estimated:'
    : 'Total:';
};

const RefundLabel = ({ htmlFor, ...props }) => (
  <label htmlFor={htmlFor}>
    <RefundLabelMessage {...props} />
  </label>
);
```

<!--
const {container: c1} = RTL.render(<RefundLabel type="card" typeLabels={{card: 'Card refund:'}} />);
expect(c1.textContent).toEqual('Card refund:')
const {container: c2} = RTL.render(<RefundLabel hasUserSelectableRefundOptions />);
expect(c2.textContent).toEqual('Estimated:')
const {container: c3} = RTL.render(<RefundLabel />);
expect(c3.textContent).toEqual('Total:')
-->

We had to split the component into two to use early return, but the logic is now clearer.

{#optional-params}

## Optional function parameters

We often add conditions when some data might be missing. For example, an optional callback function:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```js
function getRandomJoke(onDone, onError) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(error => {
      if (onError) {
        onError(error.message);
      }
    });
}
```

<!--
const onDone = vi.fn(), onError = vi.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

Here, the `onError` parameter is optional, and we check if it exists before calling it. The problem here is that we need to remember to wrap each call to an optional callback with a condition. It increases complexity and cognitive load and makes the code harder to read.

I> The _cognitive load_ is the mental effort required to understand the code. Artem Zakirullin wrote a [great article on cognitive load in programming](https://github.com/zakirullin/cognitive-load).

One way to simplify the code here is by using the _optional chaining_ operator:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```js
function getRandomJoke(onDone, onError) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(error => {
      onError?.(error.message);
    });
}
```

<!--
const onDone = vi.fn(), onError = vi.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

It looks neater; however, it has the same issues as the `if` statement.

I usually try to avoid these kinds of conditions and make sure all optional parameters are available, even if empty, so I can access them without checking if they are available first.

My favorite way to do it is by lifting the condition to the function head using optional function parameters:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```js
function getRandomJoke(onDone, onError = () => {}) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(error => {
      onError(error.message);
    });
}
```

<!--
const onDone = vi.fn(), onError = vi.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

Now, it’s safe to call the `onError()` function whenever we need it. It won’t do anything if we don’t pass it to the function, but we don’t need to worry about this while we’re coding the function itself.

{#arrays}

## Processing arrays

It’s common to check an array’s length before running a loop over its elements:

```js
function getProductsDropdownItems(response) {
  const products = response.products;
  if (products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
}
```

<!--
expect(getProductsDropdownItems({products: []})).toEqual([])
expect(getProductsDropdownItems({products: [{id: '1', name: 'Tacos'}]})).toEqual([{label: 'Tacos', value: '1'}])
-->

All loops and array functions, like `map()`, or `filter()`, work fine with empty arrays, so we can safely remove the check:

```js
function getProductsDropdownItems({ products }) {
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

<!--
expect(getProductsDropdownItems({products: []})).toEqual([])
expect(getProductsDropdownItems({products: [{id: '1', name: 'Tacos'}]})).toEqual([{label: 'Tacos', value: '1'}])
-->

Sometimes, we have to use an existing API that returns an array only in some cases, so checking the length directly would fail, and we need to check the type first:

```js
function getProductsDropdownItems({ products }) {
  if (Array.isArray(products) && products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
}
```

<!--
expect(getProductsDropdownItems({})).toEqual([])
expect(getProductsDropdownItems({products: []})).toEqual([])
expect(getProductsDropdownItems({products: [{id: '1', name: 'Tacos'}]})).toEqual([{label: 'Tacos', value: '1'}])
-->

We can’t avoid the condition in this case, but we can _lift it to the function head_ and avoid having a separate branch that handles the absence of an array. There are several ways to do this, depending on the possible data types.

If our data can be an array or `undefined`, we can use a default value for the function parameter:

```js
function getProductsDropdownItems(products = []) {
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

<!--
expect(getProductsDropdownItems()).toEqual([])
expect(getProductsDropdownItems([])).toEqual([])
expect(getProductsDropdownItems([{id: '1', name: 'Tacos'}])).toEqual([{label: 'Tacos', value: '1'}])
-->

Or we can use a default value for the destructured property of an object:

```js
function getProductsDropdownItems({ products = [] }) {
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

<!--
expect(getProductsDropdownItems({})).toEqual([])
expect(getProductsDropdownItems({products: []})).toEqual([])
expect(getProductsDropdownItems({products: [{id: '1', name: 'Tacos'}]})).toEqual([{label: 'Tacos', value: '1'}])
-->

It’s trickier if our data can be an array or `null` because default values are only used when the value is strictly `undefined`, not just _falsy_. In this case, we can use the _nullish coalescing operator_:

```js
function getProductsDropdownItems(productsMaybe) {
  const products = productsMaybe ?? [];
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

<!--
expect(getProductsDropdownItems()).toEqual([])
expect(getProductsDropdownItems(null)).toEqual([])
expect(getProductsDropdownItems([])).toEqual([])
expect(getProductsDropdownItems([{id: '1', name: 'Tacos'}])).toEqual([{label: 'Tacos', value: '1'}])
-->

We still have a condition, but the overall code structure is simpler.

I> The _nullish coalescing operator_ (`??`) was introduced in ECMAScript 2020 and gives us a better alternative to the _logical or operator_ (`||`) because it only checks for _nullish_ values (`undefined` or `null`), not for _falsy_ values (which would also include, often undesirable, `false`, `''`, and `0`).

In all these examples, we’re removing a separate branch that deals with the absence of data by _normalizing the input_ — converting it to an array — as early as possible and then running a generic algorithm on the normalized data.

Arrays are convenient because we don’t have to worry about how many elements they contain: the same code will work with a hundred elements, one element, or zero elements.

A similar technique works when the input is a single value or an array:

```js
function getProductsDropdownItems({
  products: productOrProducts
}) {
  const products = Array.isArray(productOrProducts)
    ? productOrProducts
    : [productOrProducts];
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

<!--
expect(getProductsDropdownItems({products: []})).toEqual([])
expect(getProductsDropdownItems({products: {id: '1', name: 'Tacos'}})).toEqual([{label: 'Tacos', value: '1'}])
expect(getProductsDropdownItems({products: [{id: '1', name: 'Tacos'}]})).toEqual([{label: 'Tacos', value: '1'}])
-->

Here, we’re wrapping a single element in an array so we can use the same code to work with single values and arrays.

{#deduplication}

## Deduplicating algorithms

Examples in the previous section introduce an important technique: _algorithm deduplication_. Instead of branching the main logic based on the input type, we code the main logic only once, but we normalize the input before running the algorithm. This technique can be used in many other places.

Imagine an article with a “Like” button and a counter, where every time we press the button, the counter number increases. The object that stores counters for all articles could look like this:

<!--
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (!(url in counts)) {
        counts[url] = 0;
      }

      counts[url] += votes;
    },
    downvote(url) {
      counts[url] -= 1;
    }
  };
}
-->

```js
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/dogs-better-than-cats', 5);
articles.downvote('/dogs-better-than-cats');
articles.get('/cats-better-than-dogs');
// → 1
articles.get('/dogs-better-than-cats');
// → 4
```

<!--
expect(articles.get('/cats-better-than-dogs')).toBe(1)
expect(articles.get('/dogs-better-than-cats')).toBe(4)
-->

A naïve way to implement the `upvote()` method might be:

```js
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (url in counts) {
        counts[url] += votes;
      } else {
        counts[url] = votes;
      }
    }
  };
}
```

<!--
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/cats-better-than-dogs', 4);
expect(articles.get('/cats-better-than-dogs')).toBe(5)
-->

The problem here is that the main function’s logic, incrementing the count, is implemented twice: for the case when we have already voted for that URL and when we’re voting for the first time. So, every time we need to update this logic, we have to make changes in two places. We need to write two sets of very similar tests to make sure both branches work as expected, otherwise, they’ll eventually diverge, and we’ll have hard-to-debug issues.

Let’s make the main logic unconditional, and prepare the state if necessary before running this logic:

```js
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (counts[url] === undefined) {
        counts[url] = 0;
      }

      counts[url] += votes;
    }
  };
}
```

<!--
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/cats-better-than-dogs', 4);
expect(articles.get('/cats-better-than-dogs')).toBe(5)
-->

Now, we don’t have any logic duplication. Instead, we normalize the data structure so the generic algorithm can work with it.

I often see a similar issue when someone calls a function with different parameters:

<!-- const log = vi.fn(), errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
if (errorMessage) {
  log(LOG_LEVEL.ERROR, errorMessage);
} else {
  log(LOG_LEVEL.ERROR, DEFAULT_ERROR_MESSAGE);
}
```

<!-- expect(log).toBeCalledWith('error', 'nope') -->

Let’s move the condition inside the function call:

<!-- const log = vi.fn(), errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
log(LOG_LEVEL.ERROR, errorMessage || DEFAULT_ERROR_MESSAGE);
```

<!-- expect(log).toBeCalledWith('error', 'nope') -->

We’ve removed all code duplication, and the code is shorter and easier to read. It’s also easier to see exactly which values depend on the condition.

{#early-returns}

## Early returns

A series of nested conditions is an unfortunate but popular way of handling errors:

<!--
let isUsernameValid = (x) => typeof x === 'string' && x !== ''
let isEmailValid = (x) => typeof x === 'string' && x !== ''
let isAddressValid = (x) => typeof x === 'string' && x !== ''
let createUserRecord = vi.fn()
let showNotification = vi.fn()
-->

```js
function addUser(user) {
  if (isUsernameValid(user.username)) {
    if (isEmailValid(user.email)) {
      if (isAddressValid(user.address)) {
        createUserRecord(user);
        showNotification('Welcome to The Hell!');
      } else {
        throw new Error('You must enter a valid address');
      }
    } else {
      throw new Error('You must enter a valid email');
    }
  } else {
    throw new Error('You must enter a valid username');
  }
}
```

<!--
expect(() => addUser()).toThrowError()
expect(createUserRecord).not.toHaveBeenCalled()
expect(() => addUser({username: 'x', email: 'x', address: 'x'})).not.toThrowError()
expect(createUserRecord).toHaveBeenCalled()
-->

The main code of this function is on the fourth level of nesting. We need to scroll all the way to the end of the function to see the `else` parts of each condition, which makes it easy to edit the wrong block because the conditions and their `else` blocks are so far apart. The `else` blocks are also in reversed order, which makes the code even more confusing.

I> Deeply nested conditions are also known as the [arrow antipattern](http://wiki.c2.com/?ArrowAntiPattern), or _dangerously deep nesting_, or _if/else hell_.

_Early returns_, or _guard clauses_, are a great way to avoid nested conditions and make the code easier to understand:

<!--
let isUsernameValid = (x) => typeof x === 'string' && x !== ''
let isEmailValid = (x) => typeof x === 'string' && x !== ''
let isAddressValid = (x) => typeof x === 'string' && x !== ''
let createUserRecord = vi.fn()
let showNotification = vi.fn()
-->

```js
function addUser(user) {
  if (isUsernameValid(user.username) === false) {
    throw new Error('You must enter a valid address');
  }
  if (isEmailValid(user.email) === false) {
    throw new Error('You must enter a valid email');
  }
  if (isAddressValid(user.address) === false) {
    throw new Error('You must enter a valid username');
  }

  createUserRecord(user);
  showNotification('Welcome to The Hell!');
}
```

<!--
expect(() => addUser()).toThrowError()
expect(createUserRecord).not.toHaveBeenCalled()
expect(() => addUser({username: 'x', email: 'x', address: 'x'})).not.toThrowError()
expect(createUserRecord).toHaveBeenCalled()
-->

Now, the whole validation is grouped at the beginning of the function using guard clauses, and it’s clear which error message is shown for each validation. We have at most one level of nesting instead of four, and the main code of the function isn’t nested at all.

Here’s a real-life example:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

<!-- eslint-skip -->

```js
function postOrderStatus() {
  var idsArrayObj = getOrderIds();

  if (idsArrayObj != undefined) {
    if (idsArrayObj.length == undefined) {
      var tmpBottle = idsArrayObj;
      idsArrayObj = new Array(tmpBottle);
    }

    var fullRecordsArray = new Array();

    // Skipped 70 lines of code building the array…

    if (fullRecordsArray.length != 0) {
      // Skipped some 40 lines of code…
      return sendOrderStatus(fullRecordsArray);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

<!-- expect(() => postOrderStatus(0)).not.toThrowError() -->

This code is building an array with information about orders in an online shop. There are 120 lines between the first condition and its `else` block, and the main return value is somewhere inside the three levels of conditions.

Let’s untangle this spaghetti monster:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

```js
function postOrderStatus() {
  let idsArrayObject = getOrderIds();
  if (idsArrayObject === undefined) {
    return false;
  }

  if (Array.isArray(idsArrayObject) === false) {
    idsArrayObject = [idsArrayObject];
  }

  const fullRecordsArray = [];

  // Skipped 70 lines of code building the array…

  if (fullRecordsArray.length === 0) {
    return false;
  }

  // Skipped some 40 lines of code…
  return sendOrderStatus(fullRecordsArray);
}
```

<!-- expect(() => postOrderStatus(0)).not.toThrowError() -->

This function is still long, but it’s much easier to follow because its structure is more straightforward.

Now, we have at most one level of nesting inside the function, and the main return value is at the very end without nesting. We’ve added two guard clauses to exit the function early when there’s no data to process.

I> One of the [Zen of Python’s](https://peps.python.org/pep-0020/) principles is _flat is better than nested_, which is exactly what we did with this refactoring. I also call it _code flattening_.

I’m not so sure what the code inside the second condition does, but it looks like it’s wrapping a single value in an array, as we did earlier in this chapter.

_And no, I have no idea what `tmpBottle` means or why it was needed._

The next step here could be improving the `getOrderIds()` function’s API. It can return three different things: `undefined`, a single value, or an array. We have to deal with each separately, so we have two conditions at the beginning of the function, and we’re reassigning the `idsArrayObj` variable.

I> We talk about reassignments in the next chapter, [Avoid reassigning variables](#no-reassigning).

By making the `getOrderIds()` function always return an array and making sure that the code inside the `// Skipped 70 lines of code building the array…` works with an empty array, we could remove both conditions:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

```js
function postOrderStatus() {
  const orderIds = getOrderIds(); // Always an array

  const fullRecords = [];

  // Skipped 70 lines of code building the array…

  if (fullRecords.length === 0) {
    return false;
  }

  // Skipped some 40 lines of code…
  return sendOrderStatus(fullRecords);
}
```

<!-- expect(() => postOrderStatus(0)).not.toThrowError() -->

Now, that’s a big improvement over the initial version. I’ve also renamed the variables because “array object” doesn’t make any sense to me and the “array” suffix is unnecessary.

I> We talk about naming in the [Naming is hard](#naming) chapter.

The next step would be out of the scope of this chapter: the code inside the `// Skipped 70 lines of code building the array…` mutates the `fullRecords`. I usually try to avoid mutation, especially for variables with such a long lifespan.

I> We talk about mutation in the [Avoid mutation](#no-mutation) chapter.

Here’s another example:

<!--
let Inner = ({data}) => <p>{data.join('|')}</p>
let ErrorMessage = () => <p>Error</p>
let EmptyMessage = () => <p>No data</p>
let LoadingSpinner = () => <p>Loading…</p>
-->

<!-- eslint-skip -->

```jsx
function Container({
  component: Component,
  isError,
  isLoading,
  data
}) {
  return isError ? (
    <ErrorMessage />
  ) : isLoading ? (
    <LoadingSpinner />
  ) : data.length > 0 ? (
    <Component data={data} />
  ) : (
    <EmptyMessage />
  );
}
```

<!--
const {container: c1} = RTL.render(<Container component={Inner} isError={true} />);
expect(c1.textContent).toEqual('Error')
const {container: c2} = RTL.render(<Container component={Inner} isLoading={true} />);
expect(c2.textContent).toEqual('Loading…')
const {container: c3} = RTL.render(<Container component={Inner} data={[]} />);
expect(c3.textContent).toEqual('No data')
const {container: c4} = RTL.render(<Container component={Inner} data={[2, 4]} />);
expect(c4.textContent).toEqual('2|4')
-->

I have trouble reading nested ternaries in general and prefer not to nest them. Here’s an extreme example of nesting: the good path code, rendering the `Component`, is quite hidden. This is a perfect use case for guard clauses.

Let’s refactor it:

<!--
let Inner = ({data}) => <p>{data.join('|')}</p>
let ErrorMessage = () => <p>Error</p>
let EmptyMessage = () => <p>No data</p>
let LoadingSpinner = () => <p>Loading…</p>
-->

```jsx
function Container({
  component: Component,
  isError,
  isLoading,
  data
}) {
  if (isError) {
    return <ErrorMessage />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (data.length === 0) {
    return <EmptyMessage />;
  }

  return <Component data={data} />;
}
```

<!--
const {container: c1} = RTL.render(<Container component={Inner} isError={true} />);
expect(c1.textContent).toEqual('Error')
const {container: c2} = RTL.render(<Container component={Inner} isLoading={true} />);
expect(c2.textContent).toEqual('Loading…')
const {container: c3} = RTL.render(<Container component={Inner} data={[]} />);
expect(c3.textContent).toEqual('No data')
const {container: c4} = RTL.render(<Container component={Inner} data={[2, 4]} />);
expect(c4.textContent).toEqual('2|4')
-->

Here, the default, happy path isn’t intertwined with the exceptional cases. The default case is at the very bottom of the component, and all exceptions are in front, as guard clauses.

T> We discuss a better way of managing loading and error states in the [Make impossible states impossible](#impossible-states) section.

{#tables}

## Tables and maps

One of my favorite techniques for improving _(read: avoiding)_ conditions is replacing them with _tables_ or _maps_. In JavaScript, we can create a table or a map using a plain object.

This example may seem extreme, but I actually wrote this code in my early twenties:

<!-- prettier-ignore -->
```js
function getMonthNumberByName(month) {
  if (month == 'jan') month = 1;
  if (month == 'feb') month = 2;
  if (month == 'mar') month = 3;
  if (month == 'apr') month = 4;
  if (month == 'may') month = 5;
  if (month == 'jun') month = 6;
  if (month == 'jul') month = 7;
  if (month == 'aug') month = 8;
  if (month == 'sep') month = 9;
  if (month == 'oct') month = 10;
  if (month == 'nov') month = 11;
  if (month == 'dec') month = 12;
  return month;
}
```

<!-- expect(getMonthNumberByName('may')).toBe(5) -->

Let’s replace these conditions with a table:

```js
const MONTH_NAME_TO_NUMBER = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
};

function getMonthNumberByName(monthName) {
  return MONTH_NAME_TO_NUMBER[monthName];
}
```

<!-- expect(getMonthNumberByName('may')).toBe(5) -->

There’s almost no boilerplate code around the data; it’s more readable and looks like a table. Notice also that there are no braces in the original code: in most modern style guides, braces around condition bodies are required, and the body should be on its own line, so this code would be three times longer and even less readable.

Another issue with the initial code is that the `month` variable’s initial type is a string, but then it becomes a number. This is confusing, and if we were using a typed language (like TypeScript), we would have to check the type every time we wanted to access this variable.

Here’s a bit more realistic and common example:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton => {
  switch (decisionButton) {
    case DECISION_YES: {
      return 'Yes';
    }
    case DECISION_NO: {
      return 'No';
    }
    case DECISION_MAYBE: {
      return 'Maybe';
    }
  }
};

function DecisionButton({ decision }) {
  return <button>{getButtonLabel(decision)}</button>;
}
```

<!--
const {container: c1} = RTL.render(<DecisionButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<DecisionButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

Here, we have a `switch` statement that returns one of the three button labels.

First, let’s replace the `switch` with a table:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const BUTTON_LABELS = {
  [DECISION_YES]: 'Yes',
  [DECISION_NO]: 'No',
  [DECISION_MAYBE]: 'Maybe'
};

const getButtonLabel = decisionButton =>
  BUTTON_LABELS[decisionButton];

function DecisionButton({ decision }) {
  return <button>{getButtonLabel(decision)}</button>;
}
```

<!--
const {container: c1} = RTL.render(<DecisionButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<DecisionButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

The object syntax is a bit more lightweight and readable than the `switch` statement.

We can simplify the code even more by inlining the `getButtonLabel()` function:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const BUTTON_LABELS = {
  [DECISION_YES]: 'Yes',
  [DECISION_NO]: 'No',
  [DECISION_MAYBE]: 'Maybe'
};

function DecisionButton({ decision }) {
  return <button>{BUTTON_LABELS[decision]}</button>;
}
```

<!--
const {container: c1} = RTL.render(<DecisionButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<DecisionButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

One thing I like to do on TypeScript projects is to combine tables with enums:

```tsx
enum Decision {
  Yes = 0,
  No = 1,
  Maybe = 2
}

const BUTTON_LABELS: Record<Decision, string> = {
  [Decision.Yes]: 'Yes',
  [Decision.No]: 'No',
  [Decision.Maybe]: 'Maybe'
};

function DecisionButton({
  decision
}: {
  decision: Decision;
}) {
  return <button>{BUTTON_LABELS[decision]}</button>;
}
```

<!--
const {container: c1} = RTL.render(<DecisionButton decision={Decision.Yes} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<DecisionButton decision={Decision.Maybe} />);
expect(c2.textContent).toEqual('Maybe')
-->

Here, we’ve defined an enum for decisions, and we’re using it to ensure consistency in the button label map and decision button component props:

- The decision button component accepts only known decisions.
- The button label map can have only known decisions and _must_ have them all. This is especially useful: every time we update the decision enum, TypeScript makes sure the map is still in sync with it.

Also, enums make the code cleaner than SCREAMING_SNAKE_CASE constants.

This changes the way we use the `DecisionButton` component:

```diff
- <DecisionButton decision={DECISION_MAYBE} />
+ <DecisionButton decision={Decision.Maybe} />
```

We can achieve the same safety even without enums, and I usually prefer this way for React components because it simplifies the markup. We can use plain strings instead of an enum:

```tsx
type Decision = 'yes' | 'no' | 'maybe';

const BUTTON_LABELS: Record<Decision, string> = {
  yes: 'Yes',
  no: 'No',
  maybe: 'Maybe'
};

function DecisionButton({
  decision
}: {
  decision: Decision;
}) {
  return <button>{BUTTON_LABELS[decision]}</button>;
}
```

<!--
const {container: c1} = RTL.render(<DecisionButton decision="yes" />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<DecisionButton decision="maybe" />);
expect(c2.textContent).toEqual('Maybe')
-->

This again changes the way we use the `DecisionButton` component:

```diff
- <DecisionButton decision={Decision.Maybe} />
+ <DecisionButton decision="maybe" />
```

Now, the markup is simpler and more idiomatic. We don’t need to import an enum every time we use the component, and we get a nice autocomplete for the `decision` prop value.

Another realistic and common example is form validation:

```jsx
function validate(values) {
  const errors = {};

  if (
    !values.name ||
    (values.name && values.name.trim() === '')
  ) {
    errors.name = 'Name is required';
  }

  if (values.name && values.name.length > 80) {
    errors.name = 'Maximum 80 characters allowed';
  }

  if (!values.address1) {
    errors.address1 = 'Address is required';
  }

  if (!values.email) {
    errors.email = 'Email is required';
  }

  if (
    !values.login ||
    (values.login && values.login.trim() === '')
  ) {
    errors.login = 'Login is required';
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = 'No spaces are allowed in login';
  }

  if (values.address1 && values.address1.length > 80) {
    errors.address1 = 'Maximum 80 characters allowed';
  }

  // Skipped some 100 lines of other validations…

  return errors;
}
```

<!--
expect(validate({})).toEqual({
  address1: "Address is required",
  login: "Login is required",
  email: "Email is required",
  name: "Name is required"
})
expect(validate({name: ' '})).toEqual({
  address1: "Address is required",
  login: "Login is required",
  email: "Email is required",
  name: "Name is required"
})
expect(validate({name: 'x'.repeat(81)})).toEqual({
  address1: "Address is required",
  login: "Login is required",
  email: "Email is required",
  name: "Maximum 80 characters allowed"
})
expect(validate({login: ' '})).toEqual({
  address1: "Address is required",
  login: "Login is required",
  email: "Email is required",
  name: "Name is required"
})
expect(validate({login: 'Chuck Norris'})).toEqual({
  address1: "Address is required",
  login: "No spaces are allowed in login",
  email: "Email is required",
  name: "Name is required"
})
expect(validate({address1: 'C'.repeat(81)})).toEqual({
  address1: "Maximum 80 characters allowed",
  login: "Login is required",
  email: "Email is required",
  name: "Name is required"
})
expect(validate({
  address1: "Navasota, TX 77868-0872 USA",
  login: "chuck-norris",
  email: "chuck@norris.io",
  name: "Chuck Norris"
})).toEqual({})
-->

This function is very long, with lots and lots of repetitive boilerplate code. It’s really hard to read and maintain. Sometimes, validations for the same field aren’t together, which makes it even harder to understand all the requirements for a particular field.

However, if we look closely, there are only three unique validations:

- required field (in some cases leading and trailing whitespace is ignored, in others not — hard to tell whether it’s intentional or not);
- maximum length (always 80 characters);
- spaces are not allowed.

First, let’s extract all validations into their own functions so we can reuse them later:

```js
/**
 * Validates whether a string is not empty,
 * ignores leading and trailing whitespace
 */
const hasStringValue = value =>
  typeof value === 'string' && value.trim() !== '';

/**
 * Validates whether a string is shorter than a given number
 * of characters, ignores empty strings and non-string values
 */
const hasLengthLessThanOrEqual = max => value =>
  hasStringValue(value) === false || value.length <= max;

/**
 * Validates whether a string has no spaces,
 * ignores empty strings and non-string values
 */
const hasNoSpaces = value =>
  hasStringValue(value) === false ||
  value.includes(' ') === false;
```

<!--
expect(hasStringValue('  ')).toBe(false)
expect(hasStringValue('x')).toBe(true)
expect(hasStringValue()).toBe(false)
expect(hasStringValue(null)).toBe(false)
expect(hasStringValue(42)).toBe(false)
expect(hasStringValue({})).toBe(false)
expect(hasStringValue([])).toBe(false)
expect(hasLengthLessThanOrEqual(3)('x')).toBe(true)
expect(hasLengthLessThanOrEqual(3)('xxx')).toBe(true)
expect(hasLengthLessThanOrEqual(3)('xxxx')).toBe(false)
expect(hasLengthLessThanOrEqual(3)('')).toBe(true)
expect(hasLengthLessThanOrEqual(3)(null)).toBe(true)
expect(hasNoSpaces('x')).toBe(true)
expect(hasNoSpaces('x y')).toBe(false)
expect(hasNoSpaces('')).toBe(true)
-->

I assumed that different whitespace handling was a bug. I’ve also inverted all the conditions to validate the correct value, instead of an incorrect one, to make the code more readable.

Note that `hasLengthLessThanOrEqual()` and `hasNoSpaces()` functions only check the condition if the value is present, which would allow us to make optional fields. Also, note that the `hasLengthLessThanOrEqual()` function is customizable: we need to pass the maximum length: `hasLengthLessThanOrEqual(80)`.

Now, we can define our validation table. There are two ways of doing this:

- using an object where keys represent form fields;
- using an array.

We’re going to use an array because we want to have several validations with different error messages for some fields. For example, a field can be required _and_ have a maximum length:

<!--
const hasStringValue = value => typeof value === 'string' && value.trim() !== ''
const hasLengthLessThanOrEqual = max => value => hasStringValue(value) === false || value.length <= max
-->

```js
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
  {
    field: 'name',
    validation: hasLengthLessThanOrEqual(80),
    message: 'Maximum 80 characters allowed'
  }
  // All other fields
];
```

<!--
expect(validations[0].validation('tacocat')).toBe(true)
expect(validations[0].validation('')).toBe(false)
expect(validations[1].validation('')).toBe(true)
expect(validations[1].validation('tacocat')).toBe(true)
expect(validations[1].validation('x'.repeat(81))).toBe(false)
-->

Next, we need to iterate over this array and run validations for all the fields:

<!--
const hasStringValue = value => typeof value === 'string' && value.trim() !== ''
const hasLengthLessThanOrEqual = max => value => hasStringValue(value) === false || value.length <= max
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
  {
    field: 'name',
    validation: hasLengthLessThanOrEqual(80),
    message: 'Maximum 80 characters allowed'
  }
]
-->

```js
function validate(values, validations) {
  const errors = {};
  for (const { field, validation, message } of validations) {
    if (validation(values[field]) === false) {
      errors[field] = message;
    }
  }
  return errors;
}
```

<!--
expect(validate({name: ''}, validations)).toEqual({name: "Name is required"})
expect(validate({name: ' '}, validations)).toEqual({name: "Name is required"})
expect(validate({name: 'Chuck Norris'}, validations)).toEqual({})
expect(validate({name: 'x'.repeat(81)}, validations)).toEqual({name: "Maximum 80 characters allowed"})
-->

Once again, we’ve separated the “what” from the “how”: we have a readable and maintainable list of validations (“what”), a collection of reusable validation functions, and a generic `validate()` function to validate form values (“how”) that we can reuse to validate other forms.

I> We talk about the separation of “what” and “how” in the [Separate “what” and “how”](#what-how) section of the _Divide and conquer, or merge and relax_ chapter.

T> Using a third-party library, like [Zod](https://zod.dev/), [Yup](https://github.com/jquense/yup), or [Joi](https://github.com/hapijs/joi) will make code even shorter and save us from needing to write validation functions ourselves.

You may feel that I have too many similar examples in this book, and you’re right. However, I think such code is so common, and the readability and maintainability benefits of replacing conditions with tables are so huge that it’s worth repeating.

So here is another example (the last one, I promise!):

<!-- eslint-skip -->

```js
const DATE_FORMAT_ISO = 'iso';
const DATE_FORMAT_DE = 'de';
const DATE_FORMAT_UK = 'uk';
const DATE_FORMAT_US = 'us';

const getDateFormat = format => {
  const datePart = 'D';
  const monthPart = 'M';

  switch (format) {
    case DATE_FORMAT_ISO: {
      return `${monthPart}-${datePart}`;
    }
    case DATE_FORMAT_DE: {
      return `${datePart}.${monthPart}`;
    }
    case DATE_FORMAT_UK: {
      return `${datePart}/${monthPart}`;
    }
    case DATE_FORMAT_US:
    default: {
      return `${monthPart}/${datePart}`;
    }
  }
};
```

<!--
expect(getDateFormat(DATE_FORMAT_ISO)).toBe('M-D')
expect(getDateFormat(DATE_FORMAT_DE)).toBe('D.M')
expect(getDateFormat(DATE_FORMAT_UK)).toBe('D/M')
expect(getDateFormat(DATE_FORMAT_US)).toBe('M/D')
expect(getDateFormat()).toBe('M/D')
-->

It’s only 15 lines of code, but I find this code difficult to read. I think that the `switch` statement is unnecessary, and the `datePart` and `monthPart` variables clutter the code so much that it’s almost impossible to read.

Let’s try to replace the `switch` statement with a map, and inline `datePart` and `monthPart` variables:

<!-- const DATE_FORMAT_ISO = 'iso', DATE_FORMAT_DE = 'de', DATE_FORMAT_UK = 'uk', DATE_FORMAT_US = 'us' -->

```js
const DATE_FORMATS = {
  [DATE_FORMAT_ISO]: 'M-D',
  [DATE_FORMAT_DE]: 'D.M',
  [DATE_FORMAT_UK]: 'D/M',
  [DATE_FORMAT_US]: 'M/D'
};

const getDateFormat = format => {
  return DATE_FORMATS[format] ?? DATE_FORMATS[DATE_FORMAT_US];
};
```

<!--
expect(getDateFormat(DATE_FORMAT_ISO)).toBe('M-D')
expect(getDateFormat(DATE_FORMAT_DE)).toBe('D.M')
expect(getDateFormat(DATE_FORMAT_UK)).toBe('D/M')
expect(getDateFormat(DATE_FORMAT_US)).toBe('M/D')
expect(getDateFormat()).toBe('M/D')
-->

The improved version is shorter, and, more importantly, now it’s easy to see all date formats: now the difference is much easier to spot.

I> There’s a proposal to add [pattern matching](https://github.com/tc39/proposal-pattern-matching) to JavaScript, which may give us another option: more flexible than tables but still readable.

## Negative conditions

Negative conditions are generally harder to read than positive ones:

<!--
let enabled = true
let Window = { showInformationMessage: vi.fn() }
-->

<!-- eslint-skip -->

```js
if (!enabled) {
  Window.showInformationMessage(
    'ESLint is not running because the deprecated setting eslint.enable is set to false…'
  );
} else {
  Window.showInformationMessage(
    'ESLint is not running. By default only TypeScript and JavaScript files are validated…'
  );
}
```

<!-- expect(Window.showInformationMessage).toHaveBeenCalled('ESLint is not running. By default only TypeScript and JavaScript files are validated…') -->

Decoding “if not enabled” takes a bit more cognitive effort than “if enabled”:

<!--
let enabled = true
let Window = { showInformationMessage: vi.fn() }
-->

```js
if (enabled) {
  Window.showInformationMessage(
    'ESLint is not running. By default only TypeScript and JavaScript files are validated…'
  );
} else {
  Window.showInformationMessage(
    'ESLint is not running because the deprecated setting eslint.enable is set to false…'
  );
}
```

<!-- expect(Window.showInformationMessage).toHaveBeenCalled('ESLint is not running. By default only TypeScript and JavaScript files are validated…') -->

One notable exception is early returns, which we discussed earlier in this chapter. While negative conditions are harder to read, the overall benefit of structuring functions with early returns outweighs this drawback.

T> The [unicorn/no-negated-condition](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-negated-condition.md) linter rule automatically converts negative conditions to positive ones.

## Repeated conditions

We often need to compare a variable to multiple values. A naïve way to do this is by comparing the variable to each value in a separate clause:

```js
const isSmall = size =>
  size == '1' || size == '2' || size == '3';
```

<!--
expect(isSmall('2')).toBe(true)
expect(isSmall('5')).toBe(false)
-->

Here, we have three clauses that compare the `size` variable to three different values, making the values we compare it to far apart. Instead, we can group them into an array and use the `includes()` array method:

```js
const isSmall = size => ['1', '2', '3'].includes(size);
```

<!--
expect(isSmall('2')).toBe(true)
expect(isSmall('5')).toBe(false)
-->

Now, all the values are grouped together, making the code more readable and maintainable. It’s also easier to add and remove items.

Repeated conditions can make code barely readable. Consider this function that returns special offers for products in a pet shop. The shop has two brands: Horns & Hooves and Paws & Tails, each with unique special offers. Historically, they are stored in the cache differently:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: vi.fn(), get: vi.fn() }  -->

```js
function getSpecialOffersArray(id, isHornsAndHooves) {
  let specialOffersArray = isHornsAndHooves
    ? Session.get(SPECIAL_OFFERS_CACHE_KEY + '_' + id)
    : Session.get(SPECIAL_OFFERS_CACHE_KEY);
  if (!specialOffersArray) {
    const hornsAndHoovesOffers =
      getHornsAndHoovesSpecialOffers();
    const pawsAndTailsOffers = getPawsAndTailsSpecialOffers();
    specialOffersArray = isHornsAndHooves
      ? hornsAndHoovesOffers
      : pawsAndTailsOffers;
    Session.set(
      isHornsAndHooves
        ? SPECIAL_OFFERS_CACHE_KEY + '_' + id
        : SPECIAL_OFFERS_CACHE_KEY,
      specialOffersArray
    );
  }
  return specialOffersArray;
}
```

<!--
expect(getSpecialOffersArray('tacos', false)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', true)).toEqual(['horns'])
-->

The `isHornsAndHooves` condition is repeated three times. Twice to create the same session key. It’s hard to see what this function is doing: business logic is intertwined with low-level session management code.

Let’s try to simplify it a bit:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: vi.fn(), get: vi.fn() }  -->

```js
function getSpecialOffersArray(id, isHornsAndHooves) {
  const cacheKey = isHornsAndHooves
    ? `${SPECIAL_OFFERS_CACHE_KEY}_${id}`
    : SPECIAL_OFFERS_CACHE_KEY;

  const cachedOffers = Session.get(cacheKey);
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = isHornsAndHooves
    ? getHornsAndHoovesSpecialOffers()
    : getPawsAndTailsSpecialOffers();

  Session.set(cacheKey, offers);

  return offers;
}
```

<!--
expect(getSpecialOffersArray('tacos', false)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', true)).toEqual(['horns'])
-->

Now, the code is already more readable, and we can stop here. However, if I had some time, I’d go further and extract cache management. Not because this function is too long or potentially reusable, but because cache management distracts from the main purpose of the function and is too low-level.

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: vi.fn(), get: vi.fn() } -->

```js
const getSessionKey = (id, isHornsAndHooves) =>
  isHornsAndHooves
    ? `${SPECIAL_OFFERS_CACHE_KEY}_${id}`
    : SPECIAL_OFFERS_CACHE_KEY;

function getSpecialOffersArray(id, isHornsAndHooves) {
  const cacheKey = getSessionKey(id, isHornsAndHooves);

  const cachedOffers = Session.get(cacheKey);
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = isHornsAndHooves
    ? getHornsAndHoovesSpecialOffers()
    : getPawsAndTailsSpecialOffers();
  Session.set(cacheKey, offers);
  return offers;
}
```

<!--
expect(getSpecialOffersArray('tacos', false)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', true)).toEqual(['horns'])
-->

It may not look much better, but I think it’s a bit easier to understand what’s happening in the main function. What’s annoying here is `isHornsAndHooves`. I’d rather pass a brand and keep all brand-specific information in tables:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: vi.fn(), get: vi.fn() }  -->

```js
const Brand = {
  HornsAndHooves: 'Horns & Hooves',
  PawsAndTails: 'Paws & Tails'
};

const getSessionKey = (id, brand) =>
  ({
    [Brand.HornsAndHooves]: `${SPECIAL_OFFERS_CACHE_KEY}_${id}`,
    [Brand.PawsAndTails]: SPECIAL_OFFERS_CACHE_KEY
  })[brand];

const getSpecialOffersForBrand = brand =>
  ({
    [Brand.HornsAndHooves]: getHornsAndHoovesSpecialOffers,
    [Brand.PawsAndTails]: getPawsAndTailsSpecialOffers
  })[brand]();

function getSpecialOffersArray(id, brand) {
  const cacheKey = getSessionKey(id, brand);

  const cachedOffers = Session.get(cacheKey);
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = getSpecialOffersForBrand(brand);
  Session.set(cacheKey, offers);
  return offers;
}
```

<!--
expect(getSpecialOffersArray('tacos', Brand.PawsAndTails)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', Brand.HornsAndHooves)).toEqual(['horns'])
-->

Now, all brand-specific code is grouped together and clear, making the algorithm generic.

_Ideally, we should check whether we can implement caching the same way for all brands: this would simplify the code further._

It may seem like I prefer small or even very small functions, but that’s not the case. The main reason for extracting code into separate functions here is that it violates the _single responsibility principle_. The original function had too many responsibilities: getting special offers, generating cache keys, reading data from the cache, and storing data in the cache, each with two branches for our two brands.

I> The [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle) states that any module, class, or method should have only one reason to change, or, in other words, we should keep the code that changes for the same reason together.  
I>  
I> Imagine a pizzeria where a pizzaiolo is responsible only for cooking pizzas, and a cashier is responsible only for charging customers. In other words, we don’t murder people, and they don’t plaster the walls.  
I>  
I> We talk more about this topic in the [Divide and conquer, or merge and relax](#divide) chapter.

Here’s one more example:

```js
function getDiscountAmount(discountOptions) {
  if (
    discountOptions?.userDiscount?.discountAmount
      ?.displayCurrency
  ) {
    if (
      discountOptions?.promoDiscount?.discountAmount
        ?.displayCurrency
    ) {
      if (
        discountOptions.userDiscount.discountAmount
          .displayCurrency.valueInCents >
        discountOptions?.promoDiscount?.discountAmount
          ?.displayCurrency.valueInCents
      ) {
        return discountOptions?.userDiscount?.discountAmount
          ?.displayCurrency;
      } else {
        return discountOptions?.promoDiscount?.discountAmount
          ?.displayCurrency;
      }
    } else {
      return discountOptions?.userDiscount?.discountAmount
        ?.displayCurrency;
    }
  } else if (
    discountOptions?.promoDiscount?.discountAmount
      ?.displayCurrency
  ) {
    return discountOptions?.promoDiscount?.discountAmount
      ?.displayCurrency;
  }

  return { currency: 'EUR', valueInCents: 0 };
}
```

<!--
let v0 = { currency: 'EUR', valueInCents: 0};
let v25 = { currency: 'EUR', valueInCents: 25};
let v10 = { currency: 'EUR', valueInCents: 10};
expect(getDiscountAmount({userDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v10}}, userDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v25}}, userDiscount: {discountAmount: {displayCurrency: v10}}})).toEqual(v25)
expect(getDiscountAmount({})).toEqual(v0)
-->

This function calculates the maximum discount between a user’s personal discount and a site-wide promotion, returning a default value of 0 if neither is present.

My brain is refusing to even try to understand what’s going on here. There’s so much nesting and repetition that it’s hard to see whether this code is doing anything at all.

Let’s try to simplify it a bit:

```js
function getDiscountAmount(discountOptions) {
  const amounts = [
    discountOptions?.userDiscount?.discountAmount
      ?.displayCurrency,
    discountOptions?.promoDiscount?.discountAmount
      ?.displayCurrency
  ];
  const maxAmount = _.maxBy(
    amounts,
    amount => amount?.valueInCents
  );
  return maxAmount ?? { currency: 'EUR', valueInCents: 0 };
}
```

<!--
let v0 = { currency: 'EUR', valueInCents: 0};
let v25 = { currency: 'EUR', valueInCents: 25};
let v10 = { currency: 'EUR', valueInCents: 10};
expect(getDiscountAmount({userDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v10}}, userDiscount: {discountAmount: {displayCurrency: v25}}})).toEqual(v25)
expect(getDiscountAmount({promoDiscount: {discountAmount: {displayCurrency: v25}}, userDiscount: {discountAmount: {displayCurrency: v10}}})).toEqual(v25)
expect(getDiscountAmount({})).toEqual(v0)
-->

Here, we create an array with all possible discounts, then we use Lodash’s [`maxBy()` method](https://lodash.com/docs#maxBy) to find the maximum discount value, and finally, we use the nullish coalescing operator to either return the maximum or 0.

Now, it’s clear that we want to find the maximum of two types of discounts, otherwise return 0.

## Formulas

Similar to tables, a single expression, or _a formula_ can often replace a whole bunch of conditions. Consider [this example](https://x.com/JeroenFrijters/status/1615204074588180481):

<!-- prettier-ignore -->
```js
function getStarRating(percentage) {
  if (percentage === 0)
    return '✩✩✩✩✩✩✩✩✩✩';
  if (percentage > 0 && percentage <= 0.1)
    return '★✩✩✩✩✩✩✩✩✩';
  if (percentage > 0.1 && percentage <= 0.2)
    return '★★✩✩✩✩✩✩✩✩';
  if (percentage > 0.2 && percentage <= 0.3)
    return '★★★✩✩✩✩✩✩✩';
  if (percentage > 0.3 && percentage <= 0.4)
    return '★★★★✩✩✩✩✩✩';
  if (percentage > 0.4 && percentage <= 0.5)
    return '★★★★★✩✩✩✩✩';
  if (percentage > 0.5 && percentage <= 0.6)
    return '★★★★★★✩✩✩✩';
  if (percentage > 0.6 && percentage <= 0.7)
    return '★★★★★★★✩✩✩';
  if (percentage > 0.7 && percentage <= 0.8)
    return '★★★★★★★★✩✩';
  if (percentage > 0.8 && percentage <= 0.9)
    return '★★★★★★★★★✩';
  return '★★★★★★★★★★';
}
```

<!--
expect(getStarRating(0)).toBe('✩✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.01)).toBe('★✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.1)).toBe('★✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.11)).toBe('★★✩✩✩✩✩✩✩✩')
expect(getStarRating(0.91)).toBe('★★★★★★★★★★')
-->

The problem with this code isn’t that it’s especially hard to understand, but that it has a very large surface for bugs: every number and every condition could be wrong, and there are lots of them here. This code also needs many test cases to make sure it’s correct.

Let’s try to replace conditions with a formula:

```js
const FILLED_STAR_ICON = '★';
const EMPTY_STAR_ICON = '✩';
function getStarRating(percentage) {
  const filledStars = Math.ceil(percentage * 10);
  return [
    FILLED_STAR_ICON.repeat(filledStars),
    EMPTY_STAR_ICON.repeat(10 - filledStars)
  ].join('');
}
```

<!--
expect(getStarRating(0)).toBe('✩✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.01)).toBe('★✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.1)).toBe('★✩✩✩✩✩✩✩✩✩')
expect(getStarRating(0.11)).toBe('★★✩✩✩✩✩✩✩✩')
expect(getStarRating(0.91)).toBe('★★★★★★★★★★')
-->

It’s harder to understand than the initial implementation, but it requires significantly fewer test cases, and we’ve separated the design and the code. The icons will likely change, but the algorithm probably won’t.

I> This approach is known as [separation of logic and presentation](https://martinfowler.com/eaaDev/SeparatedPresentation.html).

{#nested-ternaries}

## Nested ternaries

A _ternary operator_, or just a ternary, is a short, one-line conditional operator. It’s very useful when we want to assign one of two values to a variable. Let’s take this `if` statement as an example:

```js
const caffeineLevel = 25;

let drink;
if (caffeineLevel < 50) {
  drink = 'coffee';
} else {
  drink = 'water';
}
// → coffee
```

<!-- expect(drink).toBe('coffee') -->

Now, compare it to a ternary:

```js
const caffeineLevel = 25;

const drink = caffeineLevel < 50 ? 'coffee' : 'water';
// → coffee
```

<!-- expect(drink).toBe('coffee') -->

However, nested ternaries are different beasts: they make code harder to read because it’s difficult to see which branch belongs to which condition. There’s almost always a better alternative.

<!-- const Loading = () => <p>...</p> -->

<!-- prettier-ignore -->
```jsx
function Products({products, isError, isLoading}) {
  return isError
    ? <p>Error loading products</p>
    : isLoading
      ? <Loading />
      : products.length > 0
        ? (
            <ul>
              {products.map(product => (
                <li key={product.id}>{product.name}</li>
              ))}
            </ul>
          )
        : <p>No products found</p>
}
```

<!--
const {container: c1} = RTL.render(<Products products={[{id: '1', name: 'Tacos'}]} />);
expect(c1.textContent).toEqual('Tacos')
const {container: c2} = RTL.render(<Products products={[]} />);
expect(c2.textContent).toEqual('No products found')
const {container: c3} = RTL.render(<Products isLoading />);
expect(c3.textContent).toEqual('...')
const {container: c4} = RTL.render(<Products isError />);
expect(c4.textContent).toEqual('Error loading products')
-->

This is a rare case where Prettier makes the code completely unreadable:

<!-- const Loading = () => <p>...</p> -->

```jsx
function Products({ products, isError, isLoading }) {
  return isError ? (
    <p>Error loading products</p>
  ) : isLoading ? (
    <Loading />
  ) : products.length > 0 ? (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  ) : (
    <p>No products found</p>
  );
}
```

<!--
const {container: c1} = RTL.render(<Products products={[{id: '1', name: 'Tacos'}]} />);
expect(c1.textContent).toEqual('Tacos')
const {container: c2} = RTL.render(<Products products={[]} />);
expect(c2.textContent).toEqual('No products found')
const {container: c3} = RTL.render(<Products isLoading />);
expect(c3.textContent).toEqual('...')
const {container: c4} = RTL.render(<Products isError />);
expect(c4.textContent).toEqual('Error loading products')
-->

But maybe it’s intentional and gives us a clear sign that we should rewrite this code.

I> We talk about code formatting and Prettier in the [Autoformat your code](#formatting) chapter.

In this example, we render one of four UI states:

- a spinner (loading);
- an error message (failure);
- a list of products (success);
- a “no products” message (also success).

Let’s rewrite this code using the already familiar early return pattern:

<!-- const Loading = () => <p>...</p> -->

```jsx
function Products({ products, isError, isLoading }) {
  if (isError) {
    return <p>Error loading products</p>;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

<!--
const {container: c1} = RTL.render(<Products products={[{id: '1', name: 'Tacos'}]} />);
expect(c1.textContent).toEqual('Tacos')
const {container: c2} = RTL.render(<Products products={[]} />);
expect(c2.textContent).toEqual('No products found')
const {container: c3} = RTL.render(<Products isLoading />);
expect(c3.textContent).toEqual('...')
const {container: c4} = RTL.render(<Products isError />);
expect(c4.textContent).toEqual('Error loading products')
-->

I think it’s much easier to follow now: all special cases are at the top of the function, and the happy path is at the end.

I> We’ll come back to this example later in the [Make impossible states impossible](#impossible-states) section of the _Other techniques_ chapter.

## Complex conditions

Sometimes, we can’t reduce the number of conditions, and the only way to improve the code is to make it easier to understand what a certain complex condition does.

Consider [this example](https://refactoring.guru/extract-variable) from the Refactoring Guru:

<!--
let resize = 1
let wasInitialized = () => true
function test(platform, browser) {
-->

<!-- eslint-disable unicorn/prefer-includes -->

```js
if (
  platform.toUpperCase().indexOf('MAC') > -1 &&
  browser.toUpperCase().indexOf('IE') > 1 &&
  wasInitialized() &&
  resize > 0
) {
  // Do something…
}
```

<!--
  else {
    return false
  }
}
expect(test('Mac_PowerPC', 'Mozilla/4.0 (compatible; MSIE 5.17; Mac_PowerPC)')).toBe(undefined)
expect(test('MacInter', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50')).toBe(false)
-->

This code checks multiple conditions, such as the user’s browser or the state of the widget. However, all these checks are crammed into a single expression, making it hard to understand. It’s often a good idea to extract complex calculations and conditions from an already long expression into separate variables:

<!--
let resize = 1
let wasInitialized = () => true
function test(platform, browser) {
-->

```js
const isMacOs = platform.toUpperCase().includes('MAC');
const isIE = browser.toUpperCase().includes('IE');
const wasResized = resize > 0;
if (isMacOs && isIE && wasInitialized() && wasResized) {
  // Do something…
}
```

<!--
  else {
    return false
  }
}
expect(test('Mac_PowerPC', 'Mozilla/4.0 (compatible; MSIE 5.17; Mac_PowerPC)')).toBe(undefined)
expect(test('MacInter', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50')).toBe(false)
-->

Now, the condition is shorter and more readable because names help us to understand what the condition does in the context of the function where it’s used.

Here’s another example:

```js
function mapTips(allTips, ingredients, tags) {
  return allTips.filter(tip => {
    return (
      (tip.ingredient === undefined ||
        ingredients.some(
          ({ name }) => name === tip.ingredient
        )) &&
      tip.tags.every(tag => tags.includes(tag))
    );
  });
}
```

<!--
expect(mapTips([{ingredient: 'bacon', tags: []}, {tags: ['tacos']}], [{name:'bacon'}], [])).toEqual([{ingredient: 'bacon', tags: []}])
expect(mapTips([{tags: ['baking']}, {tags: ['tacos', 'potatoes']}], [], ['tacos', 'potatoes'])).toEqual([{tags: ['tacos', 'potatoes']}])
-->

I wrote this code myself, but now it takes me a long time to understand what’s going on. We get a list of tips, and we keep only those that are suitable for the current recipe: it has the ingredient matching any of the `ingredients` or it has tags matching all the `tags`.

Let’s try to make it clearer:

```js
function mapTips(allTips, ingredients, tags) {
  const ingredientNames = ingredients.map(x => x.name);

  return allTips.filter(tip => {
    // The tip’s ingredient matches any of the recipe’s
    // ingredients, if defined
    const hasMatchingIngredients = tip.ingredient
      ? ingredientNames.includes(tip.ingredient)
      : true;

    // All tip’s tags are present in recipe’s tags
    const hasMatchingTags = tip.tags.every(tag =>
      tags.includes(tag)
    );

    return hasMatchingIngredients && hasMatchingTags;
  });
}
```

<!--
expect(mapTips([{ingredient: 'bacon', tags: []}, {tags: ['tacos']}], [{name:'bacon'}], [])).toEqual([{ingredient: 'bacon', tags: []}])
expect(mapTips([{tags: ['baking']}, {tags: ['tacos', 'potatoes']}], [], ['tacos', 'potatoes'])).toEqual([{tags: ['tacos', 'potatoes']}])
-->

The code is noticeably longer, but it’s less dense and doesn’t try to do everything at once. We start by saving ingredient names to make it easier to compare later. Then, inside the `filter()` callback function, we check whether the tip’s ingredient matches any of the recipe’s ingredients (but only if the tip specifies the ingredient), and finally we check whether all tip’s tags are present in the recipe’s tags.

I> The [Naming is hard](#naming) chapter has a few more examples of extracting complex conditions.

---

Conditions allow us to write generic code that supports many use cases. However, when the code has too many conditions, it becomes hard to read and test. We should be vigilant and avoid unnecessary conditions, or replace some conditions with more maintainable and testable alternatives.

Start thinking about:

- Removing unnecessary conditions, such as explicitly comparing a boolean value to `true` or `false`.
- Normalizing the input data by converting the absence of data to an array early on to avoid branching and dealing with no data separately.
- Normalizing the state to avoid algorithm duplication.
- Replacing complex condition with a single expression (formula) or a map.
- Replacing nested ternaries or `if` operators with early returns.
- Caching repeated conditions in a variable.
