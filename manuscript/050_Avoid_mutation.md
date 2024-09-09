{#no-mutation}

# Avoid mutation

<!-- description: Why mutation is hindering code readability and what can we do about it -->

Mutation happens when we change a JavaScript object or array without creating a new object or array and assigning it to a new or existing variable:

```js
const puppy = {
  name: 'Dessi',
  breed: 'Dachshund',
  age: 13
};
puppy.age = 14;
// → { name: 'Dessi', breed: 'Dachshund', age: 14 }
```

<!-- expect(puppy).toEqual(expect.objectContaining({age: 14})) -->

Here, we’re _mutating_ the original `puppy` object by changing its `age` property.

Some problems with mutation:

- Mutation may lead to unexpected and hard-to-debug issues where data becomes incorrect somewhere, and we have no idea where it happens.
- Mutation makes code harder to understand: at any time, an array, or an object may have a different value, so we need to be very vigilant when reading the code.
- Mutation of function parameters makes the behavior of a function surprising and creates unexpected side effects.
- Mutation is often unexpected. It’s too easy to forget which methods mutate the original data, and which don’t. Both could return the same value, and there’s no naming convention in JavaScript to differentiate them.

_Immutability_, or _immutable data structures_, means that to change a value, we have to create a new array or object. This approach would solve this problem.. Unfortunately, JavaScript doesn’t support immutability natively, and all solutions are more like code crutches than actual solutions. However, even just _avoiding_ mutation in our code makes it easier to understand.

T> Don’t forget that even if we can’t reassign variables defined with the `const` keyword, we can still mutate them.

I> We talked about reassignments in the previous chapter, [Avoid reassigning variables](#no-reassigning).

## Avoid mutating operations

One of the most common use cases for mutation is updating objects:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

<!-- eslint-disable unicorn/prevent-abbreviations, unicorn/prefer-optional-catch-binding, unicorn/catch-error-name -->

```js
function parseExample(content, lang, modifiers) {
  const example = {
    content,
    lang
  };

  if (modifiers) {
    if (hasStringModifiers(modifiers)) {
      example.settings = modifiers
        .split(' ')
        .reduce((obj, modifier) => {
          obj[modifier] = true;
          return obj;
        }, {});
    } else {
      try {
        example.settings = JSON.parse(modifiers);
      } catch (err) {
        return {
          error: 'Cannot parse modifiers'
        };
      }
    }
  }

  return example;
}
```

<!--
expect(parseExample('pizza', 'js')).toEqual({content: 'pizza', lang: 'js'})
expect(parseExample('pizza', 'js', '{"foo": true}')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true}})
expect(parseExample('pizza', 'js', 'foo bar')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true, bar: true}})
-->

Here, we’re creating an object with three fields, one of which, `settings`, is optional. We’re doing this by mutating the initial `example` object in the two cases when it should have this optional field.

I prefer to see the whole object shape in a single place, instead of having to read the whole function to find all possible object shape variations. Usually, it doesn’t matter whether a property has an `undefined` value or doesn’t exist at all. I haven’t seen any cases where it mattered for a good reason. Even better is to use an empty array or object instead of `undefined` because it often simplifies the code and reduces the number of conditions.

I> We talk about avoiding conditions in the [Avoid conditions](#no-conditions) chapter.

We also have a special error case here that returns an entirely different object with a single `error` property. However, it’s really a special case because none of the properties of the two objects overlap, and it doesn’t make sense to merge them. If anything, separating these two objects highlights that the error case is a special case.

I like to use ternaries for simple cases and usually extract the code into a function for more complex cases. Here, we have a good example for the latter because of a nested condition and a `try`/`catch` block.

Let’s try to refactor it:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

```js
function getSettings(modifiers) {
  if (modifiers === undefined) {
    // No modifiers
    return {};
  }

  if (hasStringModifiers(modifiers)) {
    // Parse string modifiers:
    // `foo bar` → { foo: true, bar: true }
    return modifiers
      .split(' ')
      .reduce((accumulator, modifier) => {
        accumulator[modifier] = true;
        return accumulator;
      }, {});
  }

  try {
    // Assume that modifiers are in a JSON string:
    // `{"foo": true, "bar": true}` → { foo: true, bar: true }
    return JSON.parse(modifiers);
  } catch {
    // Return `undefined` as an error
  }
}

function parseExample(content, lang, modifiers) {
  const settings = getSettings(modifiers);
  if (settings === undefined) {
    return {
      error: 'Cannot parse modifiers'
    };
  }

  return {
    content,
    lang,
    settings
  };
}
```

<!--
expect(parseExample('pizza', 'js')).toEqual({content: 'pizza', lang: 'js', settings: {}})
expect(parseExample('pizza', 'js', '{"foo": true}')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true}})
expect(parseExample('pizza', 'js', 'foo bar')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true, bar: true}})
-->

