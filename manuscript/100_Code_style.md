{#code-style}

# Code style

<!-- description: Which code styles are actually improving readability and which are just opinions that don’t matter much -->

I used to be very strict about [code style](https://sapegin.me/blog/prettier/). I thought my code style was better than others’, but later I realized that it was just different. And it wasn’t the most popular, so anyone else’s code looked wrong to me.

For example, after reading the [The Programmers’ Stone](https://www.datapacrat.com/Opinion/Reciprocality/r0/index.html) I was formatting braces like this for a long time:

<!-- const food = 'pizza', alert = () => {} -->

<!-- prettier-ignore -->
```js
if (food === 'pizza')
{
  alert('Pizza ;-)');
}
else
{
  alert('Not pizza ;-(');
}
```

Or I had two spaces in front of inline comments to better separate them from the code:

<!-- prettier-ignore -->
```js
const volume = 200;  // ml
```

So if any other developer touched my code, they would definitely make it inconsistent, because it’s unlikely that they would follow _my code style_ — so uncommon it was. And code review would be a nightmare if I wanted to enforce _my code style_.

## Not all code styles are good

I wasn’t entirely wrong though: not every code style makes code easy to read and maintain.

For example, this way of defining arrays makes it harder to move or add new elements:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie'
];
```

That’s because we’ll have to change two lines every time we want to do something at the array’s end. It also clutters the diff for the same reason:

```diff
const dogs = [
  'dachshund',
  'saluki',
-  'sheltie'
+  'sheltie',
+  'whippet'
];
```

_Trailing, or dangling, commas_ solve both problems without making code any harder to write or read:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
];
```

Now we need to change only one line:

```diff
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
+  'whippet',
];
```

I> Nik Graf wrote [a great article on benefits of dangling commas](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8).

And if there was one particular code style I really dislike, it would be code blocks without brackets:

<!-- function test(pizza) { -->

```js
if (pizza) pizza();
```

<!--
}
let test2 = false;
test()
expect(test2).toBe(false);
test(() => {test2 = true})
expect(test2).toBe(true);
-->

Instead of:

<!-- function test(pizza) { -->

```js
if (pizza) {
  pizza();
}
```

<!--
}
let test2 = false;
test()
expect(test2).toBe(false);
test(() => {test2 = true})
expect(test2).toBe(true);
-->

I think it really damages the readability of the code. The longer the condition, the harder it is to see the body:

<!-- function test(recipeDetails) { -->

```js
if (!recipeDetails?.allIngredients.length) return null;
```

<!--
}
expect(test({allIngredients: []})).toBe(null);
expect(test({allIngredients: [1]})).toBe(undefined);
-->

I’m 102% sure, I’d not notice the `return` here when reading the code for the first time.

T> My color theme [Squirrelsong](https://sapegin.me/squirrelsong/) shows `!` and other operators in bold to make them more noticeable.

Compare it with:

<!-- function test(recipeDetails) { -->

```js
if (recipeDetails?.allIngredients.length === 0) {
  return null;
}
```

<!--
}
expect(test({allIngredients: []})).toBe(null);
expect(test({allIngredients: [1]})).toBe(undefined);
-->

Now the `return` statement is more noticeable: it has its own line, braces create extra negative space around it, and, most important, it has a familiar shape of an `if` statement. Without braces, it looks like any other line (see the illustration).

![Shapes of if conditions without and with braces](images/if-shapes.svg)

Of course, there are worse ways to write code:

<!-- function test(pizza) { -->

```js
pizza && pizza();
```

<!--
}
let test2 = false;
test()
expect(test2).toBe(false);
test(() => {test2 = true})
expect(test2).toBe(true);
-->

Shorter isn’t always better. (I’m fine with `pizza?.()` though, sometimes.)

T> Use `curly` ESLint rule to make sure all conditions have braces: see the [Lint your code](#linting) chapter.

## Obsolete code styles

Sometimes developers follow a particular code style even if the initial reasoning behind it is no longer relevant.

For example, using leading commas in arrays and objects when JavaScript didn’t support trailing commas:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund'
, 'saluki'
, 'sheltie'
];
```

The goal of this style was the same as of trailing commas in the previous section — to make adding new elements easier and diffs more readable, but there are no reasons to use this anymore: Internet Explorer 8 was the last browser that didn’t support trailing commas.

Another example is [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions), a style where a literal is on the left side of a condition:

<!--
const meaning = 42
let result = false;
-->

<!-- prettier-ignore -->
```js
if (42 === meaning) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

It’s too easy to type `=` instead of `==` in languages like C and make an assignment:

<!--
let meaning = 0
let result = false;
-->

```js
if (meaning = 42) {
```

<!--
  result = true
}
expect(meaning).toBe(42)
-->

Instead of a comparison:

<!--
const meaning = 42
let result = false;
-->

```js
if (meaning == 42) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This is much less relevant in JavaScript where the strict equality (`===`, values and types must be equal) is the preferred style and on most projects a linter will complain if we try to use the loose equality (`==`, only values must be equal). It’s really hard to miss two equal signs when typing `===`. So normal order of conditions is fine and easier to read:

<!--
const meaning = 42
let result = false;
-->

```js
if (meaning === 42) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

## Nonsensical code styles

Some code styles don’t solve any particular problem but are expensive to maintain.

For example, aligning object values or assignments’ right-hands horizontally to make them look “pretty”:

<!-- prettier-ignore -->
```js
var fs       = require('fs')
  , readme   = require('./readme')
  , examples = readme(fs.readFileSync('./README.md', 'utf-8'))
  ;
```

<!-- expect(examples).toEqual('./README.md') -->

Editing code written in such style takes an enormous amount of work, and luckily code formatters will remove all the artisanal handcrafted spaces and make code look equally good without requiring any work from a developer:

```js
var fs = require('fs'),
  readme = require('./readme'),
  examples = readme(fs.readFileSync('./README.md', 'utf-8'));
```

<!-- expect(examples).toEqual('./README.md') -->

I’d go one step further, and replace a single `var` with a one `var` per line (or `const`):

```js
const fs = require('fs');
const readme = require('./readme');
const examples = readme(
  fs.readFileSync('./README.md', 'utf-8')
);
```

<!-- expect(examples).toEqual('./README.md') -->

This will not only make it slightly more readable but also easier to add, remove, or move variable declarations.

I> We talk about code formatting in the [Autoformat your code](#formatting) chapter.

## Improving readability

In many cases, some ways of writing code are more readable than other ways. Conditions, and especially conditions with negations are good examples. I used to write these as short as possible, now I prefer to be verbose and explicit. Saving a few keystrokes isn’t worth it when the code could be easily misinterpreted. Better learn touch typing.

Consider this example:

<!--
const object = { o: 0 }
let result = false
let isEmpty = _.isEmpty
-->

```js
if (!isEmpty(object)) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

It’s hard to notice the negation in `!i`. We could rewrite this code to avoid misunderstanding:

<!--
const object = { o: 0 }
let result = false
let isEmpty = _.isEmpty
-->

```js
if (isEmpty(object) === false) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Someone may argue that it doesn’t read like English — “not is empty” — but there’s no way someone might miss the negation.

Here’s another example:

<!--
const guacamole = {}
let result = false
-->

```js
if (!('garlic' in guacamole)) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This pattern was always awkward to write and read for me until my friend Oleg [opened a whole new world for me](https://x.com/oleg008/status/1519593163803049984). We could do the same trick as above to make it more readable:

<!--
const guacamole = {}
let result = false
-->

```js
if ('garlic' in guacamole === false) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Another area where condition expansion improves readability is checking array length.

Consider these two examples:

<!--
const puppies = ['Dessi']
let result = false
-->

```js
if (puppies.length) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

<!--
const puppies = ['Dessi']
let result = false
-->

```js
if (!puppies.length) {
```

<!--
  result = true
}
expect(result).toBe(false)
-->

They look almost the same, and the `!` in front of the second one is easy to miss. Let’s expand them:

<!--
const puppies = ['Dessi']
let result = false
-->

```js
if (puppies.length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

<!--
const puppies = ['Dessi']
let result = false
-->

```js
if (puppies.length === 0) {
```

<!--
  result = true
}
expect(result).toBe(false)
-->

Now the conditions look significantly different and there’s no way to misinterpret them.

I’m starting to think that using `!` in conditions is [generally an antipattern](https://x.com/Jack_Franklin/status/1189477268764188672), so instead of:

<!--
const isFriday = false
let result = false
-->

```js
if (!isFriday) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

We should always write:

<!--
const isFriday = false
let result = false
-->

```js
if (isFriday === false) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Another example where we can improve readability a bit is checking whether a value is between two numbers. A naïve way to so would like so:

<!-- let inside = false, x = 7 -->

```js
if (x > 3 && x < 13) {
```

<!--
inside = true
}
expect(inside).toBe(true)
-->

This reads like “x is greater than 3 _and_ lower than 13”, which is fine but we can do better:

<!-- let inside = false, x = 7 -->

```js
if (3 < x && x < 13) {
```

<!--
inside = true
}
expect(inside).toBe(true)
-->

Now, it’s easier to see that we want `x` to be _between_ 3 and 13.

We can use the same approach to check whether a value is outside a range:

<!-- let inside = false, x = 7 -->

```js
if (x < 3 || 13 < x) {
```

<!--
inside = true
}
expect(inside).toBe(false)
-->

One minor improvement in the modern JavaScript is _numeric separators_, which allows us to separate thousands with an underscore (`_`) to make large numbers easier to read:

```js
const earthToSun1 = 149597870700;
const earthToSun2 = 149_597_870_700;
```

{#tree-vs-kebab}

## Christmas trees vs. kebabs

Some developers seem to prefer long strings, some short.

_The longstringers_ write code that looks like a kebab on a long skewer:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

<!-- prettier-ignore -->
```js
const puppiesByParent = {}
puppies.forEach(puppy => {
  if (puppy.parentId) {
    const currentParent = puppies.find(currentPuppy => currentPuppy.id === puppy.parentId)
    puppiesByParent[currentParent.id] = [...(puppiesByParent[currentParent.id] || []), puppy.id]
  }
})
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

Or:

<!--
const origin = 'https://example.com', intl = {formatMessage: () => 'test'}
function test(hasTranslation) {
-->

<!-- prettier-ignore -->
```js
const downloadLink = hasTranslation ? `${origin}/${intl.formatMessage({id: 'download-link'})}` : '/download';
```

<!--
  return downloadLink
}
expect(test(true)).toEqual('https://example.com/test')
expect(test(false)).toEqual('/download')
-->

Or:

<!--
const DACHSHUND_FAVORITE_SNACK = 'yogurt'
function test(breed) {
-->

<!-- prettier-ignore -->
```js
if (breed === 'dachshund') return DACHSHUND_FAVORITE_SNACK;
```

<!--
}
expect(test('dachshund')).toEqual('yogurt')
expect(test('saluki')).toEqual(undefined)
-->

Longstringers use many ternaries, complex template literals, deep nesting, multiple operations on the same line, long variable names (even in a very small scope), and so on.

On the other hand, _the shortstringers_ write code that looks like one side of a Christmas tree:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

```js
const puppiesByParent = puppies.reduce((acc, puppy) => {
  if (puppy.parentId) {
    const parent = puppies.find(x => x.id === puppy.parentId);
    if (parent.id in acc === false) {
      acc[parent.id] = [];
    }
    acc[parent.id].push(puppy.id);
  }
  return acc;
}, {});
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

Or:

<!-- const origin = 'https://example.com', intl = {formatMessage: () => 'test'} -->

```js
function getDownloadLink(hasTranslation) {
  if (hasTranslation) {
    const link = intl.formatMessage({ id: 'download-link' });
    return [origin, link].join('/');
  } else {
    return '/download';
  }
}
```

<!--
expect(getDownloadLink(true)).toEqual('https://example.com/test')
expect(getDownloadLink(false)).toEqual('/download')
-->

Or:

<!--
function test(breed) {
-->

```js
const FAVORITE_SNACKS = {
  dachshund: 'yogurt'
};
if (breed in FAVORITE_SNACKS) {
  return FAVORITE_SNACKS[breed];
}
```

<!--
}
expect(test('dachshund')).toEqual('yogurt')
expect(test('saluki')).toEqual(undefined)
-->

Shortstringer prefer early returns, extra functions and variables (to reduce the number of operations in one line and name things), shallow nesting, shorter variable names when the scope is small, and so on.

It’s easier to follow conditions, notice `return` statements in the functions, and generally see what’s happening. The important code, like adding new values to an object, isn’t buried somewhere in a very long line and separated from the data management code. The code has more whitespace and more distinctive shape which makes it easier to scan.

_I’m a shortstringer._

I> We talk more about separating data and data-managing code in the [Separate “what” and “how”](#what-how) section of the _Divide and conquer, or merge and relax_ chapter.

Another issue of the longstringer approach is that Prettier with a default setting of 80 characters will likely make the code ugly and quite unreadable:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

```js
const puppiesByParent = {};
puppies.forEach(puppy => {
  if (puppy.parentId) {
    const currentParent = puppies.find(
      currentPuppy => currentPuppy.id === puppy.parentId
    );
    puppiesByParent[currentParent.id] = [
      ...(puppiesByParent[currentParent.id] || []),
      puppy.id
    ];
  }
});
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

The shortstringer code stays the same.

## Make it easy to remember and use

Some conventions are easy to use, and some are not so much. Let’s compare three popular conventions for _title casing_:

- **Sentence case:** only the first word is capitalized, like in a regular sentence (example: _Breakfast: The most important book about the best meal of the day_).
- **Upper case:** all words are capitalized (example: _Breakfast: The Most Important Book About the Best Meal Of The Day_).
- **AP/APA:** see below (example: _Breakfast: The Most Important Book About the Best Meal of the Day_).

The first two are easy to remember: it’s all or nothing. The last one, however, not at all. Here are the rules of the AP/APA title style (quoted from the [ap-style-title-case](https://github.com/words/ap-style-title-case) package docs):

- always capitalize the first word, even if it’s a stop word;
- always capitalize the last word, even if it’s a stop word;
- lowercase these words: `a`, `an`, `and`, `at`, `but`, `by`, `for`, `in`, `nor`, `of`, `on`, `or`, `so`, `the`, `to`, `up`, `yet`.

> Many writers make the error of leaving `to be` verbs in lower case. Even though `is`, `are`, `was`, and `be`, are all short words, they should still be capitalized in a title because they are verbs.
>
> When you write titles that contain prepositions, your word processor will likely tell you that you should leave words like `with`, `about`, and `around` lowercase. Defiantly look past the squiggly line indicating a potential error, and remember that in AP title case, prepositions with four or more letters should be capitalized.

This is way too much to remember and it has too many exceptions to be practical. It also doesn’t make text more readable, and, to my taste, prettier. Automation could help with managing complexity, but then the convention should have significant benefits, and this one doesn’t. That’s why I use sentence case in all my writing, including this book.

This is an extreme case of an inconvenient convention. Programmers rarely go that far but sometimes they try.

One example is [Microsoft .NET naming conventions](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/capitalization-conventions), where they make a special case for two-letter acronyms:

> The PascalCasing convention, used for all identifiers except parameter names, capitalizes the first character of each word (including acronyms over two letters in length), as shown in the following examples: `PropertyDescriptor`, `HtmlTag`.
>
> A special case is made for two-letter acronyms in which both letters are capitalized, as shown in the following identifier: `IOStream`.

I don’t see how this improves anything: `IoStream` is easier to read than `IOStream`, and there’s no need to remember a special rule.

And then even Microsoft couldn’t follow their own guidelines with [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

So, choose the simplest convention, unless more complex rules bring huge benefits. If that is so, thoroughly document and automate it.

## To semicolon or not

JavaScript is one of the very few languages that doesn’t require a semicolon at the end of each line, but also doesn’t mind having them. This created countless arguments over the past two decades.

Normally, I’d say I don’t care, as long as it’s automated. But there’s one thing that made me prefer having semicolons in JavaScript after each line. This reason is called Automatic semicolon insertion (ASI): JavaScript will try to guess where to put semicolons when there are non in the code, and sometime it does it wrong. This is a perfect example:

<!-- prettier-ignore -->
```js
function semicolonOrNot() {
  return
  {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual(undefined) -->

Most people would expect that it returns an object but it returns `undefined` because ASI always puts a semicolon after a stray `return`, and the code is interpreted like so:

<!-- prettier-ignore -->
```js
function semicolonOrNot() {
  return;
  {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual(undefined) -->

To fix the problem, we need to remove a line break after the `return` statement:

<!-- prettier-ignore -->
```js
function semicolonOrNot() {
  return {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual({semi: "colon" }) -->

I prefer not to overload my brain with such questions and always use semicolons.

Luckily, _semicolonless_ JavaScript projects are far less common now than they used to be some ten years ago.

## Tabs or spaces

Doesn’t matter, as long as we have a linter or autoformatter to automatically make it right. With modern code editors there’s no difference, and most of the time I don’t even know what projects, I’m working on, are using.

I> We talk about linters in the [Lint your code](#linting) chapter, and about code formatters in [Autoformat your code](#formatting) chapter.

## The rest doesn’t matter

There are so many ways to write code. For example, we could use function parameters like this:

```js
function ingredientToString(options) {
  return `${options.name} (${options.quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString(options) {
  const { name, quantity } = options;
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString({ name, quantity }) {
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

I prefer the last one for the reasons I explain in the [Naming is hard](#naming) chapter, but I wouldn’t ask another developer to change their code just because they use another option: they are all fine.

A few more examples are below.

Old-style functions or arrow functions, explicit return or implicit return:

```js
function getDropdownOptions(options) {
  return options.map(option => option.value);
}
```

<!-- expect(getDropdownOptions([{value: 1}, {value: 2}])).toEqual([1, 2]) -->

Or:

```js
const getDropdownOptions = options =>
  options.map(option => option.value);
```

<!-- expect(getDropdownOptions([{value: 1}, {value: 2}])).toEqual([1, 2]) -->

Or the same with default export:

```jsx
const Button = props => (
  <button className="Button" {...props} />
);
export default Button;
```

<!--
const {container: c1} = RTL.render(<Button>Tacos</Button>);
expect(c1.textContent).toEqual('Tacos')
-->

Or:

```jsx
export default function Button(props) {
  return <button className="Button" {...props} />;
}
```

<!--
const {container: c1} = RTL.render(<Button>Tacos</Button>);
expect(c1.textContent).toEqual('Tacos')
-->

I can probably write a whole book of such examples, and let’s not forget the eternal debate of tabs versus spaces.

In all the examples above I prefer the last variation but I’d never ask someone to change their code during code review if they use another variation.

There’s zero code readability improvement. The code is just different, none of the variations are better than the other. And even the consistency argument isn’t good enough unless we can automate code replacement completely transparently for the developer. Otherwise, the cost of maintaining the convention would be too high.

## Conclusion

My rule of thumb here is: _automate or forget_. For example, [Prettier](https://prettier.io/) formats code with almost zero config, which saves an enormous amount of time while you write code, read someone else’s code or discuss code style in your team.

I> We talk about Prettier and code formatting in the [Autoformat your code](#formatting) chapter.

Be vigilant when you adapt [a popular code styles](https://sapegin.me/blog/javascript-code-styles/): many are too opinionated and want us to write code in a very specific way, even when it doesn’t improve the readability or maintainability of the code, or reduce the number of bugs.

Prefer explicit over implicit, write code to maximize readability but don’t be too strict with others when they don’t do it the same way you would. Next time you review someone else’s code and want to ask them to change a piece of code, ask yourself: does it really make code more readable and maintainable or just makes it look more familiar to me. If it’s the latter, please don’t write that comment.
