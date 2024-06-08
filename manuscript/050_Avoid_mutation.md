{#no-mutation}

# Avoid mutation

<!-- description: Why mutation is hindering code readability and what can we do about it -->

Mutations happen when we change a JavaScript object or array without creating a new variable or reassigning an existing one:

```js
const puppy = {
  name: 'Dessi',
  age: 9
};
puppy.age = 10;
```

<!-- expect(puppy).toEqual({name: 'Dessi', age: 10}) -->

Here we’re _mutating_ the original `puppy` object by changing its `age` property.

Mutations are often problematic. Consider this function:

<!-- const console = { log: vi.fn() } -->

```js
function printSortedArray(array) {
  array.sort();
  for (const item of array) {
    console.log(item);
  }
}
```

<!--
printSortedArray([3, 1, 2])
expect(console.log.mock.calls).toEqual([[1], [2], [3]])
-->

The problem here is that the `sort()` array method mutates the array we’re passing into our function, likely not what we’d expect when calling a function named `printSortedArray()`.

Some of the problems with mutations:

- Mutations may lead to unexpected and hard-to-debug issues, where data becomes incorrect somewhere, and we have no idea where it happens.
- Mutations make code harder to understand: at any time, an array or an object may have a different value, so we need to be very careful when reading the code.
- Mutation of function parameters makes the behavior of a function surprising and crease unexpected side effects.
- Mutations are often unexpected. It’s too easy to forget which methods mutate the original data, and which don’t. Both could return the same value, and there’s no naming convention of any kind to differentiate them, at least in JavaScript.

_Immutability_ or _immutable data structures_, meaning that to change a value we have to create a new array or object, would solve this problem. Unfortunately, JavaScript doesn’t support immutability natively, and all solutions are more crutches than actual solutions. But even just _avoiding_ mutations in our code makes it easier to understand.

Also, don’t forget that `const` in JavaScript only prevents reassignments — not mutations.

I> We talk about reassignments in the previous chapter, [Avoid reassigning variables](no-reassigning).

## Avoid mutating operations

One of the most common use cases for mutation is updating an object:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

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
          error: `Cannot parse modifiers`
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

Here we’re creating an object with three fields, one of which, `settings`, is optional. And we’re doing it by mutating the initial `example` object when it should have an optional field.

I prefer to see the whole object shape in a single place instead of having to read the whole function to find all possible object shape variations. Usually, it doesn’t matter whether a property has an `undefined` value or doesn’t exist at all. I haven’t seen many cases where it mattered for a good reason.

We also have a special error case here that returns an entirely different object with a lone `error` property. But it’s really a special case because none of the properties of two objects overlap, and it doesn’t make sense to merge them.

I use ternaries for simple cases and extract code to a function for more complex cases. Here we have a good case for the latter because of a nested condition and a `try`/`catch` block.

Let’s refactor it:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

```js
function getSettings(modifiers) {
  if (!modifiers) {
    return undefined;
  }

  if (hasStringModifiers(modifiers)) {
    return modifiers.split(' ').reduce((obj, modifier) => {
      obj[modifier] = true;
      return obj;
    }, {});
  }

  return JSON.parse(modifiers);
}

function parseExample(content, lang, modifiers) {
  try {
    return {
      content,
      lang,
      settings: getSettings(modifiers)
    };
  } catch (err) {
    return {
      error: `Cannot parse modifiers`
    };
  }
}
```

<!--
expect(parseExample('pizza', 'js')).toEqual({content: 'pizza', lang: 'js'})
expect(parseExample('pizza', 'js', '{"foo": true}')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true}})
expect(parseExample('pizza', 'js', 'foo bar')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true, bar: true}})
-->

Now it’s easier to understand what the code does, and the possible shapes of the return object are clear. We’ve also removed all mutations and reduced nesting a little.

## Beware of the mutating array methods

Not all methods in JavaScript return a new array or object. Some methods mutate the original value in place. For example, the `push()` method is one of the most commonly used.

