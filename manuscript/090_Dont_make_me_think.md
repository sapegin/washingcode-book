{#no-thinking}

# Don’t make me think

<!-- description: All the different ways programmers like to write clever code, and why we should avoid clever code as much as possible -->

Clever code is something we may see in job interview questions or language quizzes, when they expect us to know how a language feature, which we probably have never seen before, works. My answer to all these questions is: “it won’t pass code review”.

Some folks confuse _brevity_ with _clarity_. Short code (brevity) isn’t always the clearest code (clarity), often it’s the opposite. Striving to make your code shorter is a noble goal, but it should never come at the expense of readability.

There are many ways to express the same idea in code, and some are easier to understand than others. We should always aim to reduce the cognitive load of the next developer who reads our code. Every time we stumble on something that isn’t immediately obvious, we waste our brain’s resources.

I> I “stole” the name of this chapter from [Steve <!-- cspell:disable -->Krug’s<!-- cspell:enable --> book on web usability](https://www.amazon.com/Dont-Make-Think-Revisited-Usability/dp/0321965515/) with the same name.

## Dark patterns of JavaScript

Let’s look at some examples. Try to cover the answers and guess what these code snippets do. Then, count how many you guessed correctly.

**Example 1:**

```js
const percent = 5;
const percentString = percent.toString().concat('%');
```

<!-- expect(percentString).toBe('5%') -->

This code only adds the `%` sign to a number and should be rewritten as:

```js
const percent = 5;
const percentString = `${percent}%`;
// → 5%
```

<!-- expect(percentString).toBe('5%') -->

**Example 2:**

<!-- let result = false -->

```js
const url = 'index.html?id=5';
if (~url.indexOf('id')) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

The `~` symbol is called the _bitwise NOT_ operator. Its useful effect here is that it returns a falsy value only when `indexOf()` returns `-1`. This code should be rewritten as:

<!-- let result = false -->

```js
const url = 'index.html?id=5';
if (url.indexOf('id') !== -1) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Or, even better:

<!-- let result = false -->

```js
const url = 'index.html?id=5';
if (url.includes('id')) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

**Example 3:**

<!--
let result = (
-->

<!-- prettier-ignore -->
```js
~~3.14
```

<!--
)
expect(result).toBe(3)
-->

Another obscure use of the bitwise NOT operator is to discard the fractional portion of a number. Use `Math.floor()` instead:

<!--
let result = (
-->

<!-- prettier-ignore -->
```js
Math.floor(3.14)
// → 3
```

<!--
)
expect(result).toBe(3)
-->

**Example 4:**

<!--
const dogs = [1], cats = [2]
let result = false
-->

```js
if (dogs.length + cats.length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This one is understandable after spending some time with it, but it’s better to make it obvious:

<!--
const dogs = [1], cats = [2]
let result = false
-->

```js
if (dogs.length > 0 && cats.length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

**Example 5:**

```js
const header = 'filename="pizza.rar"';
const filename = header.split('filename=')[1].slice(1, -1);
```

<!-- expect(filename).toBe('pizza.rar') -->

This one took me a while to understand. Imagine we have a portion of a URL, such as `filename="pizza"`. First, we split the string by `=` and take the second part, `"pizza"`. Then, we slice the first and the last characters to get `pizza`.

I’d likely use a regular expression here:

```js
const header = 'filename="pizza.rar"';
const filename = header.match(/filename="(.*?)"/)[1];
// → pizza
```

<!-- expect(filename).toBe('pizza.rar') -->

Or, even better, the `URLSearchParams` API:

<!-- let URLSearchParams = window.URLSearchParams -->

```js
const header = 'filename="pizza.rar"';
const filename = new URLSearchParams(header)
  .get('filename')
  .replace(/^"|"$/g, '');
// → pizza
```

<!-- expect(filename).toBe('pizza.rar') -->

_These quotes are weird, though. Normally we don’t need quotes around URL parameters, so talking to the backend developer could be a good idea._

**Example 6:**

<!-- const condition = true -->

```js
const obj = {
  ...(condition && { value: 42 })
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

Here, we add a property to an object when the condition is true, otherwise we do nothing. The intention is more obvious when we explicitly define objects to destructure rather than relying on destructuring of falsy values:

<!-- const condition = true -->

```js
const obj = {
  ...(condition ? { value: 42 } : {})
};
// → { value: 42 }
```

<!-- expect(obj).toEqual({ value: 42 }) -->

I usually prefer when objects don’t change shape, so I’d move the condition inside the `value` field:

<!-- const condition = true -->

```js
const obj = {
  value: condition ? 42 : undefined
};
// → { value: 42 }
```

<!-- expect(obj).toEqual({ value: 42 }) -->

**Example 7:**

```js
const array = [...Array(10).keys()];
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

This [wonderful one-liner](https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n/33352604#33352604) creates an array filled with numbers from 0 to 9. `Array(10)` creates an array with 10 _empty_ elements, then the `keys()` method returns the keys (numbers from 0 to 9) as an iterator, which we then convert into a plain array using the spread syntax. Exploding head emoji…

We can rewrite it using a `for` loop:

```js
const array = [];
for (var i = 0; i < 10; i++) {
  array.push(i);
}
// → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

As much as I like to avoid loops in my code, the loop version is more readable for me.

Somewhere in the middle would be using the `Array.from()` method:

```js
const array = Array.from({ length: 10 }).map((_, i) => i);
// → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

Here, `Array.from({length: 10})` creates an array with 10 _undefined_ elements, then using the `map()` method, we fill the array with numbers from 0 to 9.

We can write it shorter by using `Array.from()`’s map callback:

```js
const array = Array.from({ length: 10 }, (_, i) => i);
// → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

Explicit `map()` is slightly more readable, and we don’t need to remember what the second argument of `Array.from()` does. Additionally, `Array.from({length: 10})` is slightly more readable than `Array(10)`. Though only slightly.

So, what’s your score? I think mine would be around 3/7.

## Gray areas

Some patterns tread the line between cleverness and readability.

For example, using `Boolean` to filter out falsy array elements (`null` and `0` in this example):

```js
const words = ['Not', null, 'enough', 0, 'cheese'].filter(
  Boolean
);
// → ['Not', 'enough', 'cheese']
```

<!-- expect(words).toEqual( ['Not', 'enough', 'cheese']) -->

I find this pattern acceptable; though it requires learning, it’s better than the alternative:

```js
const words = ['Not', null, 'enough', 0, 'cheese'].filter(
  item => !!item
);
// → ['Not', 'enough', 'cheese']
```

<!-- expect(words).toEqual( ['Not', 'enough', 'cheese']) -->

However, keep in mind that both variations filter out _falsy_ values, so if zeros or empty strings are important, we need to explicitly filter for `undefined` or `null`:

```js
const words = ['Not', null, 'enough', 0, 'cheese'].filter(
  item => item != null
);
// → ['Not', 'enough', 0, 'cheese']
```

<!-- expect(words).toEqual(['Not', 'enough', 0, 'cheese']) -->

## Make differences in code obvious

When I see two lines of tricky code that appear identical, I assume they differ in some way, but I don’t see the difference yet. Otherwise, a programmer would likely create a variable or a function for the repeated code instead of copypasting it.

For example, we have a code that generates test IDs for two different tools we use on a project, Enzyme and Codeception:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const props = {
  'data-enzyme-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null,
  'data-codeception-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null
};
// → {
//     'data-enzyme-id': 'type-Col-2',
//     'data-codeception-id': 'type-Col-2'
// }
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type-Col-2')
-->

It’s difficult to immediately spot any differences between these two lines of code. Remember those pairs of pictures where you had to find ten differences? That’s what this code does to the reader.

While I’m generally skeptical about extreme code DRYing, this is a good case for it.

I> We talk more about the Don’t repeat yourself principle in the [Divide and conquer, or merge and relax](#divide) chapter.

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const testId = columnName
  ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
  : null;
const props = {
  'data-enzyme-id': testId,
  'data-codeception-id': testId
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type-Col-2')
-->

Now, there’s no doubt that the code for both test IDs is exactly the same.

Sometimes, code that looks nearly identical has subtle differences:

<!-- let result, dispatch = x => result = x, changeIsWordDocumentExportSuccessful = x => x -->

```js
function handleSomething(documentId) {
  if (documentId) {
    dispatch(changeIsWordDocumentExportSuccessful(true));
    return;
  }
  dispatch(changeIsWordDocumentExportSuccessful(false));
}
```

<!--
handleSomething('pizza')
expect(result).toEqual(true);
handleSomething()
expect(result).toEqual(false);
-->

The only difference here is the parameter we pass to the function with a very long name. We can move the condition inside the function call:

<!-- let result, dispatch = x => result = x, changeIsWordDocumentExportSuccessful = x => x -->

```js
function handleSomething(documentId) {
  dispatch(
    changeIsWordDocumentExportSuccessful(
      documentId !== undefined
    )
  );
}
```

<!--
handleSomething('pizza')
expect(result).toEqual(true);
handleSomething()
expect(result).toEqual(false);
-->

This eliminates the similar code, making the entire snippet shorter and easier to understand.

Now, let’s look at a trickier example. Suppose we use different naming conventions for each testing tool:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const props = {
  'data-enzyme-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null,
  'data-codeception-id': columnName
    ? `${type}_${toTitleCase(columnName)}_${rowIndex}`
    : null
};
// → {
//     'data-enzyme-id': 'type-Col-2',
//     'data-codeception-id': 'type_Col_2'
// }
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

The difference between these two lines of code is hard to notice, and we can never be sure that the name separator (`-` or `_`) is the only difference here.

In a project with such a requirement, this pattern will likely appear in many places. One way to improve it is to create functions that generate test IDs for each tool:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const joinEnzymeId = (...parts) => parts.join('-');
const joinCodeceptionId = (...parts) => parts.join('_');
const props = {
  'data-enzyme-id': columnName
    ? joinEnzymeId(type, toTitleCase(columnName), rowIndex)
    : null,
  'data-codeception-id': columnName
    ? joinCodeceptionId(
        type,
        toTitleCase(columnName),
        rowIndex
      )
    : null
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

This is already much better, but it’s not perfect yet — the repeated code is still too large. Let’s fix this too:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const joinEnzymeId = (...parts) => parts.join('-');
const joinCodeceptionId = (...parts) => parts.join('_');
const getTestIdProps = (...parts) => ({
  'data-enzyme-id': joinEnzymeId(...parts),
  'data-codeception-id': joinCodeceptionId(...parts)
});
const props = columnName
  ? getTestIdProps(type, toTitleCase(columnName), rowIndex)
  : {};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

This is an extreme case of using small functions, and I generally try to avoid splitting code this much. However, in this case, it works well, especially if there are already many places in the project where we can use the new `getTestIdProps()` function.

Whenever we encounter a condition that makes code slightly different, we should ask ourselves: is this condition truly necessary? If the answer is “yes”, we should ask ourselves again. Often, there’s no _real_ need for a particular condition. For example, why do we even need to add test IDs for different tools separately? Can’t we configure one of the tools to use test IDs of the other? If we dig deep enough, we might find that no one knows the answer, or that the original reason is no longer relevant.

Consider this example:

```js
function getAssetDirs(config) {
  return config.assetsDir
    ? Array.isArray(config.assetsDir)
      ? config.assetsDir.map(dir => ({ from: dir }))
      : [{ from: config.assetsDir }]
    : [];
}
```

<!--
expect(getAssetDirs({})).toEqual([])
expect(getAssetDirs({assetsDir: 'pizza'})).toEqual([{from: 'pizza'}])
expect(getAssetDirs({assetsDir: ['pizza', 'tacos']})).toEqual([{from: 'pizza'}, {from: 'tacos'}])
-->

This code handles two edge cases: when `assetsDir` doesn’t exist, and when `assetsDir` isn’t an array. Also, the object generation code is duplicated. _(And let’s not talk about nested ternaries…)_ We can get rid of the duplication and at least one condition:

```js
function getAssetDirs(config) {
  const assetDirs = config.assetsDir
    ? _.castArray(config.assetsDir)
    : [];
  return assetDirs.map(from => ({
    from
  }));
}
```

<!--
expect(getAssetDirs({})).toEqual([])
expect(getAssetDirs({assetsDir: 'pizza'})).toEqual([{from: 'pizza'}])
expect(getAssetDirs({assetsDir: ['pizza', 'tacos']})).toEqual([{from: 'pizza'}, {from: 'tacos'}])
-->

I don’t like that Lodash’s [`castArray()` method](https://lodash.com/docs#castArray) wraps `undefined` in an array, which isn’t what I’d expect, but still, the result is simpler.

{#shortcuts}

## Avoid shortcuts

CSS has [shorthand properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties), and developers often overuse them. The idea is that a single property can define multiple properties at the same time. Here’s a good example:

```css
.block {
  margin: 1rem;
}
```

Which is the same as:

```css
.block {
  margin-top: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
}
```

One line of code instead of four, and it’s still clear what’s happening: we set the same margin on all four sides of an element.

Now, look at this example:

```css
.block-1 {
  margin: 1rem 2rem 3rem 4rem;
}
.block-3 {
  margin: 1rem 2rem 3rem;
}
.block-2 {
  margin: 1rem 2rem;
}
```

To understand what they do, we need to know that:

- when the `margin` property has four values, the order is top, right, bottom, left;
- when it has three values, the order is top, left/right, bottom;
- and when it has two values, the order is top/bottom, left/right.

This creates an unnecessary cognitive load, and makes code harder to read, edit, and review. I avoid such shorthands.

Another issue with shorthand properties is that they can set values for properties we didn’t intend to change. Consider this example:

```css
.block {
  font: italic bold 2rem Helvetica;
}
```

This declaration sets the Helvetica font family, the font size of 2rem, and makes the text italic and bold. What we don’t see here is that it also changes the line height to the default value of `normal`.

My rule of thumb is to use shorthand properties only when setting a single value; otherwise, I prefer longhand properties.

Here are some good examples:

```css
.block {
  /* Set margin on all four sides */
  margin: 1rem;

  /* Set top/bottom and left/right margins */
  margin-block: 1rem;
  margin-inline: 2rem;

  /* Set border radius to all four corners */
  border-radius: 0.5rem;

  /* Set border-width, border-style and border-color
   * This is a bit of an outlier but it’s very common and
   * it’s hard to misinterpret it because all values have
   * different types */
  border: 1px solid #c0ffee;

  /* Set top, right, bottom, and left position */
  inset: 0;
}
```

And here are some examples to avoid:

```css
.block {
  /* Set top/bottom and left/right margin */
  margin: 1rem 2rem;

  /* Set border radius to top-left/bottom-right,
   * and top-right/bottom-left corners */
  border-radius: 1em 2em;
  /* Set border radius to top-left, top-right/bottom-left,
   * and bottom-right corners */
  border-radius: 1em 2em 3em;
  /* Set border radius to top-left, top-right, bottom-right,
   * and bottom-left corners */
  border-radius: 1em 2em 3em 4em;

  /* Set background-color, background-image, background-repeat,
   * and background-position */
  background: #bada55 url(images/tacocat.gif) no-repeat left
    top;

  /* Set top, right, bottom, and left */
  inset: 0 20px 0 20px;
}
```

While shorthand properties indeed make the code shorter, they often make it significantly harder to read, so use them with caution.

{#parallel}

## Write parallel code

Eliminating conditions isn’t always possible. However, there are ways to make differences in code branches easier to spot. One of my favorite approaches is what I call _parallel coding_.

Consider this example:

<!-- let Link = ({href}) => href -->

```jsx
function RecipeName({ name, subrecipe }) {
  if (subrecipe) {
    return (
      <Link href={`/recipes/${subrecipe.slug}`}>{name}</Link>
    );
  }
  return name;
}
```

<!--
const {container: c1} = RTL.render(<RecipeName name="Tacos" subrecipe={{slug: 'salsa', name: 'Salsa'}} />);
expect(c1.textContent).toEqual('/recipes/salsa')
-->

It might be a personal pet peeve, but I dislike when the `return` statements are on different levels, making them harder to compare. Let’s add an `else` statement to fix this:

<!-- let Link = ({href}) => href -->

```jsx
function RecipeName({ name, subrecipe }) {
  if (subrecipe) {
    return (
      <Link href={`/recipes/${subrecipe.slug}`}>{name}</Link>
    );
  } else {
    return name;
  }
}
```

<!--
const {container: c1} = RTL.render(<RecipeName name="Tacos" subrecipe={{slug: 'salsa', name: 'Salsa'}} />);
expect(c1.textContent).toEqual('/recipes/salsa')
-->

Now, both return values are at the same indentation level, making them easier to compare. This pattern works when none of the condition branches are handling errors, in which case an early return would be a better approach.

I> We talk about early returns in the [Avoid conditions](#no-conditions) chapter.

Here’s another example:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => { return (
-->

```jsx
<Button
  onPress={
    Platform.OS !== 'web' ? onOpenViewConfirmation : undefined
  }
  link={Platform.OS === 'web' ? previewLink : undefined}
  target="_empty"
>
  Continue
</Button>
```

<!--
)}
const {container: c1} = RTL.render(<Render platform={{OS: 'web'}} />);
expect(c1.textContent).toEqual(previewLink)
const {container: c2} = RTL.render(<Render platform={{OS: 'native'}} />);
expect(c2.textContent).toEqual('')
-->

In this example, we have a button that behaves like a link in the browser and shows a confirmation modal in an app. The reversed condition for the `onPress` prop makes this logic hard to see.

Let’s make both conditions positive:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => { return (
-->

```jsx
<Button
  onPress={
    Platform.OS === 'web' ? undefined : onOpenViewConfirmation
  }
  link={Platform.OS === 'web' ? previewLink : undefined}
  target="_empty"
>
  Continue
</Button>
```

<!--
 )}
const {container: c1} = RTL.render(<Render platform={{OS: 'web'}} />);
expect(c1.textContent).toEqual(previewLink)
const {container: c2} = RTL.render(<Render platform={{OS: 'native'}} />);
expect(c2.textContent).toEqual('')
-->

Now, it’s clear that we either set `onPress` or `link` props depending on the platform.

We can stop here or take it a step further, depending on the number of `Platform.OS === 'web'` conditions in the component or how many props we need to set conditionally

We can extract the conditional props into a separate variable:

<!--
let Platform = {OS: 'web'}
let onOpenViewConfirmation = () => {}
let previewLink = 'http://example.com'
-->

```js
const buttonProps =
  Platform.OS === 'web'
    ? {
        link: previewLink,
        target: '_empty'
      }
    : {
        onPress: onOpenViewConfirmation
      };
```

<!-- expect(buttonProps).toHaveProperty('target', '_empty') -->

Then, use it instead of hardcoding the entire condition every time:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => {
  const buttonProps = Platform.OS === 'web'
    ? {
        link: previewLink,
        target: '_empty'
      }
    : {
        onPress: onOpenViewConfirmation
      };
  return (
-->

```jsx
<Button {...buttonProps}>Continue</Button>
```

<!--
)}
const {container: c1} = RTL.render(<Render platform={{OS: 'web'}} />);
expect(c1.textContent).toEqual(previewLink)
const {container: c2} = RTL.render(<Render platform={{OS: 'native'}} />);
expect(c2.textContent).toEqual('')
-->

I also moved the `target` prop to the web branch because it’s not used by the app anyway.

---

When I was in my twenties, remembering things wasn’t a huge problem for me. I could remember books I’ve read; I could recall books I’d read and all the functions of a project I was working on. Now that I’m in my forties, that’s no longer the case. I now value simple code that doesn’t use any tricks; I value search engines, quick access to the documentation, and tooling that help me to reason about the code and navigate the project without keeping everything in my head.

We shouldn’t write code for our present selves but for who we’ll be a few years from now. Thinking is hard, and programming demands a lot of it, even without having to decipher tricky or unclear code.

Start thinking about:

- When you feel smart and write some short, clever code, think if there’s a simpler, more readable way to write it.
- Whether a condition that makes code slightly different is truly necessary.
- Whether a shortcut makes the code shorter but still readable, or just shorter.
