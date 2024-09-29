{#no-loops}

# Avoid loops

<!-- description: Iterating over collections and why traditional loops, such as `for` or `while`, may not be the best way of doing that -->

Traditional loops, such as `for` or `while`, are too low-level for everyday tasks:

- they are verbose;
- they are prone to off-by-one errors;
- we have to manage the index variable ourselves;
- we need to name the index variable, which often leads to confusion or bugs in nested loops;
- they don’t convey any semantics beyond telling us that some operation is probably repeated.

And on top of that, I always spell `length` as <!-- cspell:disable -->`lenght`<!-- cspell:enable -->.

This is how a typical `for` loop looks like:

<!-- let console = { log: vi.fn() } -->

<!-- eslint-disable unicorn/no-for-loop -->

```js
const array = ['eins', 'zwei', 'drei'];
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}
```

<!-- expect(console.log.mock.calls).toEqual([['eins'], ['zwei'], ['drei']]) -->

Most programmers learned to recognize `i = 0; i < array.length; i++` as a pattern: iteration over each element of a given array. It looks almost the same in most programming languages created since the middle of the 20th century. The tradition of using `i`, `j`, and `k` as loop index variables is about as old.

This structure allows us to change the way we iterate over elements: for example, iterating elements from last to first, skipping every second element, and so on. However, with such power comes the risk of making mistakes. For example, all these loops look almost identical, but only the first one is correct:

<!-- let array = [] -->

```js
// WARNING: Only the first line is correct
for (let i = 0; i < array.length; i++) {}
for (let i = 1; i < array.length; i++) {}
for (let i = 0; i <= array.length; i++) {}
for (let i = 0; i < array.length; ++i) {}
```

<!-- // Testing this would make the example much more verbose -->

Such errors are called [off-by-one errors](https://en.wikipedia.org/wiki/Off-by-one_error) because we’re either missing one array element or trying to access an element that’s just outside the array bounds.

It gets worse when we nest loops:

<!--
let proxy = 'SOCKS5 127.0.0.1:1080'
let rules = [
  [
    [
      "pizza.com",
      "tacos.com",
      "coffee.com",
    ],
    [
      "soup.com",
      "hotdog.com",
      "burger.com",
    ]
  ]
]
let lastRule = ''
-->

```js
function testHost(host, index) {
  for (var i = 0; i < rules[index].length; i++) {
    for (var j = 0; j < rules[index][i].length; j++) {
      lastRule = rules[index][i][j];
      if (host == lastRule || host.endsWith('.' + lastRule))
        return i % 2 == 0 ? 'DIRECT' : proxy;
    }
  }
  lastRule = '';
}
```

<!--
expect(testHost('pizza.com', 0)).toBe('DIRECT')
expect(testHost('tacos.com', 0)).toBe('DIRECT')
expect(testHost('hotdog.com', 0)).toBe(proxy)
expect(testHost('burger.com', 0)).toBe(proxy)
-->

Code like this makes me suspicious: it looks like it does something very simple, but at the same time it’s super complex. What am I missing? We’ll come back to this example later in the chapter.

Each nested loop increases the probability of a mistake and decreases code readability. Additionally, nested loops can have performance implications. It’s best to avoid them whenever possible.

In this chapter, we’ll talk about modern ways of writing loops and when a more traditional approach is still better.

{#array-methods}

## Replacing loops with array methods

Modern languages have better ways to express iteration, and [JavaScript has many useful methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#iterative_methods) to transform or iterate over arrays, like `map()`, or `find()`.

For example, let’s convert an array of strings to kebab-case using a `for` loop:

<!-- eslint-disable unicorn/no-for-loop -->

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabCharacters = [];
for (let i = 0; i < characters.length; i++) {
  kebabCharacters.push(_.kebabCase(characters[i]));
}
// → ['bilbo-baggins', 'gandalf', 'gollum']
```

<!-- expect(kebabCharacters).toEqual(["bilbo-baggins", "gandalf", "gollum"]) -->

I> The [`kebabCase()` method](https://lodash.com/docs#kebabCase) is from the Lodash library. We’ll use Lodash methods occasionally in this book, and we’ll always use the `_` namespace.

I> The _kebab-case_ is a popular naming convention where lowercase words are separated with a dash, for example, `chuck-norris`, or `bilbo-baggins`. It’s called kebab-case because it looks like several kebabs on a skewer. Other common conventions include _camelCase_, _PascalCase_, _snake_case_, and _SCREAMING_SNAKE_CASE_. I spell each name using the convention itself to make remembering them easier.

Now, let’s use the `map()` array method instead of a `for` loop:

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabCharacters = characters.map(function (name) {
  return _.kebabCase(name);
});
// → ['bilbo-baggins', 'gandalf', 'gollum']
```

<!-- expect(kebabCharacters).toEqual(["bilbo-baggins", "gandalf", "gollum"]) -->

This code is less verbose and easier to follow because half of the original code was managing the index variable, which obscured the actual task of the loop.

Thanks to _arrow functions_, which are shorter and less cluttered then the old anonymous functions, we can simplify the code even further:

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabCharacters = characters.map(name =>
  _.kebabCase(name)
);
// → ['bilbo-baggins', 'gandalf', 'gollum']
```

<!-- expect(kebabCharacters).toEqual(["bilbo-baggins", "gandalf", "gollum"]) -->

We may want to shorten the code even more by passing the callback function to the `map()` method directly. However, this has several issues.

First, this only works with functions that accept a single parameter because the `map()` method also passes an element’s index as the second parameter and the entire array as the third. For example, using the [`Number.parseInt()` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt), which accepts a radix as its second parameter, would lead to unexpected results:

<!-- eslint-disable unicorn/no-array-callback-reference -->

```js
const inputs = ['1', '2', '3'];

// WARNING: This code is incorrect
const integers_ = inputs.map(Number.parseInt);
// → [1, NaN, NaN]

// Correct, only passing values
const integers = inputs.map(value => Number.parseInt(value));
// → [1, 2, 3]
```

<!--
expect(integers_).toEqual([1, NaN, NaN])
expect(integers).toEqual([1, 2, 3])
-->

In the first example, the `map()` method calls the `parseInt()` function with an element’s index as a radix, resulting in an incorrect result. In the second example, we explicitly pass only the value to the `parseInt()` function, so it uses the default radix of 10.

Second, it may mysteriously break when the callback function adds another parameter. Even TypeScript will miss this issue if the types of the new parameters match those expected by the `map()` method.

Lastly, explicitly passing the value inside the `map()` callback function makes the code slightly more readable.

T> The [unicorn/no-array-callback-reference](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-callback-reference.md) linter rule prevents passing the callback function directly to array methods.

Let’s look at another example: finding an element in an array. First, using a `for` loop:

<!-- eslint-disable unicorn/no-for-loop -->

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
let foundName;
for (let i = 0; i < characters.length; i++) {
  if (characters[i].startsWith('B')) {
    foundName = characters[i];
    break;
  }
}
// → 'Bilbo Baggins'
```

<!-- expect(foundName).toEqual('Bilbo Baggins') -->

Now, with the `find()` method:

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const foundName = characters.find(name =>
  name.startsWith('B')
);
// → 'Bilbo Baggins'
```

<!-- expect(foundName).toEqual('Bilbo Baggins') -->

In both examples, I much prefer array methods compared to `for` loops because they are shorter and don’t bloat the code with iteration mechanics.

Here’s an improved version of the nested loop example from this chapter’s introduction:

<!--
let proxy = 'SOCKS5 127.0.0.1:1080'
let rules = [
  [
    [
      "pizza.com",
      "tacos.com",
      "coffee.com",
    ],
    [
      "soup.com",
      "hotdog.com",
      "burger.com",
    ]
  ]
]
-->

```js
function testHost(host, index) {
  const checkHost = x => host === x || host.endsWith(`.${x}`);

  const directHost = rules[index][0].find(x => checkHost(x));
  if (directHost) {
    return 'DIRECT';
  }

  const proxyHost = rules[index][1].find(x => checkHost(x));
  if (proxyHost) {
    return proxy;
  }
}
```

<!--
expect(testHost('pizza.com', 0)).toBe('DIRECT')
expect(testHost('tacos.com', 0)).toBe('DIRECT')
expect(testHost('hotdog.com', 0)).toBe(proxy)
expect(testHost('burger.com', 0)).toBe(proxy)
-->

We don’t even need to nest loops here, but the data structure used to store rules makes it confusing. The nested arrays always have two items, so an object with two properties would be more appropriate here.

Let’s have a look at another example of a nested loop:

<!-- eslint-skip -->

```js
function hasDiscount(customers) {
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
}
```

<!--
expect(hasDiscount({gandalf: {}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}]}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}, {customerCards: ['DISCOUNT']}]}})).toBe(true)
expect(hasDiscount({gandalf: {ages: [{customerCards: ['DISCOUNT']}]}})).toBe(true)
-->

This code is checking whether any customer has a customer card (and therefore a discount) in any age group, but by reading the code, it’s totally impossible to understand what’s going on. Nested loops with meaningless names are one of the main reasons for this.

I> We talk about naming in the [Naming is hard](#naming) chapter.

Let’s simplify it:

```js
function hasDiscount(customers) {
  return Object.values(customers).some(customer => {
    return customer.ages?.some(
      ageGroup => ageGroup.customerCards.length > 0
    );
  });
}
```

<!--
expect(hasDiscount({gandalf: {}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}]}})).toBe(false)
expect(hasDiscount({gandalf: {ages: [{customerCards: []}, {customerCards: ['DISCOUNT']}]}})).toBe(true)
expect(hasDiscount({gandalf: {ages: [{customerCards: ['DISCOUNT']}]}})).toBe(true)
-->

Not only the refactored code is three times shorter, but it’s also much clearer: are there any (some) customers with at least one customer card in any (some) age group?

## Implied semantics of array methods

Array methods aren’t just shorter and more readable; each method has its own clear semantics:

- `find()` says we’re _finding_ a single element in an array;
- `filter()` says we’re _filtering_ array elements;
- `map()` says we’re _mapping_ an array to a new array with the same number of elements and transforming each array element;
- `flatMap()` says we’re _mapping_ an array to a new array and then _flattening_ any nested arrays;
- `forEach()` says we’re doing something _for each_ array element;
- `every()` says we’re testing that the condition is true for _every_ element of the array;
- `some()` says we’re testing that the condition is true for _some_ elements of the array;
- `reduce()` says… well, I don’t know what it says, we’ll talk about it later.

Traditional loops don’t help us understand what the code is doing until we read the whole thing.

When using array methods, we’re separating the “what” (our data) from the “how” (how to loop over it and what to do on each iteration), and the “how to loop over” isn’t obscuring “what to do on each iteration”. In traditional loops, everything is mixed together, and we need to spend extra time writing and reading loop mechanics, which are abstracted away by array methods with meaningful names.

I> We talk about the separation of “what” and “how” in the [Separate “what” and “how”](#what-how) section of the _Divide and conquer, or merge and relax_ chapter.

When all simple cases are covered by array methods, every time we see a traditional loop, we know that something unusual is going on. And that’s good: fewer chances we’ll miss a bug during code review because we can be extra vigilant every time we see a traditional loop.

Also, don’t use generic array methods like `map()` or `forEach()` when more specialized array methods would work, and don’t use `forEach()` instead of `map()` to transform an array. Both would confuse the reader by doing something unexpected.

<!-- eslint-disable unicorn/no-array-for-each -->

```js
const characters = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabCharacters = [];
characters.forEach(name => {
  kebabCharacters.push(_.kebabCase(name));
});
// → ['bilbo-baggins', 'gandalf', 'gollum']
```

<!-- expect(kebabCharacters).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

This code is a more cryptic and less semantic implementation of the `map()` method, so better use the `map()` directly as we did before. The version with the `map()` method is much easier to read because we know that the `map()` method transforms an array into a new array with the same number of elements. And, unlike `forEach()`, it doesn’t require us to manage the output array ourselves. Also, the callback function is now pure: it merely transforms input parameters to the output value without any side effects.

Avoid abusing the semantics of array methods:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

<!-- eslint-skip -->

```js
// WARNING: This code is wrong
let isExpectedType = false;
products.map(product => {
  isExpectedType = product.type === expectedType;
});
```

<!-- expect(isExpectedType).toEqual(false) -->

In the code above, we use the `map()` method to _reduce_ an array to a single value by having a side effect instead of returning a new element’s value from the callback function.

It’s hard to say what this code is doing, and it feels like there’s a bug: it only cares about the last product in a list.

If it’s indeed a bug, and the intention was to check if _some_ products have the expected type, then the `some()` array method would be the best choice:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType = products.some(
  product => product.type === expectedType
);
```

<!-- expect(isExpectedType).toEqual(true) -->

If the behavior of the original code is correct, then we don’t need to iterate at all. We can check the last array element directly:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType = products.at(-1).type === expectedType;
```

<!-- expect(isExpectedType).toEqual(false) -->

Both refactored versions make the code’s intention clearer and leave fewer doubts about its correctness. We can probably make the `isExpectedType` variable name more explicit, especially in the second refactoring.

{#array-chaining}

## Chaining multiple operations

The `reduce()` array method is one of the most controversial. Some programmers use it for almost everything, while others avoid it like a plague. Its main use case is _reducing_ (meaning, converting) an array to a single value.

Calculating the sum of all array elements is one of the most common use cases for the `reduce()` method:

```js
const array = [1, 2, 3, 4];
const sum = array.reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0
);
// → 10
```

<!-- expect(sum).toBe(10) -->

In the code above, we pass a callback function (called _a reducer_) to the `reduce()` method, which adds the current element to the accumulator. The accumulator eventually contains the sum of all the array elements. The second argument is the initial value (`0` in this example).

I’ve seen programmers try to squeeze everything into a single `reduce()` method to avoid extra iterations. Consider this example, that calculates the total price of all items in a shopping cart:

<!-- eslint-disable unicorn/prevent-abbreviations -->

```js
const cart = [
  { price: 25, quantity: 1 },
  { price: 11, quantity: 3 }
];
const totalPrice = cart.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);
// → 58
```

<!-- expect(totalPrice).toBe(58) -->

This code is okay, but I’d split it into two steps: calculating a sum for the desired quantity of each item, and then calculating a sum of all items:

```js
const cart = [
  { price: 25, quantity: 1 },
  { price: 11, quantity: 3 }
];
const totalPrice = cart
  .map(item => item.price * item.quantity)
  .reduce((accumulator, value) => accumulator + value);
// → 58
```

<!-- expect(totalPrice).toBe(58) -->

Now, the purpose of each step is clearer. The sum calculation is easier to recognize here than in the original code.

T> I often see something that I call _the reduce rabbit hole_ during interviews and code reviews: a developer starts writing code with the `reduce()` method, and then digs a deep complexity pit by adding more and more things to the `reduce()`, instead of stopping and rewriting it to something simpler. TkDodo has [a great article](https://tkdodo.eu/blog/why-i-dont-like-reduce) on the pitfalls of `reduce()`.

## Dealing with side effects

Side effects make code harder to understand because we can no longer treat a function as a black box:

- they don’t just transform input into output, but can affect the environment in unpredictable ways;
- they are hard to test because we need to recreate the environment before we run each test, verify the changes in the environment made by the function, and then reset it to its original state before running other tests.

Array methods mentioned in the previous section imply that they don’t have side effects and instead return a new value. Introducing any side effects into these methods makes the code confusing, since readers don’t expect side effects.

The only exception is the `forEach()` method, that doesn’t return any value, and it’s the right choice for handling side effects when we really need them:

<!--
const console = { error: vi.fn() }
const errors = ['dope', 'nope']
-->

<!-- eslint-disable unicorn/no-array-for-each -->

```js
errors.forEach(error => {
  console.error(error);
});
```

<!-- expect(console.error.mock.calls).toEqual([['dope'], ['nope']]) -->

A `for…of` loop would be even better:

- it doesn’t have any of the problems of regular `for` loops mentioned at the beginning of this chapter;
- it has clear semantics of iteration over all array elements since we can’t manipulate the number of iterations, like in a regular `for` loop (we can abort the loop with a `break`, though);
- the syntax is a bit cleaner because we don’t need to create a callback function.

T> The `for…of` loop was introduced in ECMAScript 2015, and is now my favorite way of array iteration. It completely replaced the `forEach()` method for me.

Let’s rewrite our example using a `for…of` loop:

<!--
const console = { error: vi.fn() }
const errors = ['dope', 'nope']
-->

```js
for (const error of errors) {
  console.error(error);
}
```

<!-- expect(console.error.mock.calls).toEqual([['dope'], ['nope']]) -->

The main benefits of `for…of` loops over the `forEach()` method are:

- better readability and less noise;
- ability to exit early using `break` or `return`;
- correct type narrowing in TypeScript (which doesn’t work properly when using a callback function in `forEach()`).

T> The [unicorn/no-array-for-each](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-for-each.md) and [unicorn/no-for-loop](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-for-loop.md) linter rules automatically replace `forEach()` methods and `for` loops with `for…of` loops.

## Iterating over objects

There are [many ways to iterate over object keys or values](https://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object/5737136#5737136) in JavaScript:

<!-- let console = { log: vi.fn() } -->

<!-- eslint-disable unicorn/no-array-for-each -->

```js
const characters = {
  hobbits: ['Bilbo Baggins'],
  dwarfs: ['Fili', 'Kili']
};

// Using for…in loop
for (const race in characters) {
  // Iterate only over own object properties (skip properties
  // on the prototype chain)
  if (
    Object.prototype.hasOwnProperty.call(characters, race)
  ) {
    console.log(race, characters[race]);
  }
}

// Using Object.keys() and forEach() methods
Object.keys(characters).forEach(race => {
  console.log(race, characters[race]);
});

// Using Object.keys() method and for…of loop
for (const race of Object.keys(characters)) {
  console.log(race, characters[race]);
}

// Using Object.entries() and forEach() methods
Object.entries(characters).forEach(([race, names]) =>
  console.log(race, names)
);

// Using Object.entries() method and for…of loop
for (const [race, names] of Object.entries(characters)) {
  console.log(race, names);
}
```

<!--
expect(console.log.mock.calls).toEqual([
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
])
-->

I equally dislike them all, so it’s hard to choose the best one, or at least the least ugly one. Probably, the last one is a bit cleaner than the rest.

Unfortunately, there’s no `map()` method for objects, and the `for…of` loops don’t work with objects directly. To use them, we need to convert an object to an array first.

Lodash has several methods for object iteration. For example, we can use [the `forEach()` method](https://lodash.com/docs#forEach):

<!-- let console = { log: vi.fn() } -->

<!-- eslint-disable unicorn/no-array-for-each -->

```js
const characters = {
  hobbits: ['Bilbo Baggins'],
  dwarfs: ['Fili', 'Kili']
};
_.forEach(characters, (names, race) => {
  console.log(race, names);
});
```

<!--
expect(console.log.mock.calls).toEqual([
  ['hobbits', ['Bilbo Baggins']], ['dwarfs', ['Fili', 'Kili']],
])
-->

In later chapters, I’ll urge you to avoid not only loops, but also reassigning variables and mutation. Like loops, they _often_ lead to poor code readability, but _sometimes_ they are the best choice.

Of all the examples above, I prefer the one with the `Object.entries()` method and `for…of` loop. It’s slightly simpler than other options, but not significantly so. I’d avoid the one with the `for…in` loop, though, because of the extra condition it requires.

It’s all good if we’re iterating over an object for a side effect, like in the examples above. Things get more complicated and ugly when we need the result as an object:

```js
const characters = {
  hobbits: ['Bilbo Baggins'],
  dwarfs: ['Fili', 'Kili']
};
const kebabCharacters = {};
for (const [race, names] of Object.entries(characters)) {
  kebabCharacters[race] = names.map(name =>
    _.kebabCase(name)
  );
}
// → { hobbits: ['bilbo-baggins'], dwarfs: ['fili', 'kili'] }
```

<!-- expect(kebabCharacters).toEqual({ hobbits: ['bilbo-baggins'], dwarfs: ['fili', 'kili'] }) -->

We can also use Lodash here. For example, we can use [the `mapValues()` method](https://lodash.com/docs#mapValues):

```js
const characters = {
  hobbits: ['Bilbo Baggins'],
  dwarfs: ['Fili', 'Kili']
};
const kebabCharacters = _.mapValues(characters, names =>
  names.map(name => _.kebabCase(name))
);
// → { hobbits: ['bilbo-baggins'], dwarfs: ['fili', 'kili'] }
```

<!--
expect(kebabCharacters).toEqual({
  hobbits: ['bilbo-baggins'],
  dwarfs: ['fili', 'kili']
})
-->

It’s a bit cleaner than the plain JavaScript version, and has a clear semantics: we want to iterate over object values, but keep the object keys and shape as is. If we already have Lodash on a project, it’s a good option.

## Sometimes loops aren’t so bad

Array methods aren’t always better than loops. For example, the `reduce()` method often makes code less readable than a regular loop, as we’ve seen already.

Let’s look at this code:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData = [];
if (props.item && props.item.details) {
  for (const client of props.item.details.clients) {
    for (const config of client.errorConfigurations) {
      tableData.push({
        errorMessage: config.error.message,
        errorLevel: config.error.level,
        usedIn: client.name
      });
    }
  }
}
```

<!-- expect(tableData).toEqual([{ errorLevel: 2, errorMessage: 'nope', usedIn: 'Pizza' }]) -->

This code prepares the data for a table of error messages. Let’s try to rewrite it using the `reduce()` method to _avoid loops_:

<!-- eslint-disable unicorn/prevent-abbreviations -->

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData = props.item?.details?.clients.reduce(
  (accumulator, client) => [
    ...accumulator,
    ...client.errorConfigurations.reduce(
      (inner, config) => [
        ...inner,
        {
          errorMessage: config.error.message,
          errorLevel: config.error.level,
          usedIn: client.name
        }
      ],
      []
    )
  ],
  []
);
```

<!-- expect(tableData).toEqual([{ errorLevel: 2, errorMessage: 'nope', usedIn: 'Pizza' }]) -->

But is it really more readable?

After a cup of coffee and a chat with a colleague, I’ve ended up with a much cleaner approach:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData = props.item?.details?.clients.reduce(
  (accumulator, client) => [
    ...accumulator,
    ...client.errorConfigurations.map(config => ({
      errorMessage: config.error.message,
      errorLevel: config.error.level,
      usedIn: client.name
    }))
  ],
  []
);
```

<!-- expect(tableData).toEqual([{ errorLevel: 2, errorMessage: 'nope', usedIn: 'Pizza' }]) -->

We can also try to chain `flatMap()` and `map()` methods:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData = props.item?.details?.clients.flatMap(
  client =>
    client.errorConfigurations.map(config => ({
      errorMessage: config.error.message,
      errorLevel: config.error.level,
      usedIn: client.name
    }))
);
```

<!-- expect(tableData).toEqual([{ errorLevel: 2, errorMessage: 'nope', usedIn: 'Pizza' }]) -->

This code is good, and though, it’s more in the spirit of this book, the original version, with the `for…of` loop, is still more readable: it’s less abstract, making it a bit easier to understand what’s going on there.

I’d be happy to accept either the original, with the `for…of` loop, or the last one, with the `flatMap()` and `map()` chain, during a code review. No `reduce()` for me, thank you!

_Though, `tableData` is a terrible variable name._

I> We talk about naming in the [Naming is hard](#naming) chapter.

## But aren’t array methods slow?

One might think that functions are slower than loops, and often they are. However, this generally does not matter unless we’re working with millions of elements.

Modern JavaScript engines are very fast and optimized for popular code patterns. Back in the day, we used to write loops like this because checking the array length on every iteration was too slow:

<!-- eslint-disable unicorn/prevent-abbreviations -->

```js
var names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
var kebabCharacters = [];
for (var i = 0, len = names.length; i < len; i++) {
  kebabCharacters[i] = _.kebabCase(names[i]);
}
// → ['bilbo-baggins', 'gandalf', 'gollum']
```

<!-- expect(kebabCharacters).toEqual(["bilbo-baggins", "gandalf", "gollum"]) -->

It’s not slow anymore. Often, simpler code patterns are the fastest, or fast enough, so manual optimization is unnecessary.

Also, the `every()`, `some()`, `find()`, and `findIndex()` methods are short-circuiting, meaning they don’t iterate over unnecessary array elements.

In any case, we should measure performance to know what to optimize and verify whether our changes really make the code faster in all important browsers and environments. Web performance is a topic large enough for its own book (and there are books on the subject), but it’s outside the scope of this book.

---

Traditional loops aren’t bad as such. Programmers have been using them successfully for decades, and in some cases traditional loops are still the best choice. However, modern programming languages have better, more declarative alternatives to loops that are more readable and less error-prone. The implied semantics of array methods make code intentions clearer, while traditional loops are more flexible.

In the end, it’s often a good idea to write the same code using both and choose the more readable option.

Start thinking about:

- Replacing loops with array methods, like `map()`, or `filter()`.
- Avoiding the `reduce()` array method in favor of `for…of` loop.
- Chaining several array methods to make each step simpler and clearer.
- Avoiding side effects in functions.
