# Washing your code: write once, read seven times

## Preface

The title of this book should be “What 23 years of programming have taught me about writing good code” or “What I tell folks in code reviews trying to decipher their code” but both are too long, so “Write once, read seven times” it is. We can even shorten it to WORST, because everyone loves nonsensical acronyms.

“Write once, read seven times” is an reference to a Russian proverb “Measure seven times, cut once”. What it means is that we read code more often than we write it so we should optimize for ease of reading, not ease of writing.

This book is going to be opinionated, but you don’t have to agree with everything I’m saying, and that’s not the goal of the book. The goal is to show you one possible path, mine, and inspire you to find your own. These techniques help me to write and review code every day, and I’ll be happy if you find some of them useful. Let me know how it goes.

The book will probably be most useful for intermediate developers. If you’re a beginner, you'll likely have enough of other things to think about. If you have decades of experience, you can probably write a similar book yourself. Anyway, I’d be happy to hear your feedback.

Most of the examples in this book are in JavaScript because that’s my primary language, but the ideas can be applied to any language. Sometimes you’ll see CSS and HTML, because similar ideas can be applied there too.

Most of the examples are taken from real code, with only minor adaptation, mostly different names. I spend several hours every week reviewing code written by other developers. This gives me enough practice to see which patterns make code more readable and which don’t.

And remember, there are no strict rules in programming, except that you should always use three-space indentation in your code.

## Acknowledgments

These folks helped me with the book in one way or another.

