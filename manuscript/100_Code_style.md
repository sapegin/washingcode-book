{#code-style}

# Code style

<!-- description: Which code styles are actually improve readability and which are merely preferences that don’t matter much -->

I used to be very strict about [code style](https://sapegin.me/blog/prettier/). I thought my code style was better than others’, but later, I realized that it was just different. Also, it wasn’t the most popular, so anyone else’s code looked wrong to me.

For example, after reading [The Programmers’ Stone](https://www.datapacrat.com/Opinion/Reciprocality/r0/index.html), I was formatting braces like this for a long time:

<!-- let food = 'cake', alert = vi.fn() -->

<!-- prettier-ignore -->
```js
if (food === 'cake')
{
  alert('Cake!');
}
else
{
  alert('Not cake ;-(');
}
```

<!-- expect(alert).toHaveBeenCalledWith('Cake!') -->

I also used two spaces in front of inline comments to better separate them from the code:

<!-- prettier-ignore -->
```js
const volume = 200;  // ml
```

If any other developer touched my code, they would definitely make it inconsistent because it’s unlikely they would follow _my code style_ — so peculiar it was. Code reviews would also be a nightmare if I wanted to enforce _my code style_.

## Not all code styles are good

I wasn’t entirely wrong, though — not every code style makes code easy to read and maintain.

For example, this way of defining arrays makes it harder to move or add new elements:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'sheltie',
  'schnoodle'
];
```

Changing or removing an element at the end of the array requires modifying two lines. It also clutters diffs:

```diff
const dogs = [
  'dachshund',
  'sheltie',
-  'schnoodle'
+  'schnoodle',
+  'niffler'
];
```

_Trailing, or dangling, commas_ solve both problems without making code any harder to write or read:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'sheltie',
  'schnoodle',
];
```

Now to add a new element, we only need to change one line:

```diff
const dogs = [
  'dachshund',
  'sheltie',
  'schnoodle',
+  'niffler',
];
```

I> Nik Graf wrote [a great article on the benefits of dangling commas](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8).

If I had to choose the most annoying code style, it would be writing condition or loop bodies without braces:

<!-- function test(pizza) { -->

<!-- eslint-skip -->

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

It really damages code readability, and the longer the condition, the harder it is to see its body:

```js
function getIngredientNames(recipeDetails) {
  if (!recipeDetails?.allIngredients.length) return [];

  return recipeDetails?.allIngredients.map(x => x.name);
}
```

<!--
expect(getIngredientNames({allIngredients: []})).toEqual([]);
expect(getIngredientNames({allIngredients: [{name: 'tacos'}]})).toEqual(['tacos']);
-->

I’m 102% sure I’d miss the `return` statement here when reading this code for the first time.

T> My color theme, [Squirrelsong](https://sapegin.me/squirrelsong/), shows `!` and other operators in bold to make them more noticeable.

Compare it with:

```js
function getIngredientNames(recipeDetails) {
  if (!recipeDetails?.allIngredients.length) {
    return [];
  }

  return recipeDetails?.allIngredients.map(x => x.name);
}
```

<!--
expect(getIngredientNames({allIngredients: []})).toEqual([]);
expect(getIngredientNames({allIngredients: [{name: 'tacos'}]})).toEqual(['tacos']);
-->

Now, the `return` statement is more noticeable: it has its own line, braces create extra negative space around it, and, most importantly, it has the familiar shape of an `if` statement. Without braces, it looks like any other line (see the illustration).

![Shapes of if conditions without and with braces](images/if-shapes.svg)

Of course, there are worse ways to write such conditions:

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

Shorter isn’t always better _(though, I’m fine with `pizza?.()` sometimes)_.

T> Use `curly` ESLint rule to make sure all conditions have braces: see the [Lint your code](#linting) chapter.

The only exception is `else if`:

<!--
let console = { log: vi.fn(), error: vi.fn() }
let colorsColors = {
        green: (x) => `<green>${x}</green>`,
        red: (x) => `<red>${x}</red>`,
        yellow: (x) => `<yellow>${x}</yellow>`,
    }
let colors = {
    ...colorsColors,
    badge: () => colorsColors,
}
-->

```js
function printStatus(text, type) {
  if (type === 'error') {
    console.error(
      `${colors.badge().red(' FAIL ')} ${colors.red(text)}`
    );
  } else if (type === 'warning') {
    console.error(
      `${colors.badge().yellow(' WARN ')} ${colors.yellow(text)}`
    );
  } else {
    console.log(`${colors.badge().green(' DONE ')} ${text}`);
  }
}
```

<!--
console.log.mockClear()
printStatus('Taco', 'success')
expect(console.log).toHaveBeenCalledWith('<green> DONE </green> Taco')
console.error.mockClear()
printStatus('Taco', 'error')
expect(console.error).toHaveBeenCalledWith('<red> FAIL </red> <red>Taco</red>')
console.error.mockClear()
printStatus('Taco', 'warning')
expect(console.error).toHaveBeenCalledWith('<yellow> WARN </yellow> <yellow>Taco</yellow>')
-->

JavaScript doesn’t have the `elseif` operator like some other languages. However, we can “make” one by skipping braces on the `else` branch. It doesn’t reduce the readability because all the code is still inside braces, but this way we have all branches at the same nesting level, creating a _parallel structure_: all branches look like they belong to the same condition.

I> We talk more about parallel coding in the [Don’t make me think](#no-thinking) chapter.

## Obsolete code styles

Sometimes, developers follow a particular code style even when the initial reasoning behind it is no longer relevant.

For example, using leading commas in arrays and objects when JavaScript didn’t yet support trailing commas:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund'
, 'sheltie'
, 'schnoodle'
];
```

The goal of this style was the same as trailing commas in the previous section: to simplify adding new elements and make diffs more readable. However, there’s no reason to use it anymore; Internet Explorer 8 was the last browser that didn’t support trailing commas, and it was many, many years ago.

Another example is [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions), a style where a literal is on the left side of a condition:

<!-- let meaning = 42 -->

<!-- eslint-skip -->

```js
if (42 === meaning) {
  // …
}
```

<!-- expect($1).toBe(true) -->

It’s easy to accidentally type `=` instead of `==` in languages like C, resulting in an assignment:

<!-- let meaning = 0 -->

<!-- prettier-ignore -->
```js
// WARNING: This code is wrong
if (meaning = 42) {
  // Assigns 42 to `meaning`
}
```

<!-- expect(meaning).toBe(42) -->

Instead of a comparison:

<!-- let meaning = 42 -->
<!-- eslint-skip -->

```js
if (meaning == 42) {
  // Compares `meaning` to 42
}
```

<!-- expect($1).toBe(true) -->

This issue is much less relevant in JavaScript, where strict equality (`===`, requiring values and types to be equal) is the preferred style; enforced by a linter in most projects. Loose equality (`==`, requiring only values to be equal) is uncommon in modern JavaScript. It’s really hard to skip two equal signs when typing `===`, so the natural order of conditions is safe and more readable:

<!-- let meaning = 42 -->

```js
if (meaning === 42) {
  // Compares `meaning` to 42
}
```

<!-- expect($1).toBe(true) -->

## Nonsensical code styles

Some code styles don’t solve any particular problem but are expensive to maintain.

For example, aligning object values or the right-hand side of assignments horizontally to make them look “pretty”:

<!-- prettier-ignore -->
```js
var fs       = require('fs')
  , readme   = require('./readme')
  , examples = readme(fs.readFileSync('./README.md', 'utf8'))
  ;
```

<!-- expect(examples).toEqual('./README.md') -->

Editing code written in this style takes an enormous amount of work. Luckily, code formatters will remove all the artisanal, handcrafted spaces and make code look equally good without requiring any extra work from a developer:

```js
var fs = require('fs'),
  readme = require('./readme'),
  examples = readme(fs.readFileSync('./README.md', 'utf8'));
```

<!-- expect(examples).toEqual('./README.md') -->

I’d go one step further and replace the single `var` with one `var` per assignment (or even better, `const`):

```js
const fs = require('fs');
const readme = require('./readme');
const examples = readme(
  fs.readFileSync('./README.md', 'utf8')
);
```

<!-- expect(examples).toEqual('./README.md') -->

This will not only make it slightly more readable but also make it easier to add, remove, or move variable declarations.

I> We talk about code formatting in the [Autoformat your code](#formatting) chapter.

{#condition-expansion}

## Condition expansion

Some ways of writing code are more readable than others. For example, conditions, especially those with negations. I used to write them as concisely as possible; now, I prefer to be verbose and explicit. Saving a few keystrokes isn’t worth it when the code could be misinterpreted. It’s better to learn touch typing.

Consider this example:

<!--
let object = { o: 0 }
let isEmpty = _.isEmpty
-->

```js
if (!isEmpty(object)) {
  // Object is not empty
}
```

<!-- expect($1).toBe(true) -->

It’s hard to notice the logical NOT operator (`!`) here. We can replace the logical NOT operator with an explicit condition to avoid misunderstandings:

<!--
let object = { o: 0 }
let isEmpty = _.isEmpty
-->

```js
if (isEmpty(object) === false) {
  // Object is not empty
}
```

<!-- expect($1).toBe(true) -->

Someone may argue that it doesn’t read like English — “not is empty” — but there’s now way to miss the negation. This style is also less common than the one with `!`, but I think the readability benefits are worth adopting.

In some languages, negation is much more visible. For example, in Python:

```python
if not is_empty(object):
  # Object is not empty
```

Unfortunately, JavaScript inherited terse syntax from C that’s fast to type but might be hard to read later.

Here’s another example:

<!-- let guacamole = {} -->

```js
if (!('garlic' in guacamole)) {
  // No garlic here
}
```

<!-- expect($1).toBe(true) -->

This pattern was always awkward to write and read for me until my friend Oleg [opened up a whole new world to me](https://x.com/oleg008/status/1519593163803049984): we can use the same trick as above to make it more readable:

<!-- let guacamole = {} -->

```js
if ('garlic' in guacamole === false) {
  // No garlic here
}
```

<!-- expect($1).toBe(true) -->

Another area where expanding conditions improves readability is when checking array length.

Consider these two examples:

<!-- let puppies = [] -->

<!-- eslint-disable unicorn/explicit-length-check -->

```js
if (puppies.length) {
  // Has puppies
}

if (!puppies.length) {
  // Has no puppies
}
```

<!--
expect($1).toBe(false)
expect($2).toBe(true)
-->

They look almost the same, and it’s easy to miss the `!` in front of the second one. Let’s expand them:

<!-- let puppies = [] -->

```js
if (puppies.length > 0) {
  // Has puppies
}

if (puppies.length === 0) {
  // Has no puppies
}
```

<!--
expect($1).toBe(false)
expect($2).toBe(true)
-->

Now, the conditions look significantly different, and there’s no way to misinterpret them.

T> The [unicorn/explicit-length-check](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/explicit-length-check.md) linter rule requires and autofixes explicit length checks.

I’m starting to think that using `!` in conditions is [generally an antipattern](https://x.com/Jack_Franklin/status/1189477268764188672). Instead of:

<!-- let isFriday = false -->

```js
if (!isFriday) {
  // Not Friday yet :—(
}
```

<!-- expect($1).toBe(true) -->

We should always write:

<!-- let isFriday = false -->

```js
if (isFriday === false) {
  // Not Friday yet :—(
}
```

<!-- expect($1).toBe(true) -->

{#range-conditions}

## Range conditions

Another area where we can improve readability a bit is when checking whether a value is between two numbers. A naïve way to do so would be:

<!-- let x = 7 -->

```js
if (x > 3 && x < 13) {
  // The x is between 3 and 13
}
```

<!-- expect($1).toBe(true) -->

This reads as “x is greater than 3 _and_ less than 13,” which is fine, but we can still improve it:

<!-- let x = 7 -->

```js
if (3 < x && x < 13) {
  // The x is not between 3 and 13
}
```

<!-- expect($1).toBe(true) -->

Now, it’s easier to see that we want `x` to be _between_ 3 and 13.

We can use the same approach to check whether a value is outside a range:

<!-- let x = 7 -->

```js
if (x < 3 || 13 < x) {
  // The x is not between 3 and 13
}
```

<!-- expect($1).toBe(false) -->

{#readable-numbers}

## Readable numbers

One minor improvement in modern JavaScript is _numeric separators_, which let us to separate thousands with an underscore (`_`) to make large numbers easier to read:

<!-- eslint-disable unicorn/numeric-separators-style -->

```js
const earthToSun1 = 149597870700;
const earthToSun2 = 149_597_870_700;
```

{#tree-vs-kebab}

## Christmas trees against kebabs

Some developers seem to prefer long lines of code, some — short.

_The longliners_ write code that looks like a kebab on a long skewer:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

<!-- prettier-ignore -->
```js
const puppiesByParent = {}
for (const puppy of puppies) {
  if (puppy.parentId) {
    const currentParent = puppies.find(currentPuppy => currentPuppy.id === puppy.parentId)
    puppiesByParent[currentParent.id] = [...(puppiesByParent[currentParent.id] || []), puppy.id]
  }
}
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

Or:

<!--
const origin = 'https://example.com', intl = {formatMessage: () => 'test'}
function test(hasTranslation) {
-->

<!-- prettier-ignore -->
```js
const downloadLink = hasTranslation ? `${origin}/${intl.formatMessage({id: 'download-link'})}` : `${origin}/download`;
```

<!--
  return downloadLink
}
expect(test(true)).toEqual('https://example.com/test')
expect(test(false)).toEqual('https://example.com/download')
-->

Longliners use many ternaries, complex template literals, deep nesting, multiple operations on the same line, and long variable names (even in very small scopes).

On the other hand, _the shortliners_ write code that looks like one side of a Christmas tree:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

```js
const puppiesByParent = {};
for (const puppy of puppies) {
  if (puppy.parentId === undefined) {
    continue;
  }

  const parent = puppies.find(x => x.id === puppy.parentId);
  if (puppiesByParent[parent.id] === undefined) {
    puppiesByParent[parent.id] = [];
  }
  puppiesByParent[parent.id].push(puppy.id);
}
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

Or:

<!--
const origin = 'https://example.com', intl = {formatMessage: () => 'test'}
function test(hasTranslation) {
-->

```js
const link = hasTranslation
  ? intl.formatMessage({ id: 'download-link' })
  : 'download';
const downloadLink = [origin, link].join('/');
```

<!--
  return downloadLink
}
expect(test(true)).toEqual('https://example.com/test')
expect(test(false)).toEqual('https://example.com/download')
-->

Shortliners prefer early returns, extra functions and variables (to reduce the number of operations on one line and to name things), shallow nesting, shorter variable names when the scope is small, and so on.

It’s easier to follow conditions, notice `return` statements in functions, and generally understand what’s happening in the code. Important code, such as adding new values to an object, isn’t buried somewhere in a very long line, and separated from the data management logic. The code has more negative space and a more distinctive shape, making it easier to scan.

_I’m a shortliner._

I> We talk more about separating data and data-managing code in the [Separate “what” and “how”](#what-how) section of the _Divide and conquer, or merge and relax_ chapter.

Another issue with the longliner’s approach is that Prettier, with a default print length of 80 characters, will likely make the code ugly and unreadable:

<!-- const puppies = [{id: 1, name: 'Dessi', parentId: 3 },{id: 2, name: 'Tsiri', parentId: 3 },{id: 3, name: 'Cthulhu' },] -->

```js
const puppiesByParent = {};
for (const puppy of puppies) {
  if (puppy.parentId) {
    const currentParent = puppies.find(
      currentPuppy => currentPuppy.id === puppy.parentId
    );
    puppiesByParent[currentParent.id] = [
      ...(puppiesByParent[currentParent.id] || []),
      puppy.id
    ];
  }
}
```

<!-- expect(puppiesByParent).toEqual({3: [1, 2]}) -->

The shortliner’s code stays the same.

## Make it easy to remember and use

Some conventions are easy to use, while some are not so much. Let’s compare three popular conventions for _title casing_:

- **Sentence case:** only the first word is capitalized, like in a regular sentence (example: _Breakfast: The most important book about the best meal of the day_).
- **Upper case:** all words are capitalized (example: _Breakfast: The Most Important Book About The Best Meal Of The Day_).
- **AP/APA:** see below (example: _Breakfast: The Most Important Book About the Best Meal of the Day_).

The first two are easy to remember: it’s all or nothing. The last one, however, is not easy at all. Here are the rules of the AP/APA title style (quoted from the [ap-style-title-case](https://github.com/words/ap-style-title-case) package documentation):

- always capitalize the first word, even if it’s a stop word;
- always capitalize the last word, even if it’s a stop word;
- lowercase these words: `a`, `an`, `and`, `at`, `but`, `by`, `for`, `in`, `nor`, `of`, `on`, `or`, `so`, `the`, `to`, `up`, `yet`.

> Many writers make the error of leaving `to be` verbs in lower case. Even though `is`, `are`, `was`, and `be`, are all short words, they should still be capitalized in a title because they are verbs.
>
> When you write titles that contain prepositions, your word processor will likely tell you that you should leave words like `with`, `about`, and `around` lowercase. Defiantly look past the squiggly line indicating a potential error, and remember that in AP title case, prepositions with four or more letters should be capitalized.

This is way too much to remember, and it has too many exceptions to be practical. It breaks in software used by writers, such as Microsoft Word (requiring a special remark). It also doesn’t make text more readable or, to my taste, prettier. While automation could help manage this complexity, the convention doesn’t offer significant enough benefits to justify it. That’s why I use sentence case in all my writing, including in this book.

This is an extreme example of an inconvenient convention. Programmers rarely go to such lengths, but sometimes they try.

One example is [Microsoft .NET naming conventions](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/capitalization-conventions), where they make a special case for two-letter acronyms:

> The PascalCasing convention, used for all identifiers except parameter names, capitalizes the first character of each word (including acronyms over two letters in length), as shown in the following examples: `PropertyDescriptor`, `HtmlTag`.
>
> A special case is made for two-letter acronyms in which both letters are capitalized, as shown in the following identifier: `IOStream`.

I don’t see how this improves anything: `IoStream` is easier to read than `IOStream`, and there’s no need to remember a special rule.

And then even Microsoft couldn’t consistently follow their own guidelines, as we an see with [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

So, choose the simplest convention, unless more complex rules bring huge benefits. If they do, thoroughly document and automate them.

{#sections-etc}

## Sections, paragraphs, phrases…

In prose writing, we have several tools to make text more scannable (meaning, we don’t need to read it all to find a particular place we need) or separate different ideas. These tools are headings, paragraphs, and emphases (such as bold or italic).

It’s the same when we write code.

_Function declarations_ and _comment blocks_ create distinct _sections_ in the code:

```js
/**
 * Return the range for the:
 * - selection
 * - word + tags under cursor
 * - word under cursor
 */
function getWordRange(pattern) {
  /* … */
}
```

<!-- expect(getWordRange()).toBe(undefined) -->

_Empty lines_ further divide the code into _paragraphs_:

<!--
let window = {
  activeTextEditor: {
    selection: { isEmpty: () => false, start: 11, end: 22 },
    document: { getWordRangeAtPosition: (start, pattern) => start }
  }
}
-->

```js
function getWordRange(pattern) {
  const editor = window.activeTextEditor;

  if (editor.selection.isEmpty === false) {
    return editor.selection;
  }

  const taggedRange = editor.document.getWordRangeAtPosition(
    editor.selection.start,
    pattern
  );
  if (taggedRange) {
    return taggedRange;
  }

  return editor.document.getWordRangeAtPosition(
    editor.selection.start
  );
}
```

<!-- expect(getWordRange(/taco/)).toBe(11) -->

Adding a short comment before each code paragraph is often a good idea:

<!--
let window = {
  activeTextEditor: {
    selection: { isEmpty: () => false, start: 11, end: 22 },
    document: { getWordRangeAtPosition: (start, pattern) => start }
  }
}
-->

```js
function getWordRange(pattern) {
  const editor = window.activeTextEditor;

  // If something is selected, return the range of selection
  if (editor.selection.isEmpty === false) {
    return editor.selection;
  }

  // Word is already wrapped in the tags: _tacocat_
  const taggedRange = editor.document.getWordRangeAtPosition(
    editor.selection.start,
    pattern
  );
  if (taggedRange) {
    return taggedRange;
  }

  // Otherwise, return the default range for the word: tacocat
  return editor.document.getWordRangeAtPosition(
    editor.selection.start
  );
}
```

<!-- expect(getWordRange(/taco/)).toBe(11) -->

I> Art and design have the concept of [negative space](https://en.wikipedia.org/wiki/Negative_space), which is space between the subjects of an image (known as positive space). In an artwork, negative space is as important as the subject itself. In many artworks, there’s a lot more negative space than positive space. Code also has negative space, which helps us quickly identify particular elements, such as functions, conditions, or loops. This includes the use of whitespace, indentation, and braces.

_Parentheses_ highlight individual _phrases_, and improve readability on the smallest level, for example, in conditions:

<!--
let isString = () => true, shouldBeFile = () => true, shouldBeDirectory = () => true
let value = 'taco', types = []
-->

```js
if (
  isString(value) &&
  (shouldBeFile(types) || shouldBeDirectory(types))
) {
  /* … */
}
```

<!-- // Nothing really to test here -->

Similarly to prose, we can make our code easier to scan — to find a particular place we need, and easier to understand each function; once we fond the right one. I much prefer this approach to splitting code into many small functions.

I> We talk about splitting code into functions in the [Divide and conquer, or merge and relax](#divide) chapter.

## To semicolon or not

JavaScript is one of the very few languages that doesn’t require semicolons at the end of each line, but it also doesn’t mind having them. This has sparked countless debates since the 1990s.

Normally, I wouldn’t mind either way, as long as it’s automated. However, there’s one reason I prefer using semicolons in JavaScript: _automatic semicolon insertion_ (ASI). JavaScript tries to guess where to put semicolons when there are none in the code, and sometimes it does it wrong. Here’s a perfect example:

<!-- prettier-ignore -->
```js
// WARNING: This code is incorrect
function semicolonOrNot() {
  return
  {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual(undefined) -->

Most programmers would expect this function to return an object, but it returns `undefined` because ASI always inserts a semicolon after a stray `return`. The code is interpreted like so:

<!-- prettier-ignore -->
```js
// WARNING: This code is incorrect
function semicolonOrNot() {
  return;
  {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual(undefined) -->

To fix the problem, we need to remove the line break after the `return` statement:

<!-- prettier-ignore -->
```js
function semicolonOrNot() {
  return {
    semi: 'colon'
  }
}
```

<!-- expect(semicolonOrNot()).toEqual({semi: "colon" }) -->

I prefer not to overload my squirrel brain with such silly questions, and I always use semicolons.

Fortunately, _semicolonless_ JavaScript projects are much less common now than they were in the 2000s and 2010s.

## Tabs or spaces

It doesn’t matter, as long as we have a linter or autoformatter to make it right automatically. With modern code editors, there’s no difference, and most of the time, I don’t even know whether a project uses spaces or tabs.

I> We talk about linters in the [Lint your code](#linting) chapter and about code formatters in [Autoformat your code](#formatting) chapter.

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

I prefer the last one for reasons I explain in the [Naming is hard](#naming) chapter, but I wouldn’t ask another developer to change their code just because they use a different approach: they are all fine.

A few more examples are below.

Old-style functions or arrow functions, explicit returns or implicit returns:

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

Or the same with the default export:

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

I can probably write a whole book of such examples…

These differences don’t affect readability. The code is just different; no variation is better than another. Even the argument for consistency isn’t strong enough unless we can automate code replacement completely transparently for the developer. Otherwise, the cost of maintaining the convention would be too high.

---

Some programmers become defensive or even angry when promoting their preferred code style. This isn’t the way.

My rule of thumb here is: _automate or forget_. For example, [Prettier](https://prettier.io/) formats code with almost zero config, which saves an enormous amount of time writing code, reading someone else’s code, or discussing code style in a team.

I> We talk about Prettier and code formatting in the [Autoformat your code](#formatting) chapter.

Be vigilant when you adapt [a popular code style](https://sapegin.me/blog/javascript-code-styles/): many are too opinionated and want us to write code in a very specific way, even when it doesn’t improve the readability or maintainability of the code or reduce the number of bugs.

I’m very happy that extremely opinionated style guides like [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) or [JavaScript Standard Style](https://standardjs.com/) are now history.

Prefer explicit over implicit; write code to maximize readability, but don’t be too strict with others when they approach it differently.

Start thinking about:

- Does the suggestion I’m about to make in a code review really makes the code more readable and maintainable, or is it just making the code look more familiar to me.
