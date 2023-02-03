### Avoid loops

Traditional loops, like `for` or `while`, are too low-level for common tasks. They are verbose and prone to [off-by-one errors](https://en.wikipedia.org/wiki/Off-by-one_error). You have to manage the index variable yourself, and I always make typos with `lenght`. They don’t have any particular semantic value beyond telling you that some operation is probably repeated.

#### Replacing loops with array methods

Modern languages have better ways to express iterative operations, and [JavaScript has many useful methods](http://exploringjs.com/impatient-js/ch_arrays.html#methods-iteration-and-transformation-.find-.map-.filter-etc) to transform and iterate over arrays, like `.map()` or `.find()`.

For example, let’s convert an array of strings to `kebab-case` with a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
for (let i = 0; i < names.length; i++) {
  kebabNames.push(_.kebabCase(names[i]));
}
```

And with the `.map()` method instead of a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

We can shorten it even more if our callback function accepts only one parameter: the value. Take [kebabCase from Lodash](https://lodash.com/docs#kebabCase) for example:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(_.kebabCase);
```

This wouldn’t work with functions that accept more than one parameter because `.map()` also passes an array index as the second parameter and a whole array as the third. Using `parseInt()`, a function that accepts the radix as its second parameter, would likely lead to unexpected results:

```js
const inputs = ['1', '2', '3'];
inputs.map(parseInt); // -> [1, NaN, NaN]
inputs.map(value => parseInt(value)); // -> [1, 2, 3]
```

Here in the first example, `.map()` calls `parseInt()` with an array index as a radix, which gives an incorrect result. In the second example, we’re explicitly passing only the value to the `parseInt()`, so it uses the default radix of 10.

But this may be a bit less readable than the expanded version because we don’t see what exactly we’re passing to a function. ECMAScript 6’s arrow functions made callbacks shorter and less cluttered compared to the old anonymous function syntax:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(function (name) {
  return _.kebabCase(name);
});
```

Now, let’s find an element in an array with a `for` loop:

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

In both cases, I much prefer array methods when compared to `for` loops. They are shorter, and we’re not bloating the code with iteration mechanics.

#### Implied semantics of array methods

Array methods aren’t just shorter and more readable; each method has its own clear semantic:

- `.map()` says we’re transforming an array into another array with the same number of elements;
- `.find()` says we’re _finding_ a single element in an array;
- `.some()` says we’re testing that the condition is true for _some_ elements of the array;
- `.every()` says we’re testing that the condition is true for _every_ element of the array.

Traditional loops don’t help with understanding what the code is doing until you read the whole thing.

We’re separating the “what” (our data) from the “how” (how to loop over it). More than that, with array methods we only need to worry about our data, which we’re passing in as a callback function.

When all simple cases are covered by array methods, every time you see a traditional loop, you know that something unusual is going on. And that’s good: less chances you’ll miss a bug during code review.

Also, don’t use generic array methods like `.map()` or `.forEach()` when more specialized array methods would work and don’t use `.forEach()` instead of `.map()` to transform an array.

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
names.forEach(name => {
  kebabNames.push(_.kebabCase(name));
});
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

This is a more cryptic and less semantic implementation of `.map()`, so better use `.map()` directly like we did above:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

This version is much easier to read because we know that the `.map()` method transforms an array by keeping the same number of items. And, unlike `.forEach()`, it doesn’t require a custom implementation or mutate an output array. In addition, the callback function is now pure: it merely transforms input parameters to the output value without any side effects.

We run into similar problems when we abuse array method semantics:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
let isExpectedType = false;
products.map(product => {
  isExpectedType = product.type === expectedType;
});
```

Here, the `.map()` method is used to _reduce_ an array to a single value by having a side effect instead of returning a new item value from the callback function.

It’s hard to say what this code is doing, and it feels like there’s a bug: it only cares about the last product in a list.

If it’s indeed a bug, and the intention was to check if _some_ of the products have the expected type, then the `.some()` array method would be the best choice:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType = products.some(
  product => product.type === expectedType
);
```

If the behavior of the original code was correct, then we actually don’t need to iterate at all. We can check the latest array item directly:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType =
  products[products.length - 1].type === expectedType;
```

Both refactored versions make the intention of the code clearer and leave fewer doubts that the code is correct. We can probably make the `isExpectedType` variable name more explicit, especially in the second refactoring.

#### Dealing with side effects

Side effects make code harder to understand because you can no longer treat a function as a black box: a function with side effects doesn’t just transform input to output but can affect the environment in unpredictable ways. Functions with side effects are also hard to test because you’ll need to recreate the environment before each test is run and verify it after.

All array methods mentioned in the previous section, except `.forEach()`, imply that they don’t have side effects and that only the return value is used. Introducing any side effects into these methods would make code easy to misread since readers won’t be expecting side effects.

`.forEach()` doesn’t return any value, and that’s the right choice for handling side effects when you really need them:

<!--
const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
const errors = ['dope', 'nope']
-->

```js
errors.forEach(error => {
  console.error(error);
});
```

<!--
expect(console.error.mock.calls).toEqual([['dope'], ['nope']])
spy.mockRestore()
-->

A `for of` loop is even better:

- it doesn’t have any of the problems of regular `for` loops, mentioned in the beginning of this chapter;
- we can avoid reassignments and mutations since we don’t have a return value;
- it has clear semantics of iteration over all array elements since we can’t manipulate the number of iterations, like in a regular `for` loop. (Well, almost, we can abort the loops with `break`.)

Let’s rewrite our example using a `for of` loop:

<!--
const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
const errors = ['dope', 'nope']
-->

```js
for (const error of errors) {
  console.error(error);
}
```

<!--
expect(console.error.mock.calls).toEqual([['dope'], ['nope']])
spy.mockRestore()
-->

#### Sometimes loops aren’t so bad

Array methods aren’t always better than loops. For example, the `.reduce()` method often makes code less readable than a regular loop.

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

My first reaction would be to rewrite it with `.reduce()` to _avoid loops_:

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
const tableData =
  props.item &&
  props.item.details &&
  props.item.details.clients.reduce(
    (acc, client) =>
      acc.concat(
        ...client.errorConfigurations.map(config => ({
          errorMessage: config.error.message,
          errorLevel: config.error.level,
          usedIn: client.name
        }))
      ),
    []
  );
```

<!-- expect(tableData).toEqual([{ errorLevel: 2, errorMessage: 'nope', usedIn: 'Pizza' }]) -->

If I was to review such code, I would be happy to pass both versions but would prefer the original with double `for` loops. _(Though `tableData` is a really bad variable name.)_

#### Iterating over objects

There are [many ways to iterate over objects](https://stackoverflow.com/a/5737136/1973105) in JavaScript. I equally dislike them all, so it’s hard to choose the best one. Unfortunately, there’s no `.map()` for objects, though Lodash does have three methods for object iteration, so it’s a good option if you’re already using Lodash in your project.

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = _.mapValues(allNames, names =>
  names.map(name => _.kebabCase(name))
);
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

If you don’t need the result as an object, like in the example above, `Object.keys()`, `Object.values()` and `Object.entries()` are also good:

<!-- const spy = jest.spyOn(console, 'log').mockImplementation(() => {}) -->

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.keys(allNames).forEach(race =>
  console.log(race, '->', allNames[race])
);
```

<!--
expect(console.log.mock.calls).toEqual([['hobbits', '->', ['Bilbo', 'Frodo']], ['dwarfs', '->', ['Fili', 'Kili']]])
spy.mockRestore()
-->

Or:

<!-- const spy = jest.spyOn(console, 'log').mockImplementation(() => {}) -->

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.entries(allNames).forEach(([race, value]) =>
  console.log(race, '->', value)
);
```

<!--
expect(console.log.mock.calls).toEqual([['hobbits', '->', ['Bilbo', 'Frodo']], ['dwarfs', '->', ['Fili', 'Kili']]])
spy.mockRestore()
-->

I don’t have a strong preference between them. `Object.entries()` has more verbose syntax, but if you use the value (`names` in the example above) more than once, the code would be cleaner than `Object.keys()`, where you’d have to write `allNames[race]` every time or cache this value into a variable at the beginning of the callback function.

If I stopped here, I’d be lying to you. Most of the articles about iteration over objects have examples with `console.log()`, but in reality you’d often want to convert an object to another data structure, like in the example with `_.mapValues()` above. And that’s where things start getting uglier.

Let’s rewrite our example using `.reduce()`:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = Object.entries(allNames).reduce(
  (newNames, [race, names]) => {
    newNames[race] = names.map(name => _.kebabCase(name));
    return newNames;
  },
  {}
);
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

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

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

And with a loop:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = {};
for (let [race, names] of Object.entries(allNames)) {
  kebabNames[race] = names.map(name => name.toLowerCase());
}
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

And again `.reduce()` is the least readable option.

In later chapters I’ll urge you to avoid not only loops but also reassigning variables and mutation. Like loops, they _often_ lead to poor code readability, but _sometimes_ they are the best choice.

#### But aren’t array methods slow?

You may think that using functions is slower than loops, and likely it is. But in reality it doesn’t matter unless you’re working with millions of items.

Modern JavaScript engines are very fast and optimized for popular code patterns. Back in the day, we used to write loops like this because checking the array length on every iteration was too slow:

```js
var names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
for (var i = 0, namesLength = names.length; i < namesLength; i++) {
  names[i] = _.kebabCase(names[i]);
}
```

It’s not slow anymore, though, and there are other examples where engines optimize for simpler code patterns and make manual optimization unnecessary.

Also, `.every()`, `.some()`, `.find()` and `.findIndex()` will short circuit, meaning they won’t iterate over more array elements than necessary.

In any case, you should measure performance to know what to optimize and see whether your changes really make code faster in all important browsers and environments.

---

Start thinking about:

- Replacing loops with array methods, like `.map()` or `.filter()`.
- Avoiding side effects in functions.
