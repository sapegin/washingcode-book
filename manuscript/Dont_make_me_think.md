## Don’t make me think

TODO: Pass an object instead of multiple positional arguments to a function (more than two)

TODO: Magic numbers -> consts

TODO: Consts should include units

> Long Parameter List More than three or four parameters for a method.

### Make differences in code obvious

When I see two lines of tricky code that look the same, I assume they are actually different but I don’t see the difference yet. Otherwise, a programmer would create a variable for repeated pieces instead of copypasting them.

For example, we have a code that generates test IDs for two different tools we use on our project, Enzyme and Codeception:

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

Now it’s really hard to see if there’s any difference in these two lines of code. Remember these pictures where you have to find 10 differences? That’s what such code does for the reader.

Generally I’m bit sceptical about extreme dont-repeat-yourselfing the code, but this is a good case for it:

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

Now there’s no doubt that the code for both test IDs is really the same.

Sometimes code that looks almost the same is slightly different:

<!-- const dispatch = () => {}, changeIsWordDocumentExportSuccessful = () => {} -->

```js
function handleSomething(documentId) {
  if (documentId) {
    dispatch(changeIsWordDocumentExportSuccessful(true));
    return;
  }
  dispatch(changeIsWordDocumentExportSuccessful(false));
}
```

The only difference here is the parameter we pass to our function with a very long name. We could move the condition inside the function call:

<!-- const dispatch = () => {}, changeIsWordDocumentExportSuccessful = () => {} -->

```js
function handleSomething(documentId) {
  dispatch(changeIsWordDocumentExportSuccessful(!!documentId));
}
```

Now we don’t have any similar code and the whole piece is shorter and easier to understand.

Let’s look at a more tricky example. Imagine we use different naming conventions for different testing tools:

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

The difference between these two lines of code is hard to notice, and you can never be sure that the name separator is the only difference here.

Likely, if you have such a requirement on your project, there are many places with very similar code. One way to improve it is to create a function, that generates test IDs for each tool:

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

This is already much better but still not ideal: there may be difference in parameters we pass to our generator functions. Let’s fix this too:

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

This is an extreme case of using small functions and I generally try to avoid splitting code that far, but I think in this case it works well, assuming that there are already many places in the project where you can use the `getTestIdProps` function.

In all cases where you have a condition that makes code slightly different, ask yourself: is this condition really necessary? If the answer is “yes”, then ask yourself again. Often there’s no _real_ reason to have these conditions. Like why do we even need to add test IDs for different tools separately? If you dig deep enough you may be surprised to find out that nobody knows the answer, or that the initial reason is no longer relevant.