Thanks to [Troy Giunipero](https://github.com/giuniperoo), Anita Kiss, [Monica Lent](https://monicalent.com/), [Rostislav U](https://twitter.com/inooze), [Juho Vepsäläinen](https://survivejs.com/).

## Avoid loops

Traditional loops, like `for` or `while`, are too low-level for common tasks. They are verbose and prone to [off-by-one error](https://en.wikipedia.org/wiki/Off-by-one_error). You have to manage the index variable yourself, and I always make typos with `lenght`. They don’t have any particular semantic value except that you’re doing some operation probably more than once.

### Replacing loops with array methods

Modern languages have better ways to express iterative operations. [JavaScript has may useful methods](http://exploringjs.com/impatient-js/ch_arrays.html#methods-iteration-and-transformation-.find-.map-.filter-etc) to transform and iterate over arrays, like `.map()` or `.find()`.

For example, let’s convert an array of strings to `kebab-case` with a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
for (let i = 0; i < names.length; i++) {
  names[i] = _.kebabCase(names[i]);
}
```

And now with the `.map()` method:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

We can shorten it even more if our processing function accepts only one argument, and [kebabCase from Lodash](https://lodash.com/docs#kebabCase) does:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(_.kebabCase);
```

Or let’s find an element in an array with a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
let foundName;
for (let i = 0; i < names.length; i++) {
  if (names[i].startsWith('B')) {
    foundName = names[i];
    break;
  }
}
```

And now with the `.find()` method:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const foundName = names.find(name => name.startsWith('B'));
```

In both cases I much prefer versions with array methods than with `for` loops. They are shorter and we’re not wasting half the code on iteration mechanics.

### Implied semantics of array methods

Array methods aren’t just shorter and more readable; each method has its own clear semantic:

- `.map()` says we’re transforming an array into another array with the same number of elements;
- `.find()` says we’re _finding_ a single element in an array;
- `.some()` says we’re testing that the condition is true for _some_ array elements;
- `.every()` says we’re testing that the condition is true for _every_ array element.

Traditional loops don’t help with understanding what the code is doing until you read the whole thing.

We’re separating the “what” (our data) from the “how” (how to loop over it). More than that, with array methods we only need to worry about our data, which we’re passing in as a callback function.

When you use array methods for all simple cases, traditional loops signal to the code reader that something unusual is going on. And that’s good: you can reserve brain resources for better understanding the unusual, more complex cases.

### Dealing with side effects

Side effects make code harder to understand because you can no longer treat a function as a black box: a function with side effects doesn’t just transform input to output, but can affect the environment in unpredictable ways. Functions with side effects are also hard to test because you’ll need to recreate the environment before each test and verify it after.

All array methods mentioned in the previous section, with the exception of `.forEach()`, imply that they don’t have side effects, and that only the return value is used. Introducing any side effects into these methods would make code easy to misread since readers wouldn’t expect to see side effects.

`.forEach()` doesn’t return any value, and that’s the right choice for handling side effects when you really need them:

```js
errors.forEach(error => {
  console.error(error);
});
```

But don’t use `.forEach()` when other array methods would work:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
names.forEach(name => {
  kebabNames.push(_.kebabCase(name));
});
```

This is a more cryptic and less semantic implementation of `.map()`, so better use `.map()` directly like we did above:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

This version is much easier to read because we know that the `.map()` method transforms an array by keeping the same number of items. And unlike `.forEach()`, it doesn’t require a custom implementation nor mutate an output array. Also the lifespan of the `kebabNames` variable is shorter.

### Sometimes loops aren’t so bad

Array methods aren’t always better than loops. For example, a `.reduce()` method often makes code less readable than a regular loop.

Let’s look at this code:

```js
const tableData = [];
if (props.item && props.item.details) {
  for (const client of props.item.details.clients) {
    for (const config of client.errorConfigurations) {
      tableData.push({
        errorMessage: config.error.message,
        errorLevel: config.error.level,
        usedIn: client.client.name
      });
    }
  }
}
```

My first reaction would be to rewrite it with `.reduce()` to _avoid loops_:

```js
const tableData =
  props.item &&
  props.item.details &&
  props.item.details.clients.reduce(
    (acc, client) => [
      ...acc,
      ...client.errorConfigurations.reduce(
        (inner, config) => [
          ...inner,
          {
            errorMessage: config.error.message,
            errorLevel: config.error.level,
            usedIn: client.client.name
          }
        ],
        []
      )
    ],
    []
  );
```

But is it really more readable? I don’t think so. Common sense should always win over applying “rules” everywhere (see the “Cargo cult programming” section below).

_(Though `tableData` is a really bad variable name.)_

### Iterating over objects

There are [many ways to iterate over objects](https://stackoverflow.com/a/5737136/1973105) in JavaScript. I equally dislike all of them, so it’s hard to choose the best one. Unfortunately there’s no `.map()` for objects, though Lodash does have three methods for object iteration, so it’s a good option if you're already using Lodash in your project.

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = _.mapValues(allNames, names =>
  names.map(name => _.kebabCase(name))
);
```

If you don’t need the result as an object, like in the example above, `Object.keys()`, `Object.values()` and `Object.entries()` are also good:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.keys(allNames).forEach(race => console.log(race, '->', allNames[race]));
```

Or:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.entries(allNames).forEach(([race, value]) =>
  console.log(race, '->', names)
);
```

I don’t have a strong preference between them. `Object.entries()` has more verbose syntax, but if you use the value (`names` in the example above) more than once, the code would be cleaner than `Object.keys()`, where you’d have to write `allNames[race]` every time or cache this value into a variable at the beginning of the callback function.

If I stopped here, I’d be lying to you. Most of the articles about iteration over objects have examples with `console.log()`, but in reality you’d often want to convert an object to another data structure, like in the example with `_.mapValues()` above. And that’s where things start getting uglier.

Let’s rewrite our example using `.reduce()`:

```js
const kebabNames = Object.entries(allNames).reduce(
  (newNames, [race, names]) => {
    newNames[race] = names.map(name => _.kebabCase(name));
    return newNames;
  },
  {}
);
```

With `.forEach()`:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = {};
Object.entries(allNames).forEach(([race, names]) => {
  kebabNames[race] = names.map(name => name.toLowerCase());
});
```

And with a loop:

```js
const kebabNames = {};
for (let [race, names] of Object.entries(allNames)) {
  kebabNames[race] = names.map(name => name.toLowerCase());
}
```

And again `.reduce()` is the least readable option.

In later chapters I’ll urge you to avoid not only loops but also reassigning variables and mutation. Like loops, they _often_ lead to poor code readability, but _sometimes_ they are the best choice.

### But aren’t array methods slow?

You may think that using functions is slower than loops, and likely it is. But in reality it doesn’t matter unless you’re working with millions of items.

Modern JavaScript engines are very fast and optimized for popular code patterns. Back in the day we used to write loops like this, because checking the array length on every iteration was too slow:

```js
var names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
for (var i = 0, namesLength = names.length; i < namesLength; i++) {
  names[i] = _.kebabCase(names[i]);
}
```

It’s not slow anymore. And there are other examples where engines optimize for simpler code patterns and make manual optimization unnecessary. In any case, you should measure performance to know what to optimize, and whether your changes really make code faster in all important browsers and environments.

---

Start thinking about:

- Replacing loops with array methods, like `.map()` or `.filter()`.
- Avoiding side effects in functions.

## Avoid conditions

Conditions make code harder to read and harder to test. They add nesting and make lines of code longer, so you have to split them into several lines. Each condition doubles the minimum amount of test cases you need to write for a certain module of function.

Many conditions are unnecessary or could be rewritten in a more readable way.

For example, returning booleans from functions:

```js
const hasValue = value !== NONE ? true : false;
const hasProducts = products.length > 0 ? true : false;
```

`value !== NONE` and `products.length > 0` are already a booleans, so we can use them as is, without a ternary operator:

```js
const hasValue = value !== NONE;
const hasProducts = products.length > 0;
```

And even if the condition doesn’t return a boolean:

```js
const hasValue = value ? true : false;
const hasProducts = products.length ? true : false;
```

We still can avoid a condition by explicitly converting a value to a boolean:

```js
const hasValue = !!value;
const hasProducts = products.length > 0;
```

In all cases the code without a ternary is shorter and easier to read.

Another example: it’s common to check an array length before running a loop over its items:

```js
return getProducts().then(response => {
  const products = response.products;
  if (products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
});
```

All loops and array function work fine with empty array, so we can safely remove the condition:

```js
return getProducts().then(({ products }) =>
  products.map(product => ({
    label: product.name,
    value: product.id
  }))
);
```

But sometimes the array itself is optional:

```js
return getProducts().then(response => {
  const products = response.products;
  if (products && Array.isArray(products) && products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
});
```

We can’t avoid the condition in this case but we can move it earlier and avoid a separate branch for returning an empty array.

If our data can be and array or `undefined`, we can use default value in destructuring (or a function argument):

```js
return getProducts().then(({ products = [] }) =>
  products.map(product => ({
    label: product.name,
    value: product.id
  }))
);
```

It’s more tricky if our data can be and array or `null`, like when you use GraphQL. In this case we can use the `||` operator:

```js
return getProducts().then(({ products }) =>
  (products || []).map(product => ({
    label: product.name,
    value: product.id
  }))
);
```

Condition is still here but the overall code structure is simpler.

Guard clauses or early return is a great way to avoid nested conditions, also known as the [arrow anti pattern](http://wiki.c2.com/?ArrowAntiPattern) or dangerously deep nesting. Nested conditions are often used for error handing:

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

There’s 120 lines between the first condition and it’s `else` block. And the main return value is somewhere inside three levels of conditions.

Let’s untangle this spaghetti monster:

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

This function is still long but it’s much easier to follow because of much simpler code structure.

I’m not really sure what the code inside the second condition does, but it looks like wrapping a single item in an array.

_And no, I don’t know what `tmpBottle` means, and why it was needed._

Repeated conditions can make code barely readable. Let’s have a look at this function that returns special offers for a product in our pet shops. We have two brands, Horns and Hooves and Paws and Tales, and they have different special offers. For historical reasons we store in cache differently:

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

The `isHornsAndHooves` condition is repeated three times. Two of them to create the same session key. It’s hard to see what this function is doing: business logic is intertwined with low level session management code.

Let’s try to make it simpler:

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

This is already more readable and it could be a good idea to stop here. But if I had some time I’d go further and extract cache management. Not because this function is too long or something like that, but because it distracts me from what the main purpose of the function and too low level.

```js
const getSessionKey = (key, isHornsAndHooves, sku) =>
  isHornsAndHooves ? `${key}_${sku}` : key;

const sessionGet = (key, isHornsAndHooves, sku) =>
  Session.get(getSessionKey(key, isHornsAndHooves, sku));

const sessionSet = (key, sku, isHornsAndHooves, value) =>
  Session.get(getSessionKey(key, isHornsAndHooves, sku), value);

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

It may not look much better but I think it’s a bit easier to understand what’s happening in the main function. What really annoys me here is `isHornsAndHooves`. I’d rather pass a brand name and keep all brand-specific information in tables:

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSpecialOffersForBrand = brand =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: getHornsAndHoovesSpecialOffers,
    [BRANDS.PAWS_AND_TAILS]: getPawsAndTailsSpecialOffers
  }[brand]());

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  }[brand]);

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, sku, brand, value) =>
  Session.get(getSessionKey(key, brand, sku), value);

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

