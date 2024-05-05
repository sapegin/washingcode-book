{#avoid-conditions}

# Avoid conditions

Conditions make code harder to read and test. They add nesting and make lines of code longer, so we have to split them into several lines. Each condition increases the minimum number of test cases we need to write for a certain module or function.

## Unnecessary conditions

Many conditions are unnecessary or could be rewritten in a more readable way.

For example, we may find code similar to this that returns a boolean value:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value !== NONE ? true : false;
const hasProducts = products.length > 0 ? true : false;
```

<!--
expect(hasValue).toBe(false)
expect(hasProducts).toBe(false)
-->

Both, `value !== NONE` and `products.length > 0` already give us booleans, so we can avoid the ternary operator:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value !== NONE;
const hasProducts = products.length > 0;
```

<!--
expect(hasValue).toBe(false)
expect(hasProducts).toBe(false)
-->

And even when the initial value isn’t a boolean:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value ? true : false;
const hasProducts = products.length ? true : false;
```

<!--
expect(hasValue).toBe(false)
expect(hasProducts).toBe(false)
-->

We still can avoid the condition by explicitly converting the value to a boolean:

<!-- const NONE = null, value = NONE -->

```js
const hasValue = Boolean(value);
```

<!--
expect(hasValue).toBe(false)
-->

In all cases, code without a ternary is both shorter and easier to read.

There are more cases when a condition is unnecessary:

```diff
- const hasProducts = products && Array.isArray(products);
+ const hasProducts = Array.isArray(products);
```

`Array.isArray` returns `false` for any falsy value, no need to check for it separately.

And a more complex but great (and real!) example of unnecessary conditions:

<!-- const window = { navigator: { userAgent: '' } } -->

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

The whole condition block could be replaced with a single expression:

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

We’ve eliminated two levels of nesting and quite a lot of boilerplate code, so the actual condition is easier to understand.

I often see two conditions for a single boolean variable:

```jsx
const RefundLabel = ({
  type,
  typeLabels,
  hasUserSelectableRefundOptions
}) => (
  <label>
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

Here we compare `type` three times, which is unnecessary:

```jsx
const RefundLabelMessage = ({
  type,
  typeLabels,
  hasUserSelectableRefundOptions
}) => {
  if (type) {
    return typeLabels[type];
  }

  return hasUserSelectableRefundOptions ? 'Estimated:' : 'Total:';
};

const RefundLabel = props => (
  <label>
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

We had to split the component into two to use early return but the logic is now clearer.

## Processing arrays

It’s common to check an array’s length before running a loop over its items:

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

All loops and array functions, like `map()` or `filter()` work fine with empty arrays, so we can safely remove the check:

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

Sometimes we have to use an existing API that returns an array only in some cases, so checking the length directly would fail and we need to check the type first:

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

We can’t avoid the condition in this case but we can _lift it to the function head_ and avoid a separate branch that handles the absence of an array. There are several ways to do it, depending on the possible data types.

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

Or a default value for the destructured property of an object:

```diff
- function getProductsDropdownItems(products = []) {
+ function getProductsDropdownItems({ products = [] }) {
```

It’s more tricky if our data can be an array or `null`, because defaults are only used when the value is strictly `undefined`, not just falsy. In this case, we can use the nullish coalescing operator:

```js
function getProductsDropdownItems(products) {
  const productList = products ?? [];
  return productList.map(product => ({
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

We still have a condition but the overall code structure is simpler.

In all these examples we’re removing a separate branch and dealing with the absence of data by normalizing the input — converting it to an array — as early as possible, and then running a generic algorithm on normalized data.

Arrays are convenient because we don’t have to worry about how many items they contain: the same code will work with a hundred items, one item, or even no items.

A similar technique works when the input is a single item or an array:

```js
function getProductsDropdownItems({ products }) {
  const productList = Array.isArray(products) ? products : [products];
  return productList.map(product => ({
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

Here we’re wrapping a single item in an array, so we can use the same code to work with single items and arrays.

## Deduplicating an algorithm

Examples in the previous section are introducing an important technique: algorithm deduplication. Instead of having several branches of the main logic depending on the nature of the input, we have just one. But we’re normalizing the input before running the algorithm. This technique can be used in other places.

Imagine an article vote counter, similar to Medium, where we can vote multiple times:

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
articles.downvote('/cats-better-than-dogs');
articles.get('/dogs-better-than-cats');
// => 5
```

<!--
expect(articles.get('/cats-better-than-dogs')).toBe(0)
expect(articles.get('/dogs-better-than-cats')).toBe(5)
-->

A naïve way to implement the `upvote()` method could be:

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

The problem here is that the main function logic, count increment, is implemented twice: for the case when we already have voted for that URL and when we’re voting for the first time. So every time we need to update this logic, we need to make changes in two places. We need to write two sets of very similar tests to make sure both branches work as expected, otherwise, they’ll eventually diverge and we’ll have hard-to-debug issues.

Let’s make the main logic unconditional but prepare the state if necessary before running the logic:

```js
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

Now we don’t have any logic duplication. We’re normalizing the data structure, so the generic algorithm could work with it.

I often see a similar issue when someone calls a function with different parameters:

<!-- const log = jest.fn(), errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
if (errorMessage) {
  log(LOG_LEVEL.ERROR, errorMessage);
} else {
  log(LOG_LEVEL.ERROR, DEFAULT_ERROR_MESSAGE);
}
```

<!-- expect(log).toBeCalledWith('error', 'nope') -->

Let’s move a condition inside the function call:

<!-- const log = jest.fn(), errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
log(LOG_LEVEL.ERROR, errorMessage || DEFAULT_ERROR_MESSAGE);
```

<!-- expect(log).toBeCalledWith('error', 'nope') -->

We’ve removed all code duplication and the code is shorter and easier to read.

## Optional function parameters

We often add conditions when some data might be missing. For example, an optional callback function:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```ts
function getRandomJoke(onDone, onError) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(err => {
      if (onError) {
        onError(err.message);
      }
    });
}
```

<!--
const onDone = jest.fn(), onError = jest.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

Here, the `onError` parameter is optional, and we check if it exists before calling it. The problem here is that we need to remember to wrap each call to an optional callback into a condition. It increases complexity and cognitive load and makes the code harder to read.

One way to simplify the code here is by using optional chaining:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```ts
function getRandomJoke(onDone, onError) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(err => {
      onError?.(err.message);
    });
}
```

<!--
const onDone = jest.fn(), onError = jest.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

It looks neater, however, it has the same issues as the `if` statement.

I usually try to avoid these kinds of conditions and make sure all optional parameters are available, even if empty, so I could access them without checking if they are available first.

My favorite way to do it is by lifting the condition to the function head using optional function parameters:

<!-- const fetch = () => ({ then: (cb) => { cb({ json: () => {} } ); return ({ then: (cb) => { cb('pizza'); return ({ catch: (cb) => { cb({message: 'nope'}) } })} }) } })
 -->

```ts
function getRandomJoke(onDone, onError = () => {}) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(result => result.json())
    .then(data => {
      onDone(data);
    })
    .catch(err => {
      onError(err.message);
    });
}
```

<!--
const onDone = jest.fn(), onError = jest.fn()
getRandomJoke(onDone, onError)
expect(onDone).toBeCalledWith('pizza')
expect(onError).toBeCalledWith('nope')
expect(() => getRandomJoke(onDone)).not.toThrowError()
-->

Now we could call the `onError` function whenever we need, and it won’t fail. It won’t do anything if we don’t pass it to the function, but we don’t need to care about this while we’re coding the function itself.

## Early return

Applying _guard clauses_, or _early returns_, is a great way to avoid nested conditions. A series of nested conditions, also known as the [arrow antipattern](http://wiki.c2.com/?ArrowAntiPattern) or _dangerously deep nesting_, is often used for error handling:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

```js
function postOrderStatus(orderId) {
  var idsArrayObj = getOrderIds();

  if (idsArrayObj != undefined) {
    if (idsArrayObj.length == undefined) {
      var tmpBottle = idsArrayObj;
      idsArrayObj = new Array(tmpBottle);
    }

    var fullRecordsArray = new Array();
    // 70 lines of code

    if (fullRecordsArray.length != 0) {
      // 40 lines of code
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

There are 120 lines between the first condition and its `else` block. And the main return value is somewhere inside three levels of conditions.

Let’s untangle this spaghetti monster:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

```js
function postOrderStatus(orderId) {
  let idsArrayObj = getOrderIds();
  if (idsArrayObj === undefined) {
    return false;
  }

  if (!Array.isArray(idsArrayObj)) {
    idsArrayObj = [idsArrayObj];
  }

  const fullRecordsArray = [];

  // 70 lines of code
  if (fullRecordsArray.length === 0) {
    return false;
  }

  // 40 lines of code
  return sendOrderStatus(fullRecordsArray);
}
```

<!-- expect(() => postOrderStatus(0)).not.toThrowError() -->

This function is still long but it’s much easier to follow because of a more straightforward code structure.

Now we have at most one level of nesting inside the function and the main return value is at the very end without nesting. We’ve added two guard clauses to exit the function early when there’s no data to process.

I’m not so sure what the code inside the second condition does, but it looks like it’s wrapping a single item in an array as we did in the previous section.

_And no, I have no idea what `tmpBottle` means, nor why it was needed._

The next step here could be improving the `getOrderIds()` function’s API. It can return three different things: `undefined`, a single item, or an array. We have to deal with each separately, so we have two conditions at the very beginning of the function, and we’re reassigning the `idsArrayObj` variable (see [Avoid reassigning variables](#avoid-reassigning-variables) below).

By making the `getOrderIds()` function always return an array, and making sure that the code inside `// 70 lines of code` works with an empty array, we could remove both conditions:

<!-- const getOrderIds = () => ([]), sendOrderStatus = () => {} -->

```js
function postOrderStatus(orderId) {
  const orderIds = getOrderIds(); // Always an array

  const fullRecordsArray = [];

  // 70 lines of code
  if (fullRecordsArray.length === 0) {
    return false;
  }

  // 40 lines of code
  return sendOrderStatus(fullRecordsArray);
}
```

<!-- expect(() => postOrderStatus(0)).not.toThrowError() -->

Now that’s a big improvement over the initial version. I’ve also renamed the `idsArrayObj` variable, because “array object” doesn’t make any sense to me.

The next step would be out of the scope of this chapter: the code inside `// 70 lines of code` mutates the `fullRecordsArray`, see the [Avoid mutation](#avoid-mutation) chapter below to learn why mutations aren’t good and how to avoid them.

## Repeated conditions

Repeated conditions can make code barely readable. Let’s have a look at this function that returns special offers for a product in our pet shops. We have two brands, Horns & Hooves and Paws & Tails, and they have unique special offers. For historical reasons, we store them in the cache differently:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: jest.fn(), get: jest.fn() }  -->

```js
function getSpecialOffersArray(sku, isHornsAndHooves) {
  let specialOffersArray = isHornsAndHooves
    ? Session.get(SPECIAL_OFFERS_CACHE_KEY + '_' + sku)
    : Session.get(SPECIAL_OFFERS_CACHE_KEY);
  if (!specialOffersArray) {
    const hornsAndHoovesOffers = getHornsAndHoovesSpecialOffers();
    const pawsAndTailsOffers = getPawsAndTailsSpecialOffers();
    specialOffersArray = isHornsAndHooves
      ? hornsAndHoovesOffers
      : pawsAndTailsOffers;
    Session.set(
      isHornsAndHooves
        ? SPECIAL_OFFERS_CACHE_KEY + '_' + sku
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

The `isHornsAndHooves` condition is repeated three times. Two of them create the same session key. It’s hard to see what this function is doing: business logic is intertwined with low-level session management code.

Let’s try to make it simpler:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: jest.fn(), get: jest.fn() }  -->

```js
function getSpecialOffersArray(sku, isHornsAndHooves) {
  const cacheKey = isHornsAndHooves
    ? `${SPECIAL_OFFERS_CACHE_KEY}_${sku}`
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

This is already more readable and it could be a good idea to stop here. But if I had some time I’d go further and extract cache management. Not because this function is too long or that it’s potentially reusable, but because cache management distracts me from the main purpose of the function and it’s too low level.

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: jest.fn(), get: jest.fn() }  -->

```js
const getSessionKey = (key, isHornsAndHooves, sku) =>
  isHornsAndHooves ? `${key}_${sku}` : key;

const sessionGet = (key, isHornsAndHooves, sku) =>
  Session.get(getSessionKey(key, isHornsAndHooves, sku));

const sessionSet = (key, sku, isHornsAndHooves, value) =>
  Session.set(getSessionKey(key, isHornsAndHooves, sku), value);

function getSpecialOffersArray(sku, isHornsAndHooves) {
  const cachedOffers = sessionGet(
    SPECIAL_OFFERS_CACHE_KEY,
    isHornsAndHooves,
    sku
  );
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = isHornsAndHooves
    ? getHornsAndHoovesSpecialOffers()
    : getPawsAndTailsSpecialOffers();

  sessionSet(SPECIAL_OFFERS_CACHE_KEY, isHornsAndHooves, sku, offers);

  return offers;
}
```

<!--
expect(getSpecialOffersArray('tacos', false)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', true)).toEqual(['horns'])
-->

It may not look much better but I think it’s a bit easier to understand what’s happening in the main function. What annoys me here is `isHornsAndHooves`. I’d rather pass a brand name and keep all brand-specific information in tables:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: jest.fn(), get: jest.fn() }  -->

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSpecialOffersForBrand = brand =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: getHornsAndHoovesSpecialOffers,
    [BRANDS.PAWS_AND_TAILS]: getPawsAndTailsSpecialOffers
  })[brand]();

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  })[brand];

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, sku, brand, value) =>
  Session.set(getSessionKey(key, brand, sku), value);

function getSpecialOffersArray(sku, brand) {
  const cachedOffers = sessionGet(
    SPECIAL_OFFERS_CACHE_KEY,
    brand,
    sku
  );
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = getSpecialOffersForBrand(brand);
  sessionSet(SPECIAL_OFFERS_CACHE_KEY, brand, sku, offers);
  return offers;
}
```

<!--
expect(getSpecialOffersArray('tacos', BRANDS.PAWS_AND_TAILS)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', BRANDS.HORNS_AND_HOOVES)).toEqual(['horns'])
-->

Now it’s clear that the only piece of business logic here is `getSpecialOffersForBrand`, and the rest is caching. If we’re using this pattern more than once I’d extract it into its own module, similar to the [memoize function](https://lodash.com/docs#memoize) from Lodash:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers', getHornsAndHoovesSpecialOffers = () => ['horns'], getPawsAndTailsSpecialOffers = () => ['paws'], Session = { set: jest.fn(), get: jest.fn() }  -->

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  })[brand];

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, brand, sku, value) =>
  Session.set(getSessionKey(key, brand, sku), value);

const withSessionCache =
  (key, fn) =>
  (sku, brand, ...args) => {
    const cachedValue = sessionGet(key, brand, sku);
    if (cachedValue) {
      return cachedValue;
    }

    const value = fn(brand, sku, ...args);
    sessionSet(key, brand, sku, value);
    return value;
  };

// --- 8< -- 8< ---

const getSpecialOffersArray = withSessionCache(
  SPECIAL_OFFERS_CACHE_KEY,
  brand =>
    ({
      [BRANDS.HORNS_AND_HOOVES]: getHornsAndHoovesSpecialOffers,
      [BRANDS.PAWS_AND_TAILS]: getPawsAndTailsSpecialOffers
    })[brand]()
);
```

<!--
expect(getSpecialOffersArray('tacos', BRANDS.PAWS_AND_TAILS)).toEqual(['paws'])
expect(getSpecialOffersArray('tacos', BRANDS.HORNS_AND_HOOVES)).toEqual(['horns'])
-->

We were able to separate all low-level code and hide it in another module.

It may seem like I prefer small functions or even very small functions, but that’s not the case. The main reason to extract code into separate functions here is a violation of the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle). The original function had too many responsibilities: getting special offers, generating cache keys, reading data from the cache, and storing data in the cache. Each with two branches for our two brands.

## Tables or maps

One of my favorite techniques for improving _(read: avoiding)_ conditions is replacing them with tables or maps. With JavaScript, we can create a table or a map using a plain object.

We’ve just done this as a part of our "special offers" refactoring example above. Let’s have a look at a simpler example now. This example may be a bit extreme, but I actually wrote this code 19 years ago:

<!-- let month = 'may' -->

<!-- prettier-ignore -->
```js
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
```

<!-- expect(month).toBe(5) -->

Let’s replace the conditions with a table:

<!-- const monthName = 'may' -->

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
const month = MONTH_NAME_TO_NUMBER[monthName];
```

<!-- expect(month).toBe(5) -->

There’s almost no boilerplate code around the data, it’s more readable and looks like a table. Notice also that there are no brackets in the original code: in most modern style guides brackets around condition bodies are required, and the body should be on its own line, so this snippet will be three times longer and even less readable.

Another issue with the initial code is that the `month` variable’s initial type is string, but then it becomes a number. This is confusing, and if we were using a typed language (like TypeScript), we would have to check the type every time we want to access this variable.

Or a bit more realistic and common example:

<!-- const Button = ({children}) => <button>{children}</button> -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton => {
  switch (decisionButton) {
    case DECISION_YES:
      return 'Yes';
    case DECISION_NO:
      return 'No';
    case DECISION_MAYBE:
      return 'Maybe';
  }
};

// And later it's used like this
const CtaButton = ({ decision }) => (
  <Button>{getButtonLabel(decision)}</Button>
);
```

<!--
const {container: c1} = RTL.render(<CtaButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<CtaButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

Here we have a `switch` statement to return one of three button labels.

First, let’s replace the `switch` with a table:

<!-- const Button = ({children}) => <button>{children}</button> -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton =>
  ({
    [DECISION_YES]: 'Yes',
    [DECISION_NO]: 'No',
    [DECISION_MAYBE]: 'Maybe'
  })[decisionButton];

// And later it's used like this
const CtaButton = ({ decision }) => (
  <Button>{getButtonLabel(decision)}</Button>
);
```

<!--
const {container: c1} = RTL.render(<CtaButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<CtaButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

The object syntax is a bit more lightweight and readable than the `switch` statement.

We can even make this code more idiomatic to React by converting our `getButtonLabel` function into a React component:

<!-- const Button = ({children}) => <button>{children}</button> -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const ButtonLabel = ({ decision }) =>
  ({
    [DECISION_YES]: 'Yes',
    [DECISION_NO]: 'No',
    [DECISION_MAYBE]: 'Maybe'
  })[decision];

// And later it can be used like this
const CtaButton = ({ decision }) => (
  <Button>
    <ButtonLabel decision={decision} />
  </Button>
);
```

<!--
const {container: c1} = RTL.render(<CtaButton decision={DECISION_YES} />);
expect(c1.textContent).toEqual('Yes')
const {container: c2} = RTL.render(<CtaButton decision={DECISION_MAYBE} />);
expect(c2.textContent).toEqual('Maybe')
-->

Now both the implementation and the usage are simpler.

Another realistic and common example is form validation:

```jsx
function validate(values) {
  const errors = {};

  if (!values.name || (values.name && values.name.trim() === '')) {
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

  if (!values.login || (values.login && values.login.trim() === '')) {
    errors.login = 'Login is required';
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = 'No spaces are allowed in login';
  }

  if (values.address1 && values.address1.length > 80) {
    errors.address1 = 'Maximum 80 characters allowed';
  }

  // 100 lines of code

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

This function is very long, with lots and lots of repetitive boilerplate code. It’s really hard to read and maintain. Sometimes validations for the same field aren’t grouped.

But if we look closer, there are just three unique validations:

- a required field (in some cases leading and trailing whitespace is ignored, in some not — hard to tell whether it’s intentional or not);
- maximum length (always 80);
- no spaces allowed.

First, let’s extract all validations into their own functions so we can reuse them later:

```js
const hasStringValue = value => value && value.trim() !== '';
const hasLengthLessThanOrEqual = max => value =>
  !hasStringValue(value) || (value && value.length <= max);
const hasNoSpaces = value =>
  !hasStringValue(value) || (value && !value.includes(' '));
```

<!--
expect(hasStringValue('  ')).toBe(false)
expect(hasStringValue('x')).toBe(true)
expect(hasLengthLessThanOrEqual(3)('x')).toBe(true)
expect(hasLengthLessThanOrEqual(3)('xxx')).toBe(true)
expect(hasLengthLessThanOrEqual(3)('xxxx')).toBe(false)
expect(hasNoSpaces('x')).toBe(true)
expect(hasNoSpaces('x y')).toBe(false)
-->

I’ve assumed that different whitespace handling was a bug. I’ve also inverted all the conditions to validate the correct value, instead of an incorrect one, to make the code more readable.

Note that `hasLengthLessThanOrEqual` and `hasNoSpaces` only check the condition if the value is present, which would allow us to make optional fields. Also, note that the `hasLengthLessThanOrEqual` function is customizable: we need to pass the maximum length: `hasLengthLessThanOrEqual(80)`.

Now we can define our validations table. There are two ways of doing this:

- using an object where keys represent form fields
- using an array

We’re going to use the second option because we want to have several validations with different error messages for some fields, for example, a field can be required _and_ have a maximum length:

<!--
const hasStringValue = value => value && value.trim() !== ''
const hasLengthLessThanOrEqual = max => value =>
  !hasStringValue(value) || (value && value.length <= max)
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

Now we need to iterate over this array and run validations for all fields:

<!--
const hasStringValue = value => value && value.trim() !== ''
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
]
-->

```js
function validate(values, validations) {
  return validations.reduce(
    (errors, { field, validation, message }) => {
      if (!validation(values[field])) {
        errors[field] = message;
      }
      return errors;
    },
    {}
  );
}
```

<!--
expect(validate({name: ''}, validations)).toEqual({"name": "Name is required"})
expect(validate({name: ' '}, validations)).toEqual({"name": "Name is required"})
expect(validate({name: 'Chuck Norris'}, validations)).toEqual({})
-->

One more time we’ve separated the “what” from the “how”: we have a readable and maintainable list of validations (“what”), a collection of reusable validation functions, and a `validate` function to validate form values (“how”) that also can be reused.

_Tip: Using a third-party library, like [Zod](https://zod.dev/), [Yup](https://github.com/jquense/yup), or [Joi](https://github.com/hapijs/joi) will make code even shorter and save us from needing to write validation functions ourselves._

You may feel that I have too many similar examples in this book, and you’re right. But I think such code is so common, and the readability and maintainability benefits of replacing conditions with tables are so huge, so it’s worth repeating. So here is one more example (the last one, I promise!):

<!-- const DATE_FORMAT_ISO = 'iso', DATE_FORMAT_DE = 'de', DATE_FORMAT_UK = 'uk', DATE_FORMAT_US = 'us' -->

```js
const getDateFormat = format => {
  const datePart = 'D';
  const monthPart = 'M';

  switch (format) {
    case DATE_FORMAT_ISO:
      return `${monthPart}-${datePart}`;
    case DATE_FORMAT_DE:
      return `${datePart}.${monthPart}`;
    case DATE_FORMAT_UK:
      return `${datePart}/${monthPart}`;
    case DATE_FORMAT_US:
    default:
      return `${monthPart}/${datePart}`;
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

It’s just 15 lines of code, but I find this code difficult to read. I think that the `switch` is absolutely unnecessary, and the `datePart` and `monthPart` variables clutter the code so much that it’s almost unreadable.

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

The improved version isn’t much shorter, but now it’s easy to see all date formats. We’ve extracted the data to a short and readable object and separated it from the code that accesses the right piece of this data.

## Formulas

Similar to tables, a single formula could often replace a whole bunch of conditions. Consider [this example](https://twitter.com/JeroenFrijters/status/1615204074588180481):

```js
function getPercentageRounds(percentage) {
  if (percentage === 0) return '⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0 && percentage <= 0.1)
    return '🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0.1 && percentage <= 0.2)
    return '🔵🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0.2 && percentage <= 0.3)
    return '🔵🔵🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0.3 && percentage <= 0.4)
    return '🔵🔵🔵🔵⚪️⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0.4 && percentage <= 0.5)
    return '🔵🔵🔵🔵🔵⚪️⚪️⚪️⚪️⚪️';
  if (percentage > 0.5 && percentage <= 0.6)
    return '🔵🔵🔵🔵🔵🔵⚪️⚪️⚪️⚪️';
  if (percentage > 0.6 && percentage <= 0.7)
    return '🔵🔵🔵🔵🔵🔵🔵⚪️⚪️⚪️';
  if (percentage > 0.7 && percentage <= 0.8)
    return '🔵🔵🔵🔵🔵🔵🔵🔵⚪️⚪️';
  if (percentage > 0.8 && percentage <= 0.9)
    return '🔵🔵🔵🔵🔵🔵🔵🔵🔵⚪️';
  return '🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵';
}
```

<!--
expect(getPercentageRounds(0)).toBe('⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.01)).toBe('🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.1)).toBe('🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.11)).toBe('🔵🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.91)).toBe('🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵')
-->

Folks in replies on Twitter argue that this code is easy to understand and doesn’t need any improvements. I agree that it’s easy to understand but it has a very large surface for bugs: every number and every condition could be wrong, and there are many of them. This code will also need many test cases to make sure it’s correct.

Let’s try to replace conditions with a formula:

```js
const FULL_ROUND_ICON = '🔵';
const EMPTY_ROUND_ICON = '⚪️';
function getPercentageRounds(percentage) {
  const fullRounds = Math.ceil(percentage * 10);
  return [
    FULL_ROUND_ICON.repeat(fullRounds),
    EMPTY_ROUND_ICON.repeat(10 - fullRounds)
  ].join('');
}
```

<!--
expect(getPercentageRounds(0)).toBe('⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.01)).toBe('🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.1)).toBe('🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.11)).toBe('🔵🔵⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
expect(getPercentageRounds(0.91)).toBe('🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵')
-->

It is a bit harder to understand than the initial implementation but it needs significantly fewer test cases, and we’ve separated the design and the code. The images will likely change but I doubt that the algorithm will.

## Nested ternaries

A ternary operator is a short one-line conditional operator. It’s very useful when we want to assign one of two values to a variable. Compare an `if` statement:

<!-- const caffeineLevel = 25, DRINK_COFFEE = 1, DRINK_WATER = 2 -->

```js
let drink;
if (caffeineLevel < 50) {
  drink = DRINK_COFFEE;
} else {
  drink = DRINK_WATER;
}
```

<!-- expect(drink).toBe(DRINK_COFFEE) -->

With a ternary:

<!-- const caffeineLevel = 25, DRINK_COFFEE = 1, DRINK_WATER = 2 -->

```js
const drink = caffeineLevel < 50 ? DRINK_COFFEE : DRINK_WATER;
```

<!-- expect(drink).toBe(DRINK_COFFEE) -->

But nested ternaries are different beasts: they usually make code hard to read and there’s almost always a better alternative:

<!-- const Loading = () => <p>...</p> -->

<!-- prettier-ignore -->
```jsx
function Products({products, isError, isLoading}) {
  return isError
    ? <p>Error loading products</p>
      : isLoading
        ? <Loading />
        : products.length > 0
          ? <ul>{products.map(
              product => <li key={product.id}>{product.name}</li>
            )}</ul>
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

This is a rare case when Prettier makes code completely unreadable:

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

But maybe it’s intentional, and a sign that we should rewrite it.

In this example we’re rendering one of four UI states:

- a spinner (loading);
- error message (failure);
- a list of products (success);
- a message that there are no products (also success).

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

_We’ll come back to this example later in the [Make impossible states impossible](#impossible-states) section._

---

Start thinking about:

- Removing unnecessary conditions, like conveying an already boolean value to `true` or `false` manually.
- Normalizing the input data by converting the absence of data to an array early to avoid branching and dealing with no data separately.
- Normalizing the state to avoid algorithm duplication.
- Caching repeated conditions in a variable.
- Replacing long groups of conditions with tables or maps.
