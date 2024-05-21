{#thinking}

# Don’t make me think

Clever code is a kind of code we may see in job interview questions or language quizzes. When they expect us to know how a language feature, we probably have never seen before, works. My answer to all these questions is: “it won’t pass code review”.

Some people confuse _brevity_ with _clarity_. Short code (brevity) isn’t always the clearest code (clarity), often the opposite. Trying to make your code shorter is a noble goal but it should never make it harder to read.

There are many ways to express the same idea in the code. However, some of them are easier to understand then others. We should always try to reduce the cognitive load, the mental effort required to understand the code, of the next developer who’ll read out code. Every time we stumble on something that isn’t immediately obvious, we waist our brain’s resources.

## Dark patterns of JavaScript

Let’s look at some examples. Try to cover an answer and guess what these code snippets do. And count how many you’ve guessed right.

**Example 1:**

<!-- const percent = 5 -->

```js
const percentString = percent.toString().concat('%');
```

<!-- expect(percentString).toBe('5%') -->

This code only adds the `%` sing to a number, and should be rewritten as:

<!-- const percent = 5 -->

```js
const percentString = `${percent}%`;
```

<!-- expect(percentString).toBe('5%') -->

**Example 2:**

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
if (~url.indexOf('id')) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

The `~` is called the _bitwise NOT_ operator. It’s useful effect here is that it returns a falsy value only when the `indexOf()` returns `-1`. This code should be rewritten as:

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
if (url.indexOf('id') !== -1) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Or better:

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
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

Another dark use of the bitwise NOT operator to discard a fractional portion of a number. Use `Math.floor()` instead:

<!--
let result = (
-->

<!-- prettier-ignore -->
```js
Math.floor(3.14)
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

This one is easy when we spend some time with it, but better make this code obvious:

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

This one took me a lot of time to understand. Imagine we have a portion of a URL, like `filename="pizza"`. First, we split the string by `=` and take the second part, `"pizza"`. Then we slice the first and the last characters to get `pizza`.

I’d probably use a regular expression here:

```js
const header = 'filename="pizza.rar"';
const filename = header.match(/filename="(.*?)"/)[1];
```

<!-- expect(filename).toBe('pizza.rar') -->

Or the `URLSearchParams` API if I had access to it:

```js
const header = 'filename="pizza.rar"';
const filename = new URLSearchParams(header)
  .get('filename')
  .replace(/^"|"$/g, '');
```

<!-- expect(filename).toBe('pizza.rar') -->

_These quotes are weird though. Normally we don’t need quotes around URL params, so talking to the backend developer could be a good idea._

**Example 6:**

<!-- const condition = true -->

```js
const obj = {
  ...(condition && { value: 42 })
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

Adding a property to an object when the `condition` is true, don’t do anything otherwise. The intention is more obvious when we explicitly define object to destructure, and don’t rely on destructuring of falsy values:

<!-- const condition = true -->

```js
const obj = {
  ...(condition ? { value: 42 } : {})
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

I usually prefer when object don’t change their shapes, so I’d move the condition inside the `value` field:

<!-- const condition = true -->

```js
const obj = {
  value: condition ? 42 : undefined
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

**Example 7:**

```js
const array = [...Array(10).keys()];
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

This [wonderful one-liner](https://stackoverflow.com/a/33352604/1973105) fills an array with numbers from 0 to 9. `Array(10)` creates an array with 10 _empty_ items, then the `keys()` method returns the keys (numbers from 0 to 9) as an iterator, which we then convert into a plain array using the spread syntax. Exploding head emoji...

```js
const array = [];
for (var i = 0; i < 10; i++) {
  array.push(i);
}
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

As much as like to avoid loops in my code, the loop version is more readable for me.

Somewhere in the middle would be using the `Array.from()` method:

```js
const array = Array.from({ length: 10 }).map((_, i) => i);
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

Here, `Array.from({length: 10})` creates an array with 10 _empty_ items, then using the `map()` method we fill the array with numbers from 0 to 9.

We can write it shorter by using `Array.from`’s map callback:

```js
const array = Array.from({ length: 10 }, (_, i) => i);
```

<!-- expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) -->

Explicit `map()` is slightly more readable, and we don’t need to remember what the second argument of `Array.from()` does. And `Array.from({length: 10})` is slightly more readable than `Array(10)`. But only slightly.

So, what’s your score? I think mine would be around 3/7.

## Gray areas

Some patterns are on the border of cleverness.

For examples, using `Boolean` to filter out falsy array items:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(Boolean)
// -> ["Not", "enough", "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", "cheese."])
-->

I think this pattern is acceptable, and, though we need to learn it once, it’s better than the alternative:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => !!item)
// -> ["Not", "enough", "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", "cheese."])
-->

However, we should keep in mind that both variations filter out _falsy_ values, so if zeroes or empty strings are important to us, we need to explicitly filter for `undefined` or `null`:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => item != null)
// -> ["Not", "enough", 0, "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", 0, "cheese."])
-->

## Make differences in code obvious

When I see two lines of tricky code that look the same, I assume they are actually different but I don’t see the difference yet. Otherwise, a programmer would create a variable for repeated pieces instead of copypasting them.

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
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type-Col-2')
-->

Now it’s really hard to see if there’s any difference in these two lines of code. Remember these pairs of pictures where one had to spot ten differences? This is exactly what this kind of code does for the reader.

Generally, I’m a bit skeptical about extreme code DRYing (don’t repeat yourself, see the [Divide and conquer, or merge and relax](#divide-and-conquer) chapter) but this is a good case for it:

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

Now, there’s no doubt that the code for both test IDs is really the same.

Sometimes code that looks almost the same is slightly different:

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

The only difference here is the parameter we pass to our function with a very long name. We could move the condition inside the function call:

<!-- let result, dispatch = x => result = x, changeIsWordDocumentExportSuccessful = x => x -->

```js
function handleSomething(documentId) {
  dispatch(
    changeIsWordDocumentExportSuccessful(documentId !== undefined)
  );
}
```

<!--
handleSomething('pizza')
expect(result).toEqual(true);
handleSomething()
expect(result).toEqual(false);
-->

Now, we don’t have any similar code and the whole piece is shorter and easier to understand.

Let’s look at a more tricky example. Imagine, we use different naming conventions for different testing tools:

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
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

The difference between these two lines of code is hard to notice, and we can never be sure that the name separator (`-` vs. `_`) is the only difference here.

Most likely, on a project with such requirement, this pattern will appear in many places. One way to improve it is to create functions, that generate test IDs for each tool:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const joinEnzymeId = (...parts) => parts.join('-');
const joinCodeceptionId = (...parts) => parts.join('_');
const props = {
  'data-enzyme-id': columnName
    ? joinEnzymeId(type, toTitleCase(columnName), rowIndex)
    : null,
  'data-codeception-id': columnName
    ? joinCodeceptionId(type, toTitleCase(columnName), rowIndex)
    : null
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

This is already much better but not yet ideal: the repeated piece of code is still too large. Let’s fix this too:

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

This is an extreme case of using small functions and I generally try to avoid splitting code this far, but I think in this case it works well, assuming that there are already many places in the project where we can use the new `getTestIdProps()` function.

In all cases where we have a condition that makes code slightly different, we should ask ourselves: is this condition really necessary? If the answer is “yes”, then we should ask ourselves again. Often there’s no _real_ reason to have a certain condition. For example, why do we even need to add test IDs for different tools separately? Can’t we set up one of the tools to use test IDs of another? If we dig deep enough we may be surprised to find out that nobody knows the answer, or that the initial reason is no longer relevant.

Consider this example:

```js
const getAssetDirs = config =>
  config.assetsDir
    ? Array.isArray(config.assetsDir)
      ? config.assetsDir.map(dir => ({ from: dir }))
      : [{ from: config.assetsDir }]
    : [];
```

<!--
expect(getAssetDirs({})).toEqual([])
expect(getAssetDirs({assetsDir: 'pizza'})).toEqual([{from: 'pizza'}])
expect(getAssetDirs({assetsDir: ['pizza', 'tacos']})).toEqual([{from: 'pizza'}, {from: 'tacos'}])
-->

This code has two conditions for corner cases: `assetsDir` doesn’t exist and `assetsDir` isn’t an array. Also, the object generation code is duplicated. (And let’s not talk about nesting ternaries here...) We can get rid of duplication and at least one condition:

```js
const getAssetDirs = config =>
  config.assetsDir
    ? _.castArray(config.assetsDir).map(dir => ({ from: dir }))
    : [];
```

<!--
expect(getAssetDirs({})).toEqual([])
expect(getAssetDirs({assetsDir: 'pizza'})).toEqual([{from: 'pizza'}])
expect(getAssetDirs({assetsDir: ['pizza', 'tacos']})).toEqual([{from: 'pizza'}, {from: 'tacos'}])
-->

I don’t like that Lodash’s `castArray()` function wraps `undefined` in an array, which isn’t what I’d expect, but still the result is simpler.

## Avoid shortcuts

CSS has [shorthand properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties), and developers often overuse them. The idea is that we can use a single property to define several properties at the same time. Here’s a good example:

```css
.block {
  margin: 1rem;
}
```

Which would be the same as:

```css
.block {
  margin-top: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
}
```

One line of code instead of four, and still clear what’s happening: we set the same margin to all four sides of an element.

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

To understand what they do, we need to know that when `margin` property has four values, the order is top, right, bottom, left. When it has three values, the order is top, left/right, bottom. And when it has two values, the order is top/bottom, left/right. This creates unnecessary cognitive load, makes code harder to read, edit, and review. I avoid such shorthands.

Other problem with shorthand properties is that they may set properties we’re not expecting. Consider this example:

```css
.block {
  font: italic bold 2rem Helvetica;
}
```

This declaration sets Helvetica font family, font size of 2rem, and makes the text italic and bold. What we don’t see here is that it also changes line height to the default value of `normal`.

My rule of thumb is to only use shorthand properties when they set a single value, otherwise I use longhand properties.

These are good examples:

```css
.block {
  /* Set margin on all four sides */
  margin: 1rem;

  /* Set top/bottom and left/right margin */
  margin-block: 1rem;
  margin-inline: 2rem;

  /* Set border radius to all four corners */
  border-radius: 0.5rem;

  /* Set border-width, border-style and border-color
   * This is a bit of an outlier but it’s very common and it’s hard to
   * misinterpret it because all values have different types */
  border: 1px solid #c0ffee;

  /* Set top, right, bottom, and left */
  inset: 0;
}
```

And these are bad examples:

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
  background: #bada55 url(images/tacocat.gif) no-repeat left top;

  /* Set top, right, bottom, and left */
  inset: 0 20px 0 20px;
}
```

Shorthand properties indeed make the code shorter, but often they make it significantly harder to read, so use them with caution.

## Write parallel code

It’s not always possible to eliminate the condition. However there are ways to make the difference in code branches easier to spot. One of my favorite ways is what I call _parallel coding_.

Consider this example:

```jsx
function RecipeName({ name, subrecipe }) {
  if (subrecipe) {
    return <Link href={`/recipes/${subrecipe.slug}`}>{name}</Link>;
  }
  return name;
}
```

It might be my personal pet peeve but I dislike that the `return` statements are on different levels, which makes it harder to compare them. Let’s add an `else` statement to fix it:

```jsx
function RecipeName({ name, subrecipe }) {
  if (subrecipe) {
    return <Link href={`/recipes/${subrecipe.slug}`}>{name}</Link>;
  } else {
    return name;
  }
}
```

Now, both return values are on the same indentation level and it’s easier to compare them. This pattern works when none of the condition branches are handling errors, in which case an early return would be a better pattern (we talk about it in the [Avoid conditions](#avoid-conditions) chapter).

Here’s another example:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => { return (
-->

```jsx
<Button
  onPress={Platform.OS !== 'web' ? onOpenViewConfirmation : undefined}
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

In this example, we have a button that behaves like a link in the browser, and shows a confirmation modal in an app. Reversed condition for the `onPress` prop makes this logic hard to see.

Let’s make both conditions positive:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => { return (
-->

```jsx
<Button
  onPress={Platform.OS === 'web' ? undefined : onOpenViewConfirmation}
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

Now, it’s clear we either set `onPress` or `link` props depending on the platform.

We can stop here or go one step further, depending on the number of `Platform.OS === 'web'` conditions in this component or number of props we need to set conditionally.

If we often need to check the platform in the same component or module, I’d extract the condition into its own variable:

<!-- let Platform = {OS: 'web'} -->

```js
const isWeb = Platform.OS === 'web';
```

And use it instead of hardcoding the whole condition every time:

<!--
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Render = ({platform: Platform}) => {
  let isWeb = Platform.OS === 'web';
  return (
-->

```jsx
<Button
  onPress={isWeb ? undefined : onOpenViewConfirmation}
  link={isWeb ? previewLink : undefined}
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

However, if I had to set many props conditionally, I’d create a function that return an object with props:

```js
function getButtonLinkProps({ Platform, link, onPress }) {
  return Platform.OS === 'web'
    ? {
        link,
        target: '_empty'
      }
    : {
        onPress
      };
}
```

<!--
let link = 'http://example.com'
let onPress = () => {}
expect(getButtonLinkProps({Platform: {OS: 'web'}, link, onPress})).toEqual({link, target: '_empty'})
expect(getButtonLinkProps({Platform: {OS: 'native'}, link, onPress})).toEqual({onPress})
-->

We can spread the result of this function when we render our button:

<!--
function getButtonLinkProps({Platform, link, onPress}) {
  return Platform.OS === 'web' ? {
    link,
    target: "_empty"
  } : {
    onPress
  }
}
let Button = ({link}) => <button>{link}</button>
let previewLink = 'http://example.com'
let onOpenViewConfirmation = () => {}
let Platform = {OS: 'web'}
let Render = ({platform: Platform}) => { return (
-->

```jsx

<Button
        { ...getButtonLinkProps({Platform, link: previewLink, onPress: onOpenViewConfirmation })}
>
```

<!--
</Button> )}
const {container: c1} = RTL.render(<Render platform={{OS: 'web'}} />);
expect(c1.textContent).toEqual(previewLink)
const {container: c2} = RTL.render(<Render platform={{OS: 'native'}} />);
expect(c2.textContent).toEqual('')
-->

I’ve also moved the `target` prop to the web branch because it’s not used by the app anyway.

{#name-things}

## Name things

Often, it’s hard to understand what a certain value is when it doesn’t have a name. For example, it could a unobvious number, an obscure function parameter, or a complex condition. In all these cases, by giving a thing a name, we could tremendously improve code readability.

### Give names to magic numbers

We’ll cover this in great detail in the [Naming is hard chapter](#naming-is-hard) chapter.

### Name function parameters

Functions calls with multiple parameters could be hard understand. Consider this function call:

<!--
let x, action, location, currentState, currentParams, prevState, prevParams
const stateChangeSuccess = (...args) => x = args.length
-->

```js
stateChangeSuccess(
  action,
  location,
  currentState,
  currentParams,
  prevState,
  prevParams
);
```

<!-- expect(x).toBe(6) -->

Even with TypeScript, it’s hard to understand the meaning of each positional parameter in a function call when there are too many of them.

It could be even worse if some of the parameters are optional:

<!--
let x, target, fixedRequest, ctx
const resolver = { doResolve: (...args) => x = args.length }
-->

```js
resolver.doResolve(target, fixedRequest, null, ctx, (err, result) => {
  /* ... */
});
```

<!-- expect(x).toBe(5) -->

This `null` in the middle is grotesque, and who knows what was supposed to be there and why we’re not passing it?

However, probably the worst programming pattern of all times is positional boolean function parameters:

<!-- let x; const appendScriptTag = (a, b) => x=b -->

```js
appendScriptTag(`https://example.com/falafel.js`, false);
```

<!-- expect(x).toBe(false) -->

What are we disabling here? Don’t try to answer, it was a rhetorical question. We’ll never know that.

How many is too many? In my experience, more than two is already too many. And an additional rule: any boolean is automatically too many.

Some languages have _named parameters_ to solve this problems. For example, in Python we could do this:

```python
appendScriptTag('https://example.com/falafel.js', useCORS=false)
```

Now it’s obvious what this code does. Names serve as inline documentation.

Unfortunately, JavaScript doesn’t support named parameters yet, but we can use an object instead:

<!-- let x; const appendScriptTag = (a, b) => x = b.useCORS -->

```js
appendScriptTag(`https://example.com/falafel.js`, { useCORS: false });
```

<!-- expect(x).toBe(false) -->

The code is slightly more verbose than in Python but it achieves the same result.

### Name complex conditions

Some conditions are short and obvious and some are long and require us to understand the code well to make sense of them.

Consider this code:

<!-- let x; const useAuth = () => ({status: 'fetched', userDetails: {}}) -->

```js
function Toggle() {
  const { userDetails, status } = useAuth();

  if (status === 'fetched' && Boolean(userDetails)) {
    return null;
  }

  /* ... */
}
```

<!-- expect(Toggle()).toBe(null) -->

Here it’s hard to see why we’re shortcutting the function. However, if we give this condition a name:

<!-- let x; const useAuth = () => ({status: 'fetched', userDetails: {}}) -->

```js
function Toggle() {
  const { userDetails, status } = useAuth();
  const isUserLoggedIn = status === 'fetched' && Boolean(userDetails);

  if (isUserLoggedIn) {
    return null;
  }

  /* ... */
}
```

<!-- expect(Toggle()).toBe(null) -->

It makes the code clear and obvious: if we have user details after the data has been fetched, the user must be logged in.

## Conclusion

When I was 20-years-old, it wasn’t a huge problem to remember things. I could remember books I’ve read, I could remember all the functions of a project I was working with... Now, that I’m almost 40, it’s no longer the case. Now, I value simple code that doesn’t use any tricks. Now, I value search engines, quick access to the docs, and tooling that allow me to reason about the code and navigate the project without remembering things.

We shouldn’t write code for our current selves but for our selves in 10 or 20 years from now. Thinking is hard and programming require a lot of thinking even without deciphering tricky or unclear code.