Now it’s clear that the only piece of business logic here is `getSpecialOffersForBrand`, and the rest is caching. If we’re using this pattern more then once I’d extract it into its own module, similar to [memoize function](https://lodash.com/docs/#memoize) from Lodash:

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  }[brand]);

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, sku, brand, value) =>
  Session.get(getSessionKey(key, brand, sku), value);

const withSessionCache = (key, fn) => (brand, sku, ...args) => {
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
    }[brand]())
);
```

We were able to separate all low level code and hide it in another module.

It may feel like I prefer small function, or even very small function, but it’s not true. Reasons to extract code into separate functions here are different levels of abstraction and code reuse.

One of my favorite techniques of improving (read avoiding) conditions is replacing them with tables or maps. In JavaScript it’s an object.

This example may be a bit extreme, but I’ve actually written this code 19 years ago:

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

Let’s replace it with a table:

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

There’s almost no boilerplate code around the data, it’s more readable and looks like a table. Notice also that there are no brackets in the original code: in most modern style guides brackets around condition bodies are required and this snippet of could will be three times longer and less readable.

Or a bit more realistic and common example:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton => {
  switch (decisionButton) {
    case DECISION_YES:
      return (
        <FormattedMessage
          id="decisionButtonYes"
          defaultMessage="Yes"
        />
      );
    case DECISION_YES:
      return (
        <FormattedMessage id="decisionButtonNo" defaultMessage="No" />
      );
    case DECISION_MAYBE:
      return (
        <FormattedMessage
          id="decisionButtonMaybe"
          defaultMessage="Maybe"
        />
      );
  }
};

// And later it's used like this
<Button>{getButtonLabel(decision.id)}</Button>;
```

First, let’s replace it with a table:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton =>
  ({
    [DECISION_YES]: (
      <FormattedMessage id="decisionButtonYes" defaultMessage="Yes" />
    ),
    [DECISION_YES]: (
      <FormattedMessage id="decisionButtonNo" defaultMessage="No" />
    ),
    [DECISION_NOT_SURE]: (
      <FormattedMessage
        id="decisionButtonMaybe"
        defaultMessage="Maybe"
      />
    )
  }[decisionButton]);

// And later it's used like this
<Button>{getButtonLabel(decision.id)}</Button>;
```

But we can make this code more idiomatic for React by converting our `getButtonLabel` function into a React component:

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const ButtonLabel = ({ decision }) =>
  ({
    [DECISION_YES]: (
      <FormattedMessage id="decisionButtonYes" defaultMessage="Yes" />
    ),
    [DECISION_YES]: (
      <FormattedMessage id="decisionButtonNo" defaultMessage="No" />
    ),
    [DECISION_NOT_SURE]: (
      <FormattedMessage
        id="decisionButtonMaybe"
        defaultMessage="Maybe"
      />
    )
  }[decision]);

// And later it's used like this
<Button>
  <ButtonLabel decision={decision.id} />
</Button>;
```

Now both, the implementation and the usage, are simpler.

Another realistic and common example is form validation:

```jsx
function validate(values) {
  const errors = {};

  if (!values.name || (values.name && values.name.trim() === '')) {
    errors.name = (
      <FormattedMessage
        id="errorNameRequired"
        defaultMessage="Name is required"
      />
    );
  }

  if (values.name && values.name.length > 80) {
    errors.name = (
      <FormattedMessage
        id="errorMaxLength80"
        defaultMessage="Maximum 80 characters allowed"
      />
    );
  }

  if (!values.address1) {
    errors.address1 = (
      <FormattedMessage
        id="errorAddressRequired"
        defaultMessage="Address is required"
      />
    );
  }

  if (!values.email) {
    errors.mainContactEmail = (
      <FormattedMessage
        id="errorEmailRequired"
        defaultMessage="Email is required"
      />
    );
  }

  if (!values.login || (values.login && values.login.trim() === '')) {
    errors.login = (
      <FormattedMessage
        id="errorLoginRequired"
        defaultMessage="Login is required"
      />
    );
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = (
      <FormattedMessage
        id="errorLoginWithoutSpaces"
        defaultMessage="No spaces are allowed in login."
      />
    );
  }

  if (values.address1 && values.address1.length > 80) {
    errors.address1 = (
      <FormattedMessage
        id="errorMaxLength80"
        defaultMessage="Maximum 80 characters allowed"
      />
    );
  }

  // 100 lines of code

  return errors;
}
```

This function is very long, with lots and lots of repetitive boilerplate code. It’s really hard to read and maintain. Sometimes validation for the same field aren’t grouped together.

But if we look closer, there are just four three different validations:

- required field (in some cases leading and trailing whitespace is ignored, in some not — hard to tell whether it’s intentional or not);
- maximum length (always 80);
- no spaces allowed.

First, let’s extract all validation login into their own functions, so we could reuse them later:

```js
const hasStringValue = value => value && value.trim() !== '';
const hasLengthLessThanOrEqual = max => value =>
  !hasStringValue(value) || (value && value.length <= max);
const hasNoSpaces = value =>
  !hasStringValue(value) || (value && value.includes(' '));
```

I’ve assumed that different whitespace handling was a bug. I’ve also inverted all the conditions to validate the correct value, not an incorrect one, which is more readable in my opinion.

Note that `hasLengthLessThanOrEqual` and `hasNoSpaces` only check the condition if the value is present, which would allow us to make optional fields. Also note that the `hasLengthLessThanOrEqual` function is customizable: we need to use pass the maximum length: `hasLengthLessThan(80)`.

Now we can define our validations table. There are two ways of doing this:

- using an object where keys represent form fields;
- using an array.

We’re going to use the second because we want to have several validations with different error messages for some fields, for example a field can be required and have maximum length:

