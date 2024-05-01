{#dont-make-me-think}

# Don’t make me think

TODO: Function parameters as an object — named parameters pattern: [Callable values • JavaScript for impatient programmers](https://exploringjs.com/impatient-js/ch_callables.html#named-parameters)

There are many ways to express the same idea in the code. However, some of them are easier to understand then others.

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

Generally, I’m a bit sceptical about extreme code DRYing (don’t repeat yourself) but this is a good case for it:

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

Another way to make branches easier to compare is, of course, getting rid of the condition and replacing it with a map. We talk about this a lot in the [Avoid conditions](#avoid-conditions) chapter.

Now consider this example:

```js
const isSmall = size => size == '1' || size == '2' || size == '3';
```

<!--
expect(isSmall('2')).toBe(true)
expect(isSmall('5')).toBe(false)
-->

Here, we’re repeating the `size` three times, and this makes the values we compare it to further apart. We could use an array instaed:

```js
const isSmall = size => ['1', '2', '3'].includes(size);
```

<!--
expect(isSmall('2')).toBe(true)
expect(isSmall('5')).toBe(false)
-->

Now, all the value are grouped together which makes it more readable.

{#name-things}

## Name things

Often, it’s hard to understand what a certain value is when it doesn’t have a name. For example, it could a unobvious number, an obscure function parameter, or a complex condition. In all these cases, by giving a thing a name, we could tremendously improve code readability.

### Give names to magic numbers

We’ll cover this in great detail in the [Constants](#constants) chapter.

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

Even with TypeScript it’s hard to understand the meaning of each positional parameter in a function call when there are too many of them.

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

What are we disabling here? Don’t try to answer, it was a rhethorical question. We’ll never know that.

~~Wie viel Falafel ist zu viel Falafel?~~ How many is too many? In my experience, more than two is already too many. And an additional rule: any boolean is automatically too many.

The idiomatic fix here is converting all or some of the function parameters to an object:

<!-- let x; const appendScriptTag = (a, b) => x = b.useCORS -->

```js
appendScriptTag(`https://example.com/falafel.js`, { useCORS: false });
```

<!-- expect(x).toBe(false) -->

Now it’s obvious what this code does. Names serve as inline documentation.

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

---

When I was 20-years-old, it wasn’t a huge problem to remember things. I could remember books I’ve read, I could remember all the functions of a project I was working with... Now, that I’m almost 40, it’s no longer the case. Now, I value simple code that doesn’t use any tricks. Now, I value search engines, quck access to the docs, and tooling that allow me to reason about the code and navigate the project without remembering things.

We shouldn’t write code for our current selves but for our selves in 10 or 20 years from now. Thinking is hard and programming require a lot of thinking even without deciphering tricky or unclear code.