Now, it’s easier to understand what the code does, and the possible shapes of the return objects are clear. Additionally, we removed the mutation and reduced nesting a little.

{#no-mutating-methods}

## Beware of the mutating array methods

Not all methods in JavaScript return a new array or object. Some methods mutate the original value in place.

For example, the `push()` method is one of the most commonly used:

<!-- const console = { log: vi.fn() } -->

```js
const dogs = ['dachshund', 'sheltie'];
const sameDogs = dogs;
dogs.push('schnoodle');
console.log(dogs);
// → dachshund, sheltie, schnoodle
console.log(sameDogs);
// → dachshund, sheltie, schnoodle
```

<!--
expect(console.log.mock.calls).toEqual([
  [['dachshund', 'sheltie', 'schnoodle']],
  [['dachshund', 'sheltie', 'schnoodle']],
])
-->

Here, we’re adding a new element to the `dogs` array using the `push()` method, which mutates the original array. That’s why both `console.log()` calls print the same list: both variables, `dogs` and `sameDogs`, reference the same array.

I> Use [Does it mutate](https://doesitmutate.xyz/) to quickly check whether an array method is mutating or not.

Consider this function:

<!-- const console = { log: vi.fn() } -->

```js
function printLastElement(array) {
  const lastElement = array.pop();
  console.log(lastElement);
}
```

<!--
let numbers = [3, 1, 2];
printLastElement(numbers)
expect(console.log.mock.calls).toEqual([[2]])
expect(numbers).toEqual([3, 1])
-->

The problem here is that the `pop()` array method mutates the array we’re passing into our function:

<!--
const console = { log: vi.fn() }
function printLastElement(array) {
  const lastElement = array.pop();
  console.log(lastElement);
}
-->

```js
const dogs = ['sheltie', 'schnoodle', 'dachshund'];
printLastElement(dogs);
// -> dachshund
console.log(dogs);
// -> sheltie, schnoodle
```

<!--
expect(console.log.mock.calls).toEqual([
  ['dachshund'],
  [['sheltie', 'schnoodle']],
])
-->

Note that the original `dogs` array is now missing an element. This is likely not what we expect when calling a function named `printLastElement()`. That’s the danger of accidental mutation.

I> When a function changes something outside its scope, this is called a _side effect_. Accidental side effects, like in the `printLastElement()` function, can lead to extremely hard-to-trace issues.

We can fix this issue by accessing the last array element without mutating the original array:

<!-- const console = { log: vi.fn() } -->

```js
function printLastElement(array) {
  const lastElement = array.at(-1);
  console.log(lastElement);
}
```

<!--
let numbers = [3, 1, 2];
printLastElement(numbers)
expect(console.log.mock.calls).toEqual([[2]])
expect(numbers).toEqual([3, 1, 2])
-->

Here’s a more subtle but more realistic example of the same problem:

<!-- const Select = ({items}) => items.join('|') -->

```jsx
export const ALL_MEAL_TYPES = [
  'Breakfast',
  'Second Breakfast',
  'Elevenses',
  'Luncheon',
  'Afternoon Tea',
  'Dinner',
  'Supper'
];

const MealTypeSelect = ({
  selectedMealType,
  allowedMealTypes = [],
  onChange
}) => {
  const sortedMealTypes = allowedMealTypes.sort(
    (a, b) =>
      ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
  );

  return (
    <Select
      value={selectedMealType}
      items={sortedMealTypes}
      onChange={onChange}
    />
  );
};
```

<!--
const items = ['Dinner', 'Luncheon'];
const {container: c1} = RTL.render(<MealTypeSelect selectedMealType="Luncheon" allowedMealTypes={items} />);
expect(c1.textContent).toEqual('Luncheon|Dinner')
expect(items).toEqual(['Luncheon','Dinner'])
-->

It’s clear that the author of this code didn’t expect the `sort()` method to mutate the original array and accidentally introduced a mutation of a function parameter.

We can fix this by using the _spread syntax_, like so:

<!-- const Select = ({items}) => items.join('|') -->

```jsx
export const ALL_MEAL_TYPES = [
  'Breakfast',
  'Second Breakfast',
  'Elevenses',
  'Luncheon',
  'Afternoon Tea',
  'Dinner',
  'Supper'
];

const MealTypeSelect = ({
  selectedMealType,
  allowedMealTypes = [],
  onChange
}) => {
  const sortedMealTypes = [...allowedMealTypes].sort(
    (a, b) =>
      ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
  );

  return (
    <Select
      value={selectedMealType}
      items={sortedMealTypes}
      onChange={onChange}
    />
  );
};
```

<!--
const items = ['Dinner', 'Luncheon'];
const {container: c1} = RTL.render(<MealTypeSelect selectedMealType="Luncheon" allowedMealTypes={items} />);
expect(c1.textContent).toEqual('Luncheon|Dinner')
expect(items).toEqual(['Dinner', 'Luncheon'])
-->

Here, we create a copy of the incoming array before sorting it, so the original array never changes.

It’s even better to use the new `toSorted()` array method that doesn’t mutate the original array:

<!-- const Select = ({items}) => items.join('|') -->

```jsx
export const ALL_MEAL_TYPES = [
  'Breakfast',
  'Second Breakfast',
  'Elevenses',
  'Luncheon',
  'Afternoon Tea',
  'Dinner',
  'Supper'
];

const MealTypeSelect = ({
  selectedMealType,
  allowedMealTypes = [],
  onChange
}) => {
  const sortedMealTypes = allowedMealTypes.toSorted(
    (a, b) =>
      ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
  );

  return (
    <Select
      value={selectedMealType}
      items={sortedMealTypes}
      onChange={onChange}
    />
  );
};
```

<!--
const items = ['Dinner', 'Luncheon'];
const {container: c1} = RTL.render(<MealTypeSelect selectedMealType="Luncheon" allowedMealTypes={items} />);
expect(c1.textContent).toEqual('Luncheon|Dinner')
expect(items).toEqual(['Dinner', 'Luncheon'])
-->

I> The `toSorted()` method is included in ECMAScript 2023 and supported by all major browsers, as well as Node.js 20.

Other mutating array methods to watch out for include:

- [copyWithin()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
- [fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [pop()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [reverse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [shift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [splice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [unshift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)

I> Thanks to the [Change Array by copy](https://github.com/tc39/proposal-change-array-by-copy) proposal, JavaScript now has immutable alternatives to several of the methods mentioned above: `toReversed()`, `toSorted()`, `toSpliced()`, and `with()`. The proposal is included in ECMAScript 2023.

{#no-params-mutation}

## Avoid mutation of function parameters

As we saw in the previous section, objects, or arrays passed to a function can be mutated inside that function, affecting the original object.

Function parameter mutation can be intentional or accidental, and both are problematic:

- It’s harder to understand how a function works and how to use it because it doesn’t return a value but changes one of the incoming parameters.
- Accidental parameter mutation is even worse because function consumers don’t expect it. And it can lead to hard-to-find bugs when a value that is mutated inside a function is later used outside this function.

The examples in the previous section were of accidental mutation. Now, let’s talk about intentional mutation.

Consider this example:

```js
const addIfGreaterThanZero = (list, count, message) => {
  if (count > 0) {
    list.push({
      id: message,
      count
    });
  }
};

const getMessageProps = (
  adults,
  children,
  infants,
  youths,
  seniors
) => {
  const messageProps = [];
  addIfGreaterThanZero(messageProps, adults, 'ADULTS');
  addIfGreaterThanZero(messageProps, children, 'CHILDREN');
  addIfGreaterThanZero(messageProps, infants, 'INFANTS');
  addIfGreaterThanZero(messageProps, youths, 'YOUTHS');
  addIfGreaterThanZero(messageProps, seniors, 'SENIORS');
  return messageProps;
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

This code converts a bunch of number variables to a `messageProps` array that groups people of different ages by their counts:

```js
const messageProps = [
  {
    id: 'ADULTS',
    count: 7
  },
  {
    id: 'SENIORS',
    count: 2
  }
];
```

The problem with this code is that the `addIfGreaterThanZero()` function mutates the array we’re passing to it instead of returning any value. This is not the best API for what this function does.

We can change this function to return a new array instead:

```js
const addIfGreaterThanZero = (list, count, message) => {
  if (count > 0) {
    return [
      ...list,
      {
        id: message,
        count
      }
    ];
  }
  return list;
};
```

<!--
let array = [{count: 1, id: 'ADULTS'}]
array = addIfGreaterThanZero(array, 0, 'CHILDREN')
array = addIfGreaterThanZero(array, 2, 'YOUTHS')
expect(array).toEqual([{count: 1, id: 'ADULTS'}, {count: 2, id: 'YOUTHS'}])
-->

However, I don’t think we need this function at all:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (
  adults,
  children,
  infants,
  youths,
  seniors
) => {
  return [adults, children, infants, youths, seniors]
    .map((count, index) => ({
      id: MESSAGE_IDS[index],
      count
    }))
    .filter(({ count }) => count > 0);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

Now, it’s easier to understand what the code does, and there’s no repetition. The `map()`/`filter()` chain makes it clear that we’re first converting an array to another array with the same number of elements, and then removing elements we don’t need.

We can try to simplify it further:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (...counts) => {
  return counts
    .map((count, index) => ({
      id: MESSAGE_IDS[index],
      count
    }))
    .filter(({ count }) => count > 0);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

However, this makes the function API less discoverable and can make editor autocomplete less useful. It also gives the wrong impression that the function accepts any number of parameters and that the count order is unimportant — the number and order of parameters were clear in the previous iteration.

Instead, I’d change the function API to accept an object instead of positional parameters:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = ({
  adults,
  children,
  infants,
  youths,
  seniors
}) => {
  return [adults, children, infants, youths, seniors].reduce(
    (accumulator, count, index) => {
      if (count > 0) {
        accumulator.push({
          id: MESSAGE_IDS[index],
          count
        });
      }
      return accumulator;
    },
    []
  );
};
```

<!--
expect(getMessageProps({adults: 1, children: 5, infants: 0, youths: 2, seniors: 0})).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

The original API makes it easy to pass the parameters in the wrong order:

<!--
let getMessageProps = () => {}
let adults, children, infants, youths, seniors
-->

```js
// Correct order of parameters
getMessageProps(adults, children, infants, youths, seniors);

// WARNING: Incorrect order or parameters
getMessageProps(adults, infants, children, youths, seniors);
```

<!-- // Executing the code is enough to test this example -->

The improved API makes it almost impossible:

<!--
let getMessageProps = () => {}
let adults, children, infants, youths, seniors
-->

```js
// Correct order of parameters
getMessageProps({
  adults,
  children,
  infants,
  youths,
  seniors
});

// Still correct, the order of object properties doesn’t matter
getMessageProps({
  adults,
  infants,
  children,
  youths,
  seniors
});
```

<!-- // Executing the code is enough to test this example -->

It doesn’t matter in which order we put the object properties when calling the function; it can still access the correct fields by their names.

Probably the only valid reason to mutate function parameters is performance optimization: when we work with a huge piece of data, creating a new object or array would be too slow. However, like with all performance optimizations, measure first to know whether we actually have a problem and avoid premature optimization.

{#explicit-mutation}

## Make the mutation explicit if it’s necessary

Sometimes, we can’t avoid mutation, for example, because of an unfortunate language API that does mutation instead of (or in addition to) returning a new value.

The `sort()` array method is an infamous example of this:

```js
const counts = [6, 3, 11];
const tacos = counts
  .sort((a, b) => a - b)
  .map(n => `${n} tacos`);
// → ['3 tacos', '6 tacos', '11 tacos']
```

<!-- expect(tacos).toEqual(['3 tacos', '6 tacos', '11 tacos']) -->

This example gives the impression that we just create a new `tacos` array with the sorted list, without changing the original `counts` array. Unexpectedly, the `sort()` method returns a sorted array _and_ mutates the original array at the same time. This kind of code is hazardous and can lead to hard-to-find bugs. Many developers don’t realize that the `sort()` method mutates because the code _seems_ to work fine.

T> Another surprising thing about the `sort()` method is that by default, it sorts elements by converting them to strings first, so `[6, 3, 11]` will be sorted as `[11, 3, 6]`, unless we provide a custom comparison function, as in the example above. This is a very poor design and severely violates [the principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment).

It’s better to make the mutation explicit:

```js
const counts = [6, 3, 11];
const sortedCounts = [...counts].sort((a, b) => a - b);
const tacos = sortedCounts.map(n => `${n} tacos`);
// → ['3 tacos', '6 tacos', '11 tacos']
```

<!-- expect(tacos).toEqual(['3 tacos', '6 tacos', '11 tacos']) -->

Here, we’re making a shallow copy of the `counts` array using the spread syntax and then sorting it, so the original array stays the same.

Another option is to isolate the mutating code into a new function that doesn’t mutate the original values:

```js
function safeSort(array) {
  return [...counts].sort((a, b) => a - b);
}

const counts = [6, 3, 11];
const tacos = safeSort(counts).map(n => `${n} tacos`);
// → ['3 tacos', '6 tacos', '11 tacos']
```

<!-- expect(tacos).toEqual(['3 tacos', '6 tacos', '11 tacos']) -->

We can also use a third-party library, like Lodash, with its [`sortBy()` method](https://lodash.com/docs#sortBy):

```js
const counts = [6, 3, 11];
const tacos = _.sortBy(counts).map(n => `${n} tacos`);
// → ['3 tacos', '6 tacos', '11 tacos']
```

<!-- expect(tacos).toEqual(['3 tacos', '6 tacos', '11 tacos']) -->

However, my favorite method is ECMAScript 2023’s `toSorted()` method that doesn’t mutate the original array:

```js
const counts = [6, 3, 11];
const sortedCounts = counts.toSorted((a, b) => a - b);
const tacos = sortedCounts.map(n => `${n} tacos`);
// → ['3 tacos', '6 tacos', '11 tacos']
```

<!-- expect(tacos).toEqual(['3 tacos', '6 tacos', '11 tacos']) -->

At this point, I avoid the legacy `sort()` method in favor of the new `toSorted()` method.

## Updating objects

Modern JavaScript makes it easier to make immutable data updates thanks to [the spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax). Before the spread syntax, we had to write something like:

```js
const prev = { coffee: 1 };
const next = Object.assign({}, prev, { pizza: 42 });
// → { coffee: 1, pizza: 42 }
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

Note the empty object as the first parameter: it was necessary; otherwise, the `Object.assign()` method would mutate the initial object because it considers the first parameter the target. Similar to the `sort()` method, it mutates the first parameter and also returns the result. This is a very unfortunate API.

Fortunately, we can now write:

```js
const prev = { coffee: 1 };
const next = { ...prev, pizza: 42 };
// → { coffee: 1, pizza: 42 }
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

This does the same thing, but it’s less verbose, and we don’t need to remember `Object.assign()`’s quirks.

I> The [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) method was introduced in ECMAScript 2015. Before that, we didn’t even try to avoid mutation — it was too painful.

I> Redux has a great [page on immutable update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns): it describes patterns for updating arrays and objects without mutation, and it’s useful even if we don’t use Redux.

And still, the spread syntax quickly gets incredibly verbose:

```js
function addDrink(meals, drink) {
  return {
    ...meals,
    lunch: {
      ...meals.lunch,
      drinks: [...meals.lunch.drinks, drink]
    }
  };
}
```

<!--
const next = addDrink({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea']}}, 'coffee');
expect(next).toEqual({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea', 'coffee']}})
-->

We need to spread each level of the object to change a nested value; otherwise, we’ll _overwrite_ the initial object’s property:

```js
function addDrink(meals, drink) {
  return {
    ...meals,
    lunch: {
      drinks: [drink]
    }
  };
}
```

<!--
const next = addDrink({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea']}}, 'coffee');
expect(next).toEqual({breakfast: 'none', lunch: {drinks: ['coffee']}})
-->

Here, we’re keeping only the first level of properties of the initial object: `lunch` and `drinks` will have only the new properties.

On top of that, the spread and `Object.assign()` only do shallow cloning: only the first level properties are copies, but all nested properties are references to the original object, meaning mutation of a nested property mutates the original object.

Keeping our objects as shallow as possible might be a good idea if we update them often.

While we wait for JavaScript to get native immutability, there are two ways we can make our lives easier today:

- prevent mutation;
- simplify object updates.

I> The [JavaScript records & tuples proposal](https://github.com/tc39/proposal-record-tuple) that introduces deeply immutable object-like (`Record`s) and array-like (`Tuple`s) structures is now in Stage 2.

**Preventing mutation** is a good idea because it’s so easy to miss mutations during code reviews, and then spend countless hours debugging obscure bugs.

One way to prevent mutation is to use a linter. ESLint has several plugins that try to do just that.

T> The [eslint-plugin-better-mutation](https://github.com/sloops77/eslint-plugin-better-mutation) plugin disallows any mutation, except for local variables in functions. This is a great idea because it prevents bugs caused by the mutation of shared objects but allows us to use mutation locally. Unfortunately, it breaks even in simple cases, such as a mutation inside the `forEach()` method’s callback function.

I> We talk about linting in the [Lint your code](#linting) chapter.

Another way to prevent mutation is to mark all objects and arrays as read-only in TypeScript.

For example, we can use the `readonly` modifier:

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}
```

Or use the `Readonly` utility type:

```ts
type Point = Readonly<{
  x: number;
  y: number;
}>;
```

Similarly for arrays:

```ts
function safeSort<T>(array: readonly T[]) {
  return [...array].sort();
}
```

<!--
const source = [3, 2, 1];
const result = safeSort(source);
expect(source).toEqual([3, 2, 1])
expect(result).toEqual([1, 2, 3])
-->

Note that both the `readonly` modifier and the `Readonly` utility type are shallow, so we need to add them to all nested objects as well.

T> The [eslint-plugin-functional](https://github.com/eslint-functional/eslint-plugin-functional) plugin has the rule to require read-only types everywhere, which may be more convenient than remembering to do that ourselves.

I think adding `readonly` modifiers is a good idea because there’s no runtime cost, though it makes type definitions more verbose. However, I’d prefer [an option in TypeScript](https://github.com/microsoft/TypeScript/issues/32758) to make all types read-only by default, with a way to opt out.

Similarly to making objects read-only on the type level, we can make them read-only at runtime with the `Object.freeze()` method. It’s also shallow, so we need to [deep freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to ensure that nested objects are also frozen, and we may want to have freezing only in development since it can slow our app down.

I don’t think freezing is worth it on its own unless it’s part of another library.

**Simplifying object updates** is another option that we can combine with mutation prevention.

One way to simplify object updates is to use a library like [Immutable.js](https://immutable-js.com):

```js
import { Map } from 'immutable';
const map1 = Map({ food: 'pizza', drink: 'coffee' });
const map2 = map1.set('drink', 'vodka');
// → Map({ food: 'pizza', drink: 'vodka' })
```

<!-- expect(map2.toJS()).toEqual({ food: 'pizza', drink: 'vodka' }) -->

I’m not a big fan of Immutable.js because we have to work with Immutable objects instead of plain JavaScript objects or arrays, and it has a completely custom API that we have to learn. Also, converting arrays and objects from plain JavaScript to Immutable.js and back every time we need to work with any native JavaScript API or almost any third-party API is annoying. Overall, it feels like Immutable.js creates more problems than it solves.

Another option is [Immer](https://immerjs.github.io/immer/), which allows us to use any mutating operations on a _draft_ version of an object without affecting the original object in any way. Immer intercepts each operation and returns a new object:

```js
import { produce } from 'immer';
const map1 = { food: 'pizza', drink: 'coffee' };
const map2 = produce(map1, draft => {
  draft.drink = 'vodka';
});
// → { food: 'pizza', drink: 'vodka' }
```

<!-- expect(map2).toEqual({ food: 'pizza', drink: 'vodka' }) -->

T> Immer freezes the resulting object using `Object.freeze()` in the development environment to prevent accidental mutation.

## Even mutation is not that bad sometimes

In rare cases, rewriting imperative code with mutation in a declarative way without mutation doesn’t make it any better.

Consider this example, where we conditionally create an array:

```js
const hasSweetTooth = true;
const menu = [
  'tacos al pastor',
  'café de olla',
  ...(hasSweetTooth ? ['tres leches cake'] : [])
];
// → ['tacos al pastor', 'café de olla', 'tres leches cake']
```

<!-- expect(menu).toEqual(['tacos al pastor', 'café de olla', 'tres leches cake']) -->

And here is the same example with mutation:

```js
const hasSweetTooth = true;
const menu = ['tacos al pastor', 'café de olla'];
if (hasSweetTooth) {
  menu.push('tres leches cake');
}
// → ['tacos al pastor', 'café de olla', 'tres leches cake']
```

<!-- expect(menu).toEqual(['tacos al pastor', 'café de olla', 'tres leches cake']) -->

I find the latter example more readable.

Here’s another example:

<!-- eslint-disable unicorn/no-array-for-each -->

```js
const friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'];
const counts = {};
friendNames.forEach(x => {
  if (counts[x]) {
    counts[x]++;
  } else {
    counts[x] = 1;
  }
});
// → { Kili: 2, Bilbo: 1, Frodo: 1 }
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

We have a list of friend names, and we calculate how many times each name appears. We can try to avoid mutation using the `reduce()` method:

```js
const friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'];
const friendCount = friendNames.reduce((counts, x) => {
  if (counts[x]) {
    counts[x]++;
  } else {
    counts[x] = 1;
  }
  return counts;
}, {});
// → { Kili: 2, Bilbo: 1, Frodo: 1 }
```

<!-- expect(friendCount).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

What I don’t like about `reduce()` is that we need to return the accumulator every time. Unless the body of the `reduce()` is a single line, and we can use implicit return, the code looks too complex compared to the `forEach()` method. The difference is even more noticeable when compared to a `for…of` loop:

```js
const friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'];
const counts = {};
for (const name of friendNames) {
  if (counts[name]) {
    counts[name]++;
  } else {
    counts[name] = 1;
  }
}
// → { Kili: 2, Bilbo: 1, Frodo: 1 }
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

This is my favorite option so far.

However, I usually write such counters slightly differently:

```js
const friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'];
const counts = {};
for (const name of friendNames) {
  if (counts[name] === undefined) {
    counts[name] = 0;
  }

  counts[name]++;
}
// → { Kili: 2, Bilbo: 1, Frodo: 1 }
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

I like it more because it separates the initialization code and the actual counter, so we can change them independently. It also works well when either the initialization or the update code becomes more complex.

Here’s a more complex example:

<!-- const addDays = x => x + 1 -->

```js
const getDateRange = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateArray.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
};
```

<!-- expect(getDateRange(4, 14)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) -->

Here, we’re creating an array of dates to fill a given date range.

I don’t have good ideas on how to rewrite this code without an imperative loop, reassignment, and mutation. And here, we can live with them:

- all “bad” things are isolated inside a small function;
- the function has a meaningful name;
- the code is clear enough;
- the function is pure: it doesn’t have any internal state or side effects.

---

Replacing imperative code, full of loops and conditions, with declarative code is one of my favorite refactorings, as it often makes code more readable and maintainable. This is also one of the most common suggestions I make in code reviews. Code with mutations likely hides other issues — mutation is a good sign to look closer.

However, it’s better to write simple and clear code with mutation than complex and messy code without it. However, if we do use mutation, it’s wise to isolate it in a small function with a meaningful name and clear API.

Also, immutable operations could [significantly reduce performance](https://tkdodo.eu/blog/why-i-dont-like-reduce) when working with large amounts of data and create a new object on each iteration.

I’d prefer to have a language that is immutable by default and use mutating operations explicitly where I need them.

Start thinking about:

- Rewriting imperative code with mutation in a declarative way to improve readability.
- Creating a complete object in a single place to make its shape clearer.
- Deduplicating logic and separating “what” from “how.”
- Avoiding mutating function parameters to prevent hard-to-find bugs.
- Using `map()`/`filter()` chaining instead of a single `reduce()` method.
- Making mutation explicit if you have to use it.
- Preventing mutation in your code by using a linter or read-only types.