```jsx
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: (
      <FormattedMessage
        id="errorNameRequired"
        defaultMessage="Name is required"
      />
    )
  },
  {
    field: 'name',
    validation: hasLengthLessThanOrEqual(80),
    message: (
      <FormattedMessage
        id="errorMaxLength80"
        defaultMessage="Maximum 80 characters allowed"
      />
    )
  }
  // All other fields
];
```

Now we need to iterate over this array and run validations for all fields:

```js
function validate(values, validations) {
    return validations.reduce((errors, ({field, validation, message}) => {
        if (!validation(values[field])) {
            errors[field] = message;
        }
        return errors;
    }, {})
}
```

One more time we’ve separated “what” and “how”: we have readable and maintainable list of validations (“what”), a collection of reusable validation function and a `validate` function to validate form values (“how”) that also can be reused.

_Tip: Using a third-party library, like [Yup](https://github.com/jquense/yup) or [Joi](https://github.com/hapijs/joi) will make code even shorter and save you from writing validation functions yourself._

You may feel that I have to many similar examples in this book, and you’re right. But I think such code is so common, and readability and maintainability benefits of the refactoring are so huge, so it’s worth it. So here is one more (the last one, I promise!) example:

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

It’s just 15 lines of code, but I find this code difficult to read. I think that the `switch` and absolutely unnecessary `datePart` and `monthPart` variables clutter code so much, that it’s almost unreadable.

```js
const DATE_FORMATS = {
  [DATE_FORMAT_ISO]: `M-D`,
  [DATE_FORMAT_DE]: `D.M`,
  [DATE_FORMAT_UK]: `D/M`,
  [DATE_FORMAT_US]: `M/D`,
  _default: `M/D`
};

const getDateFormat = format => {
  return DATE_FORMATS[format] || DATE_FORMATS._default;
};
```

The improved version isn’t much shorter, but now it’s easy to see all date formats. We’ve extracted the data to a short and readable object, and separated it from the code that accesses the right piece of this data.

TODO: Nested ternaries

<!-- prettier-ignore -->
```jsx
function Products({products, isError, isLoading}) {
  return
    isError
      ? <p>Error loading producgts</p>
        : isLoading
          ? <Loading />
          : products.length > 0
            ? <ul>{products.map(
                product => <li>{product.name}</li>
            )}</ul>
            : <p>No products found</p>
}
```

TODO: This is a rare case when Prettier makes code less readable but maybe it’s a sign to rewrite it.

TODO: All the states are exclusive here, so we can cheat and use a flat structure:

TODO

_We’ll come back to this example later in the “Make impossible states impossible” section._

TODO: In case when conditions aren’t exclusive, use a function with early returns.

TODO

## Avoid reassigning variables

Reassigning variables is like changing the past. When you see:

```js
let pizza = { fillings: ['salami', 'mozzarella'] };
```

You can’t be sure that your pizza will always salami and mozzarella in it, because:

- the variable can’t be reassigned a new value, even a value of another type;
- the value, if it’s an array or an object, can be mutated.

Knowing that both things are possible make you think, every time you see `pizza` in the code, what value it has _now_. That’s a huge and unnecessary cognitive load that we can avoid.

And most of the time your can avoid both. Let’s start with reassigning and come back to mutation in the next chapter.

Sometimes a variable is used to store different values:

```js
TODO;
```

This case is the easiest to fix: we need to use separate variables for each value:

```js
TODO;
```

By doing this we’re making lifespan of each variable shorter and choosing better names, so code is easier to understand and we’ll need to read less code to understand the current (and now the only) value of a particular variable.

Probably the most common use case for reassignment is incremental computations. Consider this example:

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

I’ve shortened comments a bit, the original code had lines longer than 200 characters. If you have a very big screen, it looks like a pretty table, otherwise like an unreadable mess. Any auto formatting tool, like Prettier, will make an unreadable mess out of it to, so you shouldn’t rely on manual code formatting. It’s also really hard to maintain: if any of the “columns” become longer than all existing “columns” after your changes, you have to adjust whitespace for all other “columns”.

Anyway, this code add an error message to the `errors` variable for every failed validation. But now it’s hard to see because the formatting code is mangled with validation code. This makes it hard to read and modify. If you need to add another validation, you have to understand and copy formatting code. If you need to print errors as an HTML list, you have to change each line of this function.

Let’s separate validation and formatting:

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
  const errors = VIDEO_VALIDATIONS.map(({ isValid, message }) =>
    isValid(video) ? undefined : message
  ).filter(Boolean);
  return errors.join('\n');
};
```

We’ve separated validations, validation logic and formatting logic. The flies on the side, please. Each piece of code has a single responsibility and a single reason to change. Validations now are defined declaratively and read like a table, not mixed with conditions and string concatenation. This improves readability and maintainability of the code: it’s easy to see all validations and add new ones, because you don’t need to know implementation details of validation and formatting.

And now it’s clear that the original code had a bug: there would be no space between error messages.

And formatting (`join('\n'`) can likely be removed and done during the rendering:

```jsx
const validateVideo = video =>
  VIDEO_VALIDATIONS.map(({ isValid, message }) =>
    isValid(video) ? undefined : message
  ).filter(Boolean);

function VideoUploader() {
  const [video, setVideo] = React.useState();
  const errors = validateVideo(video);
  return (
    <div>
      {/* Uploader UI */}
      {errors.length > 0 && (
        <>
          <Text variation="error">Upload failed:</Text>
          {errors.map(error => (
            <Text variation="error">{error}</Text>
          ))}
        </>
      )}
    </div>
  );
}
```

We can also test each validation separately. Have you noticed that I’ve changed `false` to `null` in the last validation? That’s because `match()` returns `null` when there’s no match, not `false`. The original validation always returns `true`.

I’d even inline `ERROR_MESSAGES` constants unless they are reused somewhere else. They don’t really make code easier to read but they make it harder to change, because you have to do changes in two places.

```js
const VIDEO_VALIDATIONS = [
  {
    // Must provide either both a height + width, or neither
    isValid: video =>
      validateHeightWidthConsistency(video.videoFiles),
    message:
      'You should provide either both a height and a width, or neither'
  }
  // …
];
```

Now it’s easy to add, remove or change validations: all the related code is contained in the `VIDEO_VALIDATIONS` array. Keep the code, that’s likely to be changed at the same time, in the same place.

Some people like to define all variables at the beginning of a function. I call this _Pascal style_, because in Pascal you have to declare all variables at the beginning of a program or a function:

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

```js
let isFreeDelivery;
let deliveryMethod;

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

Long variable lifespan makes you scroll a lot to understand what’s the current value of a variable. Possible reassignments make it even worse. If it’s 50 lines between a variable declaration and it’s usage, then it can be reassigned in any of these 50 lines.

We can make code easier to read by moving variable declarations as close to their usage as possible and by avoiding reassignments:

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

We’ve shortened `isFreeDelivery` variable lifespan from 100 lines to just 10. Now it’s also clear that its value is the one we assign at the fist line.

When variable is used to keep a function result, often you can get rid of that variable:

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

Becomes:

```js
function areEventsValid(events) {
  return events.every(event => event.fromDate <= event.toDate);
}
```

We’ve removed a temporary variable, avoided reassignment and made a condition positive (is something valid?), instead of a negative (is something invalid?). Positive conditions are usually easier to understand.

For local variables you can either use a ternary operator:

```js
TODO;
```

Or you can extract code to a function:

```js
let rejectionReason = getAllRejectionReasons();
if (isAdminUser) {
  rejectionReason = rejectionReason.filter(
    reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
  );
}
```

Like this:

```js
const getRejectionReasons = isAdminUser => {
  const rejectionReasons = getAllRejectionReasons();
  if (isAdminUser) {
    return rejectionReason.filter(
      reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
    );
  }
  return rejectionReasons;
};

// --- 8< -- 8< ---

const rejectionReason = getRejectionReasons(isAdminUser);
```

This is less important you may argue that moving code to a new function just because of reassignment isn’t a great idea, and you may be right, so use your own judgement here.

In all examples above I’m replacing `let` with `const`. This immediately tells the reader that the variable won’t be reassigned. And you can be sure, it won’t: the compiler won’t allow that. And every time you see `let` in the code, you know that this code is more complex.

Another useful convention is using `UPPER_CASE` names for constants. This tells the reader that this is more of a configuration value, than a result of some computation. Lifespan of such constants are usually large: often the whole module or even the whole codebase, so when you read the code you usually don’t see the constant definition.

There’s an important difference between a variable defined with the `const` keyword and a true constant. The first only tells the compiler and the reader that the variable won’t be reassigned. The second describe the nature of the value as something global and static that never changes at runtime.

Both conventions reduce cognitive load a little bit and make code a bit easier to read.

TODO: Function arguments shadowing

## Avoid mutation

TODO: immutability

TODO: array operations: mutating and not mutating

TODO: ES6: spread, rest, etc.

TODO: Redux immutable operation docs: https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns

TODO: Immutability != reassignment, `conts`

TODO: Tools to ensure immutability: libraries, linters, types

Replacing imperative code, full or loops and conditions, with declarative code is one of my favorite refactorings. And one of the most common suggestions I give in code reviews.

Consider this code:

```jsx
const generateOptionalRows = () => {
  const rows = [];

  if (product1.colors.length + product2.colors.length > 0) {
    rows.push({
      row: (
        <FormattedMessage
          id="optionsTableRowColors"
          defaultMessage="Colors"
        />
      ),
      product1: <ProductOptions options={product1.colors} />,
      product2: <ProductOptions options={product2.colors} />
    });
  }

  if (product1.sizes.length + product2.sizes.length > 0) {
    rows.push({
      row: (
        <FormattedMessage
          id="optionsTableRowSizes"
          defaultMessage="Sizes"
        />
      ),
      product1: <ProductOptions options={product1.sizes} />,
      product2: <ProductOptions options={product2.sizes} />
    });
  }

  return rows;
};

const rows = [
  {
    row: (
      <FormattedMessage
        id="optionsTableRowName"
        defaultMessage="Name"
      />
    ),
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  ...generateOptionalRows()
];
```

We have two ways of defining table rows: a plain array with always visible rows, which is good, and a function, full of imperative logic, that returns optional rows.

Array mutation (see `rows.push` in the function) isn’t the biggest issue here, but it’s often a sign that the code has imperative logic that can be replaced with declarative code with better readability and maintainability.

Let’s merge all _possible_ rows into a single declarative array:

```jsx
const rows = [
  {
    row: (
      <FormattedMessage
        id="optionsTableRowName"
        defaultMessage="Name"
      />
    ),
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  {
    row: (
      <FormattedMessage
        id="optionsTableRowColors"
        defaultMessage="Colors"
      />
    ),
    product1: <ProductOptions options={product1.colors} />,
    product2: <ProductOptions options={product2.colors} />,
    isVisible: (product1, product2) =>
      (product1.colors.length > 0 || product2.colors.length) > 0
  },
  {
    row: (
      <FormattedMessage
        id="optionsTableRowSizes"
        defaultMessage="Sizes"
      />
    ),
    product1: <ProductOptions options={product1.sizes} />,
    product2: <ProductOptions options={product2.sizes} />,
    isVisible: (product1, product2) =>
      (product1.sizes.length > 0 || product2.sizes.length) > 0
  }
];

const visibleRows = rows.filter(row => {
  if (typeof row.isVisible === 'function') {
    return row.isVisible(product1, product2);
  }
  return true;
});
```

Now we’re defining all rows in a single array. All rows are visible by default, unless they have `isVisible` function that returns true, when a row is visible. We’ve improved code readability and maintainability: now there’s only one way of defining rows, you don’t have to check two places to see all available row, don’t need to decide which method to use to add a new row, and now it’s easy to make an existing row optional by adding `isVisible` function to it.

## Avoid comments

Comments are often used to explain poorly written code. People think that their code isn’t clear enough, so they add comments to explain it. And they are usually right: the code isn’t clear. But instead of adding comments, they should rewrite code to make it simpler and more readable.

There’s a popular technique of avoiding comment: if you want to explain a block of code, move this code to it’s own function instead. For example:

```js
TODO;
```

Can be rewritten as:

```js
TODO;
```

And while it make a lot of sense to extract complex calculations and conditions, used inside an already long line of code:

```js
// TODO: this example is from reafactoring course
if (($platform->toUpperCase()->indexOf("MAC") > -1) &&
     ($browser->toUpperCase()->indexOf("IE") > -1) &&
      $this->wasInitialized() && $this->resize > 0)
{
  // do something
}
// ->
$isMacOs = $platform->toUpperCase()->indexOf("MAC") > -1;
$isIE = $browser->toUpperCase()->indexOf("IE")  > -1;
$wasResized = $this->resize > 0;

if ($isMacOs && $isIE && $this->wasInitialized() && $wasResized) {
  // do something
}
// ->
// use functions instead of variables
```

I don’t think that splitting a linear algorithm, even if it’s long, into several functions and then calling them one after another, necessarily make code more readable. Jumping between functions is harder than scrolling, and if you have to look into functions implementations to understand the code, then the abstraction wasn’t a right one.

Comments are useful to answer _why_ code is written in a certain way. If it’s fixing a bug, a ticket number will be useful. If there’s an obvious simpler alternative solution, a comment should explain why this solution doesn’t work in this case. Such comments will save you from accidental “refactoring” that makes code easier but removes some necessary functionality.

High level comments, explaining how code works, are useful too. If you’re implementing an algorithm, explained somewhere else, link to that place.

And any hack should be explained in a `HACK` or `FIXME` comment.

`TODO` comments are _okay_ too, if you add a ticket number when something will be done. Otherwise they are just dreams, than likely will never come true.

But there are several kinds of comments that you should never write.

First are comments explaining _how_ code works:

```js
// This will make sure that your code runs
// in the strict mode in the browser
'use strict';
```

```js
// Fade timeout = 2 seconds
const FADE_TIMEOUT_MS = 2000;
```

If you think someone on your team may not know some of the language features you’re using, it’s better to help them to learn these features then clutter the code with comments that will distract everyone else.

Next are _fake_ comments: they pretend to explain a some decision, but actually they don’t explain anything.

```js
// Design decision
// This is for biz requirements
// Non-standard background color needed for design
// Designer's choice
// Using non-standard color to match design
```

I see a lot of them in one-off design _changes?_. For example, a comment will say that there was a _design requirement_ to use a non-standard color but it won’t explain why it was required and why none of the standard color worked in that case.

```scss
.shareButton {
  color: #bada55; // Using non-standard color to match design
}
```

_Requirement_ is a very tricky and dangerous word. Often what’s treated as a requirement is just a lack of education and collaboration between developers, designers and project managers. If you don’t know why something is required, ask, and you may be surprised by the answer.

There may be no _requirement_ at all and you can use a standard color:

```scss
.shareButton {
  color: $text-color--link;
}
```

Or there may be a real reason to use a non-standard color, that you may put into a comment:

```scss
$color--facebook: #3b5998; // Facebook brand color
.shareButton {
  color: $color--facebook;
}
```

In any case it’s your responsibility to ask _why_ as many times as necessary.

## Simplify, simplify, simplify

- Avoid verbose and unnecessary code

```js
data.discontinued ? data.discontinued === 1 : false;
```

```js
if (
  reasonType === REASON_TYPES.REPLACEMENT &&
  conditionCheck === REASON_TYPES.RETURN
) {
  return true;
} else {
  return false;
}
```

```js
if (itemInfo && itemInfo.isAutoReplaceable === true) {
  return true;
}

return false;
```

## Naming is hard

TODO: The smaller the scope of a variable the better

TODO: The bigger the scope of a variable the longer should be the name (with a very small scope the name is a bit less important because the code is short and easy to understand)

TODO: Use destructuring to avoid inventing a new variable name: function parameters, result of function call

TODO: Shorten variable life by grouping code that’s using this variable together

TODO: data, list, util, etc. in names

TODO: positive names: ‘hasProducts’ vs ‘hasNoProducts’

TODO: Don’t go too far with naming conventions — Hungarian notation

TODO: Avoid abbreviations: accepted in smaller scope when the bigger scope has a full name: it’s okay to use `op` inside `filterPurchageOrders` function

TODO: Avoid slang or words that have simpler alternative, non-native English speakers will thank you. https://github.com/facebook/react/issues/3951

```js
const noData = data.length === 0;
$(`#${bookID}_download`).toggleClass('hidden-node', noData);
$(`#${bookID}_retry`).attr('disabled', !noData);
```

Types (like Flow or TypeScript) helps to see when names don’t represent the data correctly:

```js
type Order = {
  id: number,
  title: string
};

type State = {
  filteredOrder: Order[],
  selectedOrder: number[]
};
```

Looking at the types it’s clear that both names should be plural (they keep arrays) and the second one only contains order IDs but not whole order objects:

```js
type State = {
  filteredOrders: Order[],
  selectedOrderIds: number[]
};
```

TODO: `util` and `utils` (what about them?): keep each function in it’s own file

> Aside: Make a util directory and keep different utilities in different files. A single util file will always grow until it is too big and yet too hard to split apart. Using a single util file is unhygienic.

## Don’t surprise me

TODO: Principle of least surprise. Think what kind of comments your code reviewer might have. Improve code or add comments

Surprising behavior:

- Incorrect semantic: `.map()` with side effects
- Mutating function arguments
- Function that’s doing more than the name says (or not doing what the name says)

Surprising behavior:

```js
someFunction({ foo, bar, baz });
function doMischief(props) {
  // 100 lines of code
  props.bar.push('pizza');
  // 100 lines of code
}
```

## Separate “what” and “how”

Declarative code describes the result and imperative explains how to achieve it.

TODO: Example

Declarative is often easier to read and there are many examples of refactoring imperative code to more declarative in this book.

I refer to this process as separating “what” and “how”. The benefits are:

- improved readability and maintainability;
- we change “what” much more often than “how”;
- often “how” is generic and can be reused, or even imported from a third-party library.

For example, a form validation (see “Avoid conditions” for the code) could be split into:

- a list of validations for a particular form;
- a collection of validation functions (like `isEmail`);
- a function that validates form values using a list of validations.

TODO: The last two things are pretty generic.

## Don’t waste energy (= save energy for important things)

TODO

…on things that don’t matter:

```js
import React, {Component} from 'react';
class PizzaMaker extends Component
// vs
import React from 'react';
class PizzaMaker extends React.Component {
```

- tabs vs spaces
- opinionated formatting (https://blog.sapegin.me/all/prettier/)
- implicit returns
- arrow functions

In all these examples I prefer the second variation. But I don’t waste time asking folks to change their code in code reviews, when they use the first variation or some other way of writing the same code.

In most cases there’s zero code readability improvement. The code is just different, none of the variations are better then the other. And even the consistency argument isn’t good enough, unless you can automate code replacement completely transparent for the developer. Otherwise the cost of maintaining the convention is too high.

## Cargo cult programming

https://en.wikipedia.org/wiki/Cargo_cult_programming

- Don’t be religious / cargo cult programming
- Understand why (no cargo cult programming)
- Puristic theory vs. reality
- Code isn’t black and white: there’s no thinks that are always bad (except global variables) or always good (except automation)

* never write functions longer than 5 lines
* don’t repeat yourself
* always use container/ presenter pattern — never put UX state and HTML in one component
* Always use `===` (`!= null`).

Using constants instead of magic numbers is a great practice: it gives them a meaningful name. I also like to include a unit in a name to make it even more clear:

```js
const FADE_TIMEOUT_MS = 2000;
```

But sometimes people replace absolutely all literal values with constants:

```js
const TABLE_COLUMN_OPTIONS_WIDTH = 300;
const columns = [
  {
    minWidth: TABLE_COLUMN_OPTIONS_WIDTH,
    header() {
      return 'Options';
    },
    accessor: 'options'
  }
  // …
];
```

It makes code longer and introduces an unnecessary indirection. It doesn’t make code more readable: the name doesn’t tell us anything that’s not already in the code. And have you noticed that the name is not precise? Instead of minimum width it only has width.

## Don’t be clever

Clever code is a kind of code you may see in job interview questions or language quizzes. When they expect you to know how language feature, you maybe have never seen before, work. My answer to these questions is “won’t pass code review”.

```js
percentOff.toString().concat('%')
// ->
return ${percentOff}%;
```

TODO: `~` instead of `-1`

TODO: `if ((dogs.length + cats.length) > 0)`

## Wait with abstractions (let abstractions grow)

TODO: https://kentcdodds.com/blog/moist-programming

TODO: Avoid premature abstractions. Let abstraction grow (???) — feel the pain first, wrong abstraction is worse than copy paste.

TODO: Write code that is easy to delete

TODO: It’s hard to come up with a good API. It’s hard to come up with a good generic API if you only consider a single use case.

TODO: Sometimes you have to roll back an abstraction. When you start adding conditions and options (?), ask yourself: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and options to make your code flexible can make the API hard to use.

We, developers, hate to do the same work twice. _Don’t repeat yourself_ (DRY) is our mantra. But when you have two or three similar pieces of code, it may be still to early to introduce an abstraction, no matter how tempting it is.

Leave with the pain of code duplication, maybe it’s no so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows you to iterate and evolve code faster.

It’s hard to manage shared code in large projects with many teams. New requirements for one team may not work for another team and break their code, or you end up with unmaintainable spaghetti monster with dozens of conditions.

Imagine your team is adding a comment form: a name, and email, a message and a submit button. Then another team needs a feedback form, so they find your component and try to reuse it. Then your team also wants an email field, but they don’t know that some other team uses the component, so they add a required email field, and break the feature for the other team users. Then the other teams needs a phone number field, but they know that your team is using the component without it, so they add an option to show a phone number field. A year later two teams hate each other for breaking their code, and a component is full of conditions and impossible to maintain. Both teams would save a lot of time and have healthier relationships by maintaining separate components.

I think the higher level of the code, the longer you should wait with abstracting it. Low level utility abstractions are much more obvious than business logic.

Also business logic is changing much more often than utility code. It make sense to keep code, that often changes, separately from the code that is mostly static. The comment form is an example of the former, a function that converts `camelCase` to `kebab-case` is an example of the latter. The comment form is likely to change and diverge with time, the conversion function is unlikely to change at all and it’s safe to reuse in many places.

Balance between flexibility and consistency. It’s nice to have a global Button component but if it’s too flexible and you have 10 variations, it will be hard to choose the right one. If it’s too strict, developers will create their own buttons

> we’re trying keep the parts that change frequently, away from the parts that are relatively static. Minimising the dependencies or responsibilities of library code, even if we have to write boilerplate to use it.

> We are not building modules around being able to re-use them, but being able to change them.

```js
// my_feature_util.js
const noop = () => {};
// ...
export const Utility = {
  noop
  // ...
};

// MyComponent.js
// ...
MyComponent.defaultProps = {
  onClick: Utility.noop()
};
```

Wrong abstraction, incorrect name:

```js
function filterEmptyString(dep) {
  return Boolean(dep.trim());
}
generate(
  req ? req.split(',').filter(filterEmptyString) : [],
  dep,
  base,
  fn
);
```

## SOLID principles

TODO: SRP

TODO: Hide complexity

TODO: To DRY or to DUMP (DUMP for tests)

## Don’t make me think

TODO: Pass an object instead of multiple positional arguments to a function (more than two)

TODO: Magic numbers -> consts

TODO: Consts should include units

> Long Parameter List More than three or four parameters for a method.

## Too many conventions

Conventions are great, because they make code more consistent and reduce cognitive load when you read code. But the more conventions you have, the harder it is to maintain them.

Ask yourself, where a particular convention really make code more readable or reduce number of bugs. If yes, automate it. If you can’t automate, ask yourself again: will cost of maintaining a convention lower than benefits of having it.

Code reviewers will have to remember all the conventions, and make sure developers follow them in their code. This will distract them from finding actually important issues in the code.

## Make impossible states impossible

In UI programming, or _especially_ in UI programming we often use boolean flags to represent the current state of the UI or its parts: is data loading? is submit button disabled? has action failed?

Often the reality is more complex and has more than two states, so we end up with multiple booleans. Consider this typical network loading handling in a React component:

```jsx
function Tweets = () {
  const [isLoading, setLoading] = useState(false);
}
```

We have XX booleans here: …. If we look closer how the code uses them, we’ll notice that only one boolean is `true` at any time in a component lifecycle. It’s hard to see now and it’s easy to make a mistake and correctly handle all possible state changes, so you component may end up in an _impossible state_, like `isLoading && isError`, and the only way to fix that would be reloading the page. This is exactly the reason why switching off and on electronic devices often fixes weird issues.

We can replace several _exclusive_ boolean flags, meaning only one is active at a time, with a single enum variable:

```jsx
function Tweets = () {
  const [isLoading, setLoading] = useState(false);
}
```

TODO: Find example (tweets?)

TODO: types

TODO: Finite-state machines Replace multiple exclusive booleans with a single status variable

TODO: isLoading/isError component

TODO: <Button primary secondary>

## (Boy) scout rule

The (boy) scout rule states that you should live the campground cleaner than you found it. For example, if someone else’s left garbage, you should take it with your.

Same in programming. For example, you’re done with your task, you’re running linter before committing your changes, and you realize that there are some warnings but not in the lines you’ve written or even have changed. If it’s not a lot of work and won’t make the diff too big, fix them.

TODO: Postpone and plan big improvements

The opposite or the boy scout rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving lint warning unfixed, leaving debug code or commented out code, general unfinishedness or untidiness of code. This creates an environment when nobody cares, because one new lint warning won’t make code with 100 warnings significantly worse, but code with zero warning will.

## Greppable code

- don’t concatenate identifiers

## Size isn’t important

- Short functions are overrated
- Long functions and long files isn’t a problem
- In UI state or custom styles are great reasons to create new components

> Generally, any method longer than ten lines should make you start asking questions.

Often big functions and big modules have other problems, but just size is never an issue. There are many valid cases when you’d want to extract a piece of code into its own function, like code reuse state isolation, separation of data from an algorithm, separation of concerns, different levels of abstraction, reducing number of local variables, and so on.

Opposite is often true: if several functions or modules are often changed together, merge them into one function or module. For example, markup and styles of an HTML component are often changed together and keeping them in separate files is inconvenient. CSS in JS where both, styles and markup, are in the same file is a great solution for this problem. It clearly doesn’t make modules smaller.

TODO: Example of styled-components

TODO: Splitting tax: passing bunch of parameters and objects between functions.

TODO: Props drilling in React?

## Don’t try to predict the future

Requirements are constantly changing, the business is constantly trying to make more money. Sometimes by improving user experience and making the app better, sometimes by exploiting _human psychology?_ and making app worse. In both cases we need to change the code. People have invented agile software development to deal with that: it’s better to develop software in small iterations than to spend month on writing detailed specs and then implementing them.

But developers often try to think too far in the future: “_they_ will want to add pagination to product list, let’s add support now to save time later.” But then _they_ want infinite scrolling and you end up removing most of your pagination code.

It’s called Premature abstraction or premature generalisation (speculative generality?). It feels like you’re saving time for future self by making your code more generic, but that’s what will often prevent you from implementing real future requirements easily. You end up writing and maintaining code that will never be used or code that you’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. It will be easier to review and test now, and to adapt to new requirements in the future.

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make UI easy to change and move around.

TODO: YAGNI and KISS

## Refactoring is inevitable

- Don’t be attached to your code
- Don’t rewrite everything (unless you have good tests)
- Second system syndrome (?)
- Write code that is easy to delete
- Disposable software
- Required refactoring before doing a task and general refactoring unrelated to any particular task

Bigger refactoring projects may be hard to sell to your boss. Look for signs: too many bugs in some part of code, growing code spagettiness because of many changes in the same place. These are the places worth improving.

Try to avoid rewriting everything at once.

## Not invented here syndrome

- Know when to use third party code
- Lodash
- Micromodules

## Code is evil

The goal of programmer’s work isn’t writing code but solving your client’s problems, whether it’s your employer or yourself. Code is by-product, a necessary evil.

The less code we write, the better. Less code means easier testing, easier maintenance, faster app, less bytes to download… A perfect solution doesn’t include any new code or even removes some existing code. Perfect is the enemy of good and we’ll have to write some code — they wouldn’t have called us programmers otherwise — but we should try to write as little code as possible, and don’t consider writing code as a goal in itself.

## Resources

### Books

- [The Art of Readable Code](https://www.amazon.com/gp/product/0596802293/?tag=artesapesphot-20) by Dustin Boswell
- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882/?tag=artesapesphot-20) by Robert C. Martin
- [Code Complete: A Practical Handbook of Software Construction](https://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670/?tag=artesapesphot-20) by Steve McConnell

### Articles

TODO: There should be some good one in the great blog posts note

- [The Pit of Conditionals](https://medium.com/@level_out/everything-is-a-component-cf9f469ad981)
- [Psychology of Code Readability – Egon Elbre – Medium](https://medium.com/@egonelbre/psychology-of-code-readability-d23b1ff1258a)
- [Learning Code Readability – Egon Elbre – Medium](https://medium.com/@egonelbre/learning-code-readability-a80e311d3a20)
- https://testing.googleblog.com/2017/06/code-health-reduce-nesting-reduce.html?m=1
- https://testing.googleblog.com/2017/07/code-health-to-comment-or-not-to-comment.html?m=1
- [The “Bug-O” Notation — Overreacted](https://overreacted.io/the-bug-o-notation/)
- [On the changing notion of code readability](http://firstclassthoughts.co.uk/Articles/Readability/TheChangingNotionOfReadability.html)
- [Small Functions considered Harmful – Cindy Sridharan – Medium](https://medium.com/@copyconstruct/small-functions-considered-harmful-91035d316c29)
- [Why the Boy Scout Rule Is Insufficient](https://www.codewithjason.com/boy-scout-rule-insufficient/)
- [Write code that is easy to delete, not easy to extend](https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to)
- [AHA programming](https://kentcdodds.com/blog/aha-programming)

### Talks

- [Building resilient frontend architecture](https://www.youtube.com/watch?v=brMZLmZ1HR0) by Monica Lent, React Finland 2019
- [Beyond PEP 8: Best practices for beautiful intelligible code](https://www.youtube.com/watch?v=wf-BqAjZb8M) by Raymond Hettinger, PyCon 2015

## Conclusion

All topics, covered in this book, aren’t hard rules but ideas for possible improvements. When I say _avoid conditions, mutation, reassignments or something else_, I don’t mean _never use them_, more like _are you sure there’s no better solution?_

There are valid use cases for all programming techniques, maybe even `goto`, who knows. The only certain thing is that the answer to any programming related question is _it depends_. No matter how many upvotes on StackOverflow has a solution, it may be not the best choice for your case.

So the goal of this book isn’t to teach you how to write good code, but to teach you to notice certain patterns, or code smells, that can _often_ (not _always_) be improved.

Treating such patterns or code smells as hard rules is the road to hell.

TODO: checklist