I> Use [Does it mutate](https://doesitmutate.xyz/) to quickly check whether an array method mutating or not.

Replacing imperative code, full of loops and conditions, with declarative code is one of my favorite refactorings. And one of the most common suggestions I give in code reviews.

Consider this code:

<!--
const Text = ({children}) => <p>{children}</p>
const ProductOptions = () => null
const product1 = {name: 'pizza', colors: [], sizes: []}
const product2 = {name: 'pizza', colors: [], sizes: []}
-->

```jsx
const generateOptionalRows = () => {
  const rows = [];

  if (product1.colors.length + product2.colors.length > 0) {
    rows.push({
      row: 'Colors',
      product1: <ProductOptions options={product1.colors} />,
      product2: <ProductOptions options={product2.colors} />
    });
  }

  if (product1.sizes.length + product2.sizes.length > 0) {
    rows.push({
      row: 'Sizes',
      product1: <ProductOptions options={product1.sizes} />,
      product2: <ProductOptions options={product2.sizes} />
    });
  }

  return rows;
};

const rows = [
  {
    row: 'Name',
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  ...generateOptionalRows()
];
```

<!--
expect(rows).toEqual([{"product1": <Text>pizza</Text>, "product2": <Text>pizza</Text>, "row": "Name"}])
-->

Here we have two ways of defining table rows: a plain array with always visible rows, and a function that returns optional rows. The latter mutates the original array using the `push()` method.

Array mutation itself isn’t the most significant issue of this code. However, code with mutations likely hides other issues — mutation is a good sign to look closer. Here the main problem is imperative array building and different ways of handling required and optional rows. Replacing imperative code with declarative and eliminating conditions often makes code more readable and maintainable.

Let’s merge all possible rows into a single declarative array:

<!--
const Text = ({children}) => <p>{children}</p>
const ProductOptions = () => null
const product1 = {name: 'pizza', colors: [], sizes: []}
const product2 = {name: 'pizza', colors: [], sizes: []}
-->

```jsx
const rows = [
  {
    row: 'Name',
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  {
    row: 'Colors',
    product1: <ProductOptions options={product1.colors} />,
    product2: <ProductOptions options={product2.colors} />,
    isVisible: (product1, product2) =>
      (product1.colors.length > 0 || product2.colors.length) > 0
  },
  {
    row: 'Sizes',
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

<!--
expect(visibleRows).toEqual([{"product1": <Text>pizza</Text>, "product2": <Text>pizza</Text>, "row": "Name"}])
-->

Now we’re defining all rows in a single array. All rows are visible by default unless they have the `isVisible()` function that returns `false`. We’ve improved code readability and maintainability:

- there’s only one way of defining rows;
- no need to check two places to see all available rows;
- no need to decide which method to use to add a new row;
- easier to make an existing row optional by adding `isVisible()` function to it.

Here’s another example:

<!--
const options = {foo: 1}
const task = {parameters: {foo: {message: 'Foo'}, bar: {initial: 2}}}
-->

```js
const defaults = { ...options };
const prompts = [];
const parameters = Object.entries(task.parameters);

for (const [name, prompt] of parameters) {
  const hasInitial = typeof prompt.initial !== 'undefined';
  const hasDefault = typeof defaults[name] !== 'undefined';

  if (hasInitial && !hasDefault) {
    defaults[name] = prompt.initial;
  }

  prompts.push({ ...prompt, name, initial: defaults[name] });
}
```

<!--
expect(defaults).toEqual({foo: 1, bar: 2})
expect(prompts).toEqual([{name: 'foo', initial: 1, message: 'Foo'}, {name: 'bar', initial: 2}])
-->

At first sight, this code doesn’t look very bad: it converts an object into an array by pushing new elements into the `prompts` array. But if we take a closer look, there’s another mutation inside a condition in the middle that mutates the `defaults` object. And this is a bigger problem because it’s easy to miss while reading the code.

The code is actually doing two loops: one to convert the `task.parameters` object to the `prompts` array, and another to update `defaults` with values from `task.parameters`. I’d split them to make it clear:

<!--
const options = {foo: 1}
const task = {parameters: {foo: {message: 'Foo'}, bar: {initial: 2}}}
-->

```js
const parameters = Object.entries(task.parameters);

const defaults = parameters.reduce(
  (acc, [name, prompt]) => ({
    ...acc,
    [name]:
      prompt.initial !== undefined ? prompt.initial : options[name]
  }),
  {}
);

const prompts = parameters.map(([name, prompt]) => ({
  ...prompt,
  name,
  initial: defaults[name]
}));
```

<!--
expect(defaults).toEqual({foo: 1, bar: 2})
expect(prompts).toEqual([{name: 'foo', initial: 1, message: 'Foo'}, {name: 'bar', initial: 2}])
-->

Other mutating array methods to watch out for are:

- [copyWithin()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
- [fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [pop()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [reverse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [shift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [splice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [unshift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)

I> Thanks to the [Change Array by copy](https://github.com/tc39/proposal-change-array-by-copy) proposal, JavaScript will have immutable alternatives to several of the mentioned above methods: `toReversed()`, `toSorted()`, `toSpliced()`, and `with()`. The proposal is included in ECMAScript 2023.

## Avoid mutation of function parameters

Objects or arrays that are passed to a function can be mutated inside that function, and this affects the original object:

```js
const mutate = object => {
  object.secret = 'Loves pizza';
};

const person = { name: 'Chuck Norris' };
mutate(person);
// -> { name: 'Chuck Norris', secret: 'Loves pizza' }
```

<!-- expect(person).toEqual({ name: 'Chuck Norris', secret: 'Loves pizza' }) -->

Here the `person` object is mutated inside the `mutate()` function.

Function parameter mutation can be intentional or accidental, and both are problematic:

- It’s harder to understand how a function works and how to use it because it doesn’t return a value but changes one of the incoming parameters.
- Accidental parameter mutation is even worse because function consumers don’t expect it. And it can lead to hard-to-find bugs when a value that is mutated inside a function is later used outside this function.

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

It converts a bunch of number variables to a `messageProps` array that groups people of different ages with their count:

```js
[
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

The problem with this code is that the `addIfGreaterThanZero()` function mutates the array we’re passing to it. This is an example of an intentional mutation: it’s required for this function to work. However, it’s not the best API for what this function does.

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

But I don’t think we need this function at all:

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

Now it’s easier to understand what the code does. There’s no repetition, and the intent is clear: the `getMessageProps()` function converts a list of values to an array of objects and removes “empty” elements.

We can simplify it further:

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

But this makes the function API less discoverable and can make editor autocomplete less useful. It also gives the wrong impression that the function accepts any number of parameters and that the count order is unimportant — the number and order of parameters were clear in the previous iteration.

We can also use `reduce()` method instead of `map()` / `filter()` chaining:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (...counts) => {
  return counts.reduce((acc, count, index) => {
    if (count > 0) {
      acc.push({
        id: MESSAGE_IDS[index],
        count
      });
    }
    return acc;
  }, []);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

I’m not a huge fan of `reduce()` because it often makes code harder to read and the intent less clear. With `map()` / `filter()` chaining, it’s clear that we’re first converting an array to another array with the same number of elements, and then removing array elements we don’t need. With `reduce()` it’s less obvious.

So I’d stop two steps ago with this refactoring.

Mutation is often accidental:

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
    (a, b) => ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
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

It’s clear that the author of this code didn’t expect the `sort()` method to mutate the original array, and accidentally introduced a mutation of a function parameter.

We can fix this using spread syntax, like so:

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
    (a, b) => ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
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

Here, we create a copy of an incoming array before sorting it, so the original array never changes.

Probably the only valid reason to mutate function parameters is performance optimization: when we work with a huge piece of data and creating a new object or array would be too slow. But like with all performance optimizations: measure first to know whether we actually have a problem, and avoid premature optimization.

## Make mutations explicit if they are necessary

Sometimes we can’t avoid mutations, for example, because of an unfortunate language API that does mutation.

Array’s `sort()` method is an infamous example of that:

```js
const counts = [6, 3, 2];
const puppies = counts.sort().map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

This example gives the impression that the `counts` array isn’t changing, and we’re just creating a new `puppies` array with the sorted array. But the `sort()` method returns a sorted array _and_ mutates the original array at the same time. This kind of code is hazardous and can lead to hard-to-find bugs. Many developers don’t realize that the `sort()` method is mutating because the code _seems_ to work fine.

It’s better to make the mutation explicit:

```js
const counts = [6, 3, 2];
const sortedCounts = [...counts].sort();
const puppies = sortedCounts.map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

Here we’re making a shallow copy of the `counts` array using the spread syntax and then sorting it, so the original array stays the same.

Another option is to wrap a mutating API into a new API that doesn’t mutate original values:

```js
function safeSort(array) {
  return [...counts].sort();
}

const counts = [6, 3, 2];
const puppies = safeSort(counts).map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

Or use a third-party library, like Lodash and its [`sortBy()` function](https://lodash.com/docs#sortBy):

```js
const counts = [6, 3, 2];
const puppies = _.sortBy(counts).map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

Another popular method is using the `slice()` method to create a copy of an array:

```js
const counts = [6, 3, 2];
const sortedCounts = counts.slice().sort();
const puppies = sortedCounts.map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

I’d advice against it: spreading is slightly more readable, though both methods require some explanation the first time one sees them.

## Updating objects

Modern JavaScript makes it easier to do immutable data updates thanks to [the spread syntax](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax). Before the spread syntax, we had to write something like:

```js
const prev = { coffee: 1 };
const next = Object.assign({}, prev, { pizza: 42 });
// -> { coffee: 1, pizza: 42 }
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

Note the empty object as the first parameter: it was necessary; otherwise, the `Object.assign()` method would mutate the initial object: it considers the first parameter as a target. It mutates the first parameter and also returns it — this is a very unfortunate API.

Now we can write:

```js
const prev = { coffee: 1 };
const next = { ...prev, pizza: 42 };
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

This does the same thing but is less verbose, and no need to remember `Object.assign()`’s quirks.

And before the [Object.assign()](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) method in ECMAScript 2015, we didn’t even try to avoid mutations: it was too painful.

I> Redux has a great [page on immutable update patterns](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns): it describes patterns for updating arrays and objects without mutations, and it’s useful even if we don’t use Redux.

And still, spread syntax quickly gets incredibly verbose:

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

We need to spread each level of the object to change a nested value; otherwise, we’ll _overwrite_ the initial object with a new one:

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

Here we’re keeping only the first level of properties of the initial object: `lunch` and `drinks` will have only the new properties.

Also, spread and `Object.assign()` only do shallow cloning: only the first level properties are copies, but all nested properties are references to the original object, meaning mutation of a nested property mutates the original object.

Keeping our objects as shallow as possible might be a good idea if we update them often.

While we’re waiting for JavaScript to get native immutability, there are two non-exclusive ways we can make our lives easier today:

- prevent mutations;
- simplify object updates.

I> The [JavaScript records & tuples proposal](https://github.com/tc39/proposal-record-tuple) that introduces deeply immutable object-like (`Record`s) and array-like (`Tuple`s) structures is now in Stage 2.

**Preventing mutations** is good because it’s so easy to miss them during code reviews, and then spend many hours debugging weird issues.

One way to prevent mutations is to use a linter, and ESLint has several plugins that try to do just that.

T> The [eslint-plugin-better-mutation](https://github.com/sloops77/eslint-plugin-better-mutation) plugin disallows any mutations, except for local variables in functions. This is a great idea because it prevents bugs caused by the mutation of shared objects but allows us to use mutations locally. Unfortunately, it breaks even in simple cases, such as a mutation occurring inside `forEach()`.

I> We talk about linting in the [Lint your code](#linting) chapter.

Another way to prevent mutations is to mark all objects and arrays as read-only in TypeScript.

For example, using the `readonly` modifier in TypeScript:

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}
```

Or using the `Readonly` utility type:

```ts
type Point = Readonly<{
  readonly x: number;
  readonly y: number;
}>;
```

And similar for arrays:

```ts
function sort(array: readonly unknown[]) {
  return [...array].sort();
}
```

<!--
const source = [3, 2, 1];
const result = sort(source);
expect(source).toEqual([3, 2, 1])
expect(result).toEqual([1, 2, 3])
-->

Note that both `readonly` modifier and `Readonly` utility type are shallow, so we need to add them to all nested objects too.

T> The [eslint-plugin-functional](https://github.com/jonaskello/eslint-plugin-functional) plugin has the rule to require read-only types everywhere, which may be more convenient than remembering to do that ourselves.

I think adding `readonly` modifiers is a good idea, because there’s no runtime cost, though it makes type definitions more verbose. However, I’d prefer [an option in TypeScript](https://github.com/microsoft/TypeScript/issues/32758) to make all types read-only by default with a way to opt out.

Similar to making objects read-only on the type level, we can make them read-only at runtime with `Object.freeze`. `Object.freeze` is also shallow, so we’d have to [deep freezing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to ensure that nested objects are also frozen, and we might want to have freezing only in development since it can otherwise slow our app down.

I don’t think freezing is worth it on its own unless it is part of another library.

**Simplifying object updates** is another option that we can combine with mutation prevention.

One of the ways to simplify object updates is to use a library like [Immutable.js](https://immutable-js.com):

```js
import { Map } from 'immutable';
const map1 = Map({ food: 'pizza', drink: 'coffee' });
const map2 = map1.set('drink', 'vodka');
```

<!-- expect(map2.toJS()).toEqual({ food: 'pizza', drink: 'vodka' }) -->

I’m not a big fan of it because one has to work with Immutable objects instead of plain JavaScript objects or arrays, and they have a completely custom API that one has to learn. Also, converting arrays and objects from plain JavaScript to Immutable.js and back every time we need to work with any native JavaScript API or almost any third-party API, is annoying and overall, it feels like Immutable.js creates more problems than it solves.

Another option is [Immer](https://immerjs.github.io/immer/), which allows us to use any mutating operations on a _draft_ version of an object, without affecting the original object in any way. Immer intercepts each operation, and returns a new object:

```js
import { produce } from 'immer';
const map1 = { food: 'pizza', drink: 'coffee' };
const map2 = produce(map1, draft => {
  draft.drink = 'vodka';
});
```

<!-- expect(map2).toEqual({ food: 'pizza', drink: 'vodka' }) -->

T> Immer freezes the resulting object using `Object.freeze()` in development environment to avoid accidental mutation.

## Even mutation is not so bad sometimes

In rare cases, imperative code with mutations isn’t so bad, and rewriting it in a declarative way without mutations doesn’t make it better.

Consider this example where we conditionally create an array:

<!-- let drinksAlcohol = true -->

```js
const drinks = ['coffee', 'tea', ...(drinksAlcohol ? ['vodka'] : [])];
```

<!-- expect(drinks).toEqual(['coffee', 'tea', 'vodka']) -->

And here is the same example with mutation:

<!-- let drinksAlcohol = true -->

```js
const drinks = ['coffee', 'tea'];
if (drinksAlcohol) {
  drinks.push('vodka');
}
```

<!-- expect(drinks).toEqual(['coffee', 'tea', 'vodka']) -->

I’m hesitant to say which one is more readable.

Let’s look at another example:

<!-- let friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'] -->

```js
const counts = {};
friendNames.forEach(x => {
  if (counts[x]) {
    counts[x]++;
  } else {
    counts[x] = 1;
  }
});
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

We have a list of friend names, and we’re calculating how many friends we have with the same name. We can try to avoid mutation with the `reduce()` method:

<!-- let friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'] -->

```js
const counts = friendNames.reduce((counts, x) => {
  if (counts[x]) {
    counts[x]++;
  } else {
    counts[x] = 1;
  }
  return counts;
}, {});
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

What I don’t like about the `reduce()` is that return part. Unless the body of reduce is a single line, and we can use implicit return, the code looks too complex in comparison to the `forEach()`. The difference is even more noticeable if we compare it to a for loop:

<!-- let friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'] -->

```js
const counts = {};
for (const name of friendNames) {
  if (counts[name]) {
    counts[name]++;
  } else {
    counts[name] = 1;
  }
}
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

This is my favorite option so far.

However, I usually write such counters slightly differently:

<!-- let friendNames = ['Kili', 'Bilbo', 'Frodo', 'Kili'] -->

```js
const counts = {};
for (const name of friendNames) {
  if (name in counts === false) {
    counts[name] = 0;
  }

  counts[name]++;
}
```

<!-- expect(counts).toEqual({Kili: 2, Bilbo: 1, Frodo: 1}) -->

I like it more because we’ve separated the initialization code and the actual counter, so we can change them independently. It also works well when either the initialization or the update code is more complex.

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

Here we’re making an array of dates to fill a given date range.

I don’t have good ideas on how to rewrite this code without an imperative loop, reassignment, and mutation. And here we can live with them:

- all “bad” things are isolated inside a small function;
- the function has a meaningful name;
- the code is clear enough;
- the function is pure: it doesn’t have any internal state and avoids mutating its parameters.

It’s better to have simple and clear code with mutations than complex and messy code without them. But if we do use mutations, it’s wise to isolate them to a small function with a meaningful name and clear API.

Also, immutable operations could [significantly reduce performance](https://tkdodo.eu/blog/why-i-dont-like-reduce) if we work with large amounts of data and create a new object on each iteration.

I’d prefer to have a language that is immutable by default and use mutating operations explicitly where I need them.

---

Start thinking about:

- Rewriting imperative code with mutations in a purely declarative way to improve its readability.
- Keeping the complete object shape in a single place; when we create a new object, make its shape as clear as possible.
- Deduplicating logic and separating “what” from “how.”
- Avoiding mutation of function parameters to prevent hard-to-find bugs.
- Using `map()` / `filter()` chaining instead of `reduce()`.
- Making mutations explicit if you have to use them.
- Preventing mutations in your code using a linter or read-only types.
