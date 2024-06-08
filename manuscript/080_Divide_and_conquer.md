{#divide}

# Divide and conquer, or merge and relax

<!-- description: Splitting code into functions and modules, when is the right time to introduce an abstraction, and when it’s better to wait -->

<!-- cspell:ignore favs -->

It’s nice to have a global Button component but if it’s too flexible and has a dozen of boolean props to switch between different variations, it will be difficult to use. However, if it’s too strict, developers will create their own button components instead of using a shared one.

## Let abstractions grow

We, developers, hate to do the same work twice. DRY is a mantra of many. However, when we have two or three pieces of code that kinda do the same thing, it may be still too early to introduce an abstraction, no matter how tempting it may feel.

I> The [Don’t repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) (DRY) principle demands that “every piece of knowledge must have a single, unambiguous, authoritative representation within a system”, which is often interpreted as _any code duplication is strictly verboten_.

Live with the pain of code duplication for a while; maybe it’s not so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows us to iterate and evolve code faster without caring so much that we break something.

It’s also hard to come up with a good API when we only consider a couple of use cases.

It’s hard to manage shared code in large projects with many developers and teams. New requirements for one team may not work for another team and break their code, or we end up with unmaintainable spaghetti monster with dozens of conditions.

Imagine team A is adding a comment form to their page: a name, a message, and a submit button. Then team B needs a feedback form, so they find team A’s component and try to reuse it. Then team A also wants an email field, but they don’t know that team B uses their component, so they add a required email field and break the feature for team A users. Then team B needs a phone number field, but they know that team A is using the component without it, so they add an option to show a phone number field. A year later, two teams hate each other for breaking each other’s code, and a component is full of conditions and is impossible to maintain. Both teams would save a lot of time and have healthier relationships with each other if they maintained separate components composed of lower-lever shared components, like an input field or a button.

Sometimes, we have to roll back an abstraction. When we start adding conditions and options, we should ask ourselves: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and parameters to a module can make the API hard to use and the code hard to maintain and test.

Duplication is cheaper and healthier than the wrong abstraction.

I> See Sandi Metz’s article [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction) for a great explanation.

The higher level of the code is, the longer we should wait before we abstract it. Low-level utility abstractions are much more obvious and stable than business logic.

## Size doesn’t always matter

_Code reuse_ isn’t the only or even most important reason to extract a piece of code into a separate function or module.

_Code length_ is often [used as a metric](https://softwareengineering.stackexchange.com/questions/27798/what-is-proven-as-a-good-maximum-length-of-a-function) when we should split a module or a function, but size alone doesn’t make code hard to read or maintain, and often splitting code into many teeny-tiny functions makes it harder to read and modify.

You probably won’t find a lot of small functions in my code. In my experience, the most useful reasons to split code are _change frequency_ and _change reason_.

## Separate code that changes often

Let’s start with the _change frequency_. Business logic is changing much more often than utility functions. It makes sense to keep code that changes often separately from the code that is very stable.

The comment form in the previous section is an example of the former; a function that converts camelCase strings to kebab-case is an example of the latter. The comment form is likely to change and diverge with time when new business requirements arrive; the conversion function is unlikely to change at all, and it’s safe to reuse in many places.

Imagine that we’re making a nice-looking table with editable fields. We may think we’ll never need this table design again, so we decide to keep the whole table in a single module.

Next sprint, we get a task to add another column to the table, so we copy the code of an existing column and change a few lines there. Next sprint, we need to change the design of the table…

Our table module has at least two _reasons to change_, or _responsibilities_:

- new business requirements, like a new table column;
- design changes, like replacing borders with striped row backgrounds.

This makes the module harder to understand and harder to change: to make a change in any of the responsibilities, we need to read and modify more code. This makes it harder and slower to iterate on both: business logic and design.

The extraction of a generic table as a separate module solves this problem. Now, to add another column to a table, we only need to understand and modify one of the two modules. We don’t need to know anything about the generic table module except its public API.

Even code reuse can be a valid reason to separate code: if we use some component on one page, we’ll likely need it on another page soon.

## Keep together code that changes together

It might be tempting to extract every function into its own module. And there are benefits to this approach, like easier testing and reuse. However, we should be vigilant about letting others reuse our code. If we add a function that was used only once into a separate module, other developers may think that they can reuse it somewhere else. However, in reality, this function is likely not generic enough or tested enough to be reused.

I prefer to keep small functions that are used only in one module at the beginning of this module. This makes reusing such functions somewhere else difficult and awkward. If we need to test these functions (and we should!), we could export them from the module.

The same applies to functions that are meant to be used only together with a certain module. Keeping them inside this module makes it clearer and makes these functions more discoverable when editing the module where they are supposed to be used.

Another benefit is that when we delete a module, we automatically delete its dependencies. Code in shared modules often stays in the codebase forever because it’s often hard to know whether it’s used anywhere or not (TypeScript makes it much easier, though).

If we often have to change several modules or functions at the same time, it may be better to merge them into a single module or function. This is sometimes called _colocation_.

A couple of examples of colocation:

- [Ducks convention](https://github.com/erikras/ducks-modular-redux) for Redux: keep related actions, action creators, and reducers in the same file (for example, `src/ducks/feature.js`), as opposed to having three files in separate folders (for example, `src/actions/feature.js`, `src/actionCreators/feature.js`, and `src/reducers/feature.js`).
- React components: keeping everything a component needs in the same file, including markup (JSX), styles (CSS in JS), and logic. Also, keeping tests next to the component file. For example, `src/components/Button.tsx`, and `src/components/Button.test.ts`.

I> Kent C. Dodds has [a nice article on colocation](https://kentcdodds.com/blog/colocation).

A common complaint about this approach is that it makes components too large. If that’s the case, it’s better to extract some parts into their own components, together with their markup, styles and logic.

The idea of colocation also conflicts with _separation of concerns_: an outdated idea that led web developers to keep HTML, CSS, and JavaScript in separate files (and often in separate folders) for too long and made us edit three files at the same time to make even the most basic changes on web pages.

I> The _change reason_ is also known as the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle): “every module, class, or function should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class.”

T> It might be a good idea to forbid other teams to use our code unless it’s designed and marked as shared. The [Dependency cruiser](https://github.com/sverweij/dependency-cruiser) is a tool that could help set up such rules on a project.

## Sweep that ugly code under the rug

Sometimes, we have to use an API that’s especially difficult to use or error-prone. For example, it requires several steps in a particular order with particular parameters that are always the same. This is a good reason to create a utility function to make sure we always do it right. As a bonus, we could now write tests for this piece of code.

Various string manipulations, like URLs or filenames, are often good candidates for abstraction. And most likely, there’s already a library for what we’re trying to do.

Consider this example:

<!-- const file = 'pizza.exe' -->

```js
const prefix = file.slice(0, -4);
```

<!-- expect(prefix).toEqual('pizza') -->

It’ll take some time to understand that this code removes the file extension and returns the base name. Not only it’s unnecessary hard to read, but it also assumes that the extension is always three characters, which might not be the case.

Let’s rewrite it using a library to parse filenames (Node.js’ `path` module):

<!-- const file = 'pizza.exe' -->

```js
const prefix = path.parse(file).name;
```

<!-- expect(prefix).toEqual('pizza') -->

Now, it’s clear what’s happening, there are no magic numbers, and it works with file extensions of any length.

Other candidates for abstraction are dates, device capabilities, internationalization, and so on. I’d recommend looking for an existing library before writing a new utility function. We often underestimate the complexity of seemingly simple functions.

## Bless the inline refactoring!

Sometimes we get carried away and produce abstractions that don’t make code easier to read or even shorter:

```jsx
// my_feature_util.js
const noop = () => {};

export const Utility = {
  noop
  // Many more functions...
};

// MyComponent.js
function MyComponent() {
  return <h1>Hola!</h1>;
}

MyComponent.defaultProps = {
  onClick: Utility.noop
};
```

<!--
expect(Utility.noop()).toEqual(undefined)
expect(MyComponent.defaultProps.onClick()).toEqual(undefined)
-->

Another example:

```js
const findByReference = (wrapper, reference) =>
  wrapper.find(reference);

const favoriteTaco = findByReference(
  ['Al pastor', 'Cochinita pibil', 'Barbacoa'],
  x => x === 'Cochinita pibil'
);
```

<!-- expect(favoriteTaco).toEqual('Cochinita pibil') -->

The best thing we can do in such cases is to apply the almighty _inline refactoring_: replace each usage of these functions with their bodies. No abstraction, no problem.

The first example becomes:

```jsx
function MyComponent() {
  return <h1>Hola!</h1>;
}

MyComponent.defaultProps = {
  onClick: () => {}
};
```

<!--
expect(MyComponent.defaultProps.onClick()).toEqual(undefined)
-->

And the second example becomes:

```js
const favoriteTaco = [
  'Al pastor',
  'Cochinita pibil',
  'Barbacoa'
].find(x => x === 'Cochinita pibil');
```

<!-- expect(favoriteTaco).toEqual('Cochinita pibil') -->

The result is not just shorter and more readable; now the reader won’t need to guess what these functions do, since we use JavaScript native functions and features without home-baked abstractions.

In many cases, a bit of repetition is good. Consider this example:

```ts
const baseSpacing = 8;
const spacing = {
  tiny: baseSpacing / 2,
  small: baseSpacing,
  medium: baseSpacing * 2,
  large: baseSpacing * 3,
  xlarge: baseSpacing * 4,
  xxlarge: baseSpacing * 5
};
```

<!-- expect(spacing.xlarge).toEqual(32) -->

It looks totally fine, and won’t raise any questions during a code review. However, every time we try to use these values, autocompletion will show just `number` instead of the actual values. This makes it harder to choose the right value.

![Autocompletion with calculated values](images/autocompletion-formula.png)

We could inline the `baseSpacing` constant:

```ts
const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 40
} as const;
```

<!-- expect(spacing.xlarge).toEqual(32) -->

Now, we have less code, it’s equally easy to understand, and autocompletion shows the actual values. And I don’t think this code will often change — probably never.

![Autocompletion with literal values](images/autocompletion-literals.png)

{#what-how}

## Separate “what” and “how”

Consider this excerpt from a form validation function:

```jsx
function validate(values) {
  const errors = {};

  if (!values.name || (values.name && values.name.trim() === '')) {
    errors.name = 'Name is required';
  }

  if (!values.login || (values.login && values.login.trim() === '')) {
    errors.login = 'Login is required';
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = 'No spaces are allowed in login';
  }

  // This goes on and on for a dozen of other fields...

  return errors;
}
```

<!--
expect(validate({name: 'Chuck', login: 'chuck'})).toEqual({})
expect(validate({name: '', login: 'chuck'})).toEqual({name: 'Name is required'})
expect(validate({name: 'Chuck', login: ''})).toEqual({login: 'Login is required'})
expect(validate({name: 'Chuck', login: 'c norris'})).toEqual({login: 'No spaces are allowed in login'})
-->

It’s quite difficult to grasp what’s going on here: validation logic is mixed error messages, many checks are repeated…

We could split this function into several pieces, each responsible for one thing only:

- a list of validations for a particular form;
- a collection of validation functions (like `isEmail()`);
- a function that validates all form values using a list of validations.

The list could be written declaratively, as an array of validations and error messages:

<!--
let hasStringValue = value => value?.trim() !== ''
let hasNoSpaces = value => value?.includes(' ') === false
-->

```js
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
  {
    field: 'login',
    validation: hasStringValue,
    message: 'Login is required'
  },
  {
    field: 'login',
    validation: hasNoSpaces,
    message: 'No spaces are allowed in login'
  }
  // All other validations...
];
```

<!--
expect(validations[0].validation('tacocat')).toBe(true)
expect(validations[0].validation('')).toBe(false)
expect(validations[1].validation('tacocat')).toBe(true)
expect(validations[1].validation('')).toBe(false)
expect(validations[2].validation('tacocat')).toBe(true)
expect(validations[2].validation('taco cat')).toBe(false)
-->

Each validation and the function that runs them are pretty generic, and are good candidates for an abstraction or looking for a third-party library.

So now, we can add validation for any form by describing which fields need which validations and what error to show in each case.

I> See the [Avoid conditions](#no-conditions) chapter for the complete code of this example, and more detailed explanation.

I call this process _separating of “what” and “how”_. The benefits are:

- **Readability:** the “what” can often be written in a declarative way, using basic data structures like arrays and objects.
- **Maintainability:** we change “what” much more often than “how”, and now they are separated. The “what” can be imported from a file (like JSON), or loaded from a database, so updates don’t require code changes.
- **Reusability:** often the “how” is generic and can be reused, or even imported from a third-party library.
- **Testability:** each validation and the validation runner function are isolated and can be tested separately.

There are many more examples of such refactorings in this book.

## Avoid monster utility files

Many projects have a file called `utils.js`, `helpers.js`, or `misc.js` where developers throw utility functions when they can’t find a better place for them. Often, these functions are never reused anywhere else and stay in the utility file forever, so it keeps growing. That’s how _monster utility files_ are born.

Monster utility files have several issues:

- **Poor discoverability:** since all functions are in the same file, we can’t use fuzzy file opener to find them.
- **May outlive their callers:** often such functions are never reused again and stay in the codebase, even after the code that was using them is removed.
- **Not generic enough:** such functions are often made for a single use case and won’t cover other use cases.

My rules of thumb are these:

- If the function is small and used only once, keep it in the same module where it’s used.
- If the function is long or used more than once, put it in a separate file in `util`, `shared`, or `helpers` folder.
- If we want more organization, instead of creating files like `utils/validators.js`, we can group related function (each in its own file) in a folder: `utils/validators/isEmail.js`.

## Stay hydrated

To troll the DRYers (developers who never repeat their code), someone invented another term: [WET](https://overreacted.io/the-wet-codebase/), _write everything twice_, or _we enjoy typing_, meaning we should duplicate code at least twice until we replace it with an abstraction. It is a joke, and I don’t fully agree with the idea (sometimes it’s okay to duplicate some code more than twice), but it’s a good reminder that all good things are good in moderation.

Consider this example:

<!--
let visitStory = () => {}
let tester = { should: () => {}, click: () => {} }
let cy = { findByText: () => tester, findByTestId: () => tester, }
let it = (_, fn) => fn()
-->

```js
const stories = {
  YOUR_RECIPES: 'page--your-recipes',
  ALL_RECIPES: 'page--all-recipes',
  CUISINES: 'page--cuisines',
  RECIPE: 'page--recipe'
};

const testIds = {
  ADD_TO_FAVORITES: 'add-to-favs-button',
  QR_CLOSE: 'qr-close-button',
  QR_CODE: 'qr-code',
  MOBILE_CTA: 'transfer-button'
};

const copyTesters = {
  titleRecipe: /Cochinita Pibil Tacos/,
  titleYourRecipes: /Your favorite recipes on a single page/,
  addedToFavorites: /In favorites/
  // Many more lines...
};

it('Your recipes', () => {
  visitStory(stories.RECIPE);

  cy.findByText(copyTesters.titleRecipe).should('exist');

  cy.findByTestId(testIds.ADD_TO_FAVORITES).click();
  cy.findByText(copyTesters.addedToFavorites).should('exist');

  // Lots of lines in similar style...
});
```

<!-- // No actual test, just executing the code -->

This is an extreme example of code DRYing, and it doesn’t make the code more readable or more maintainable. Especially with most of these constants used only once. Seeing variable names instead of actual strings is unhelpful.

Let’s inline all these extra variables. (Unfortunately, inline refactoring in Visual Studio Code doesn’t support inlining object properties, so we have to do it manually.)

<!--
let visitStory = () => {}
let tester = { should: () => {}, click: () => {} }
let cy = { findByText: () => tester, findByTestId: () => tester, }
let it = (_, fn) => fn()
-->

```js
it('Your recipes', () => {
  visitStory('page--recipe');

  cy.findByText(/Cochinita Pibil Tacos/).should('exist');

  cy.findByTestId('add-to-favs-button').click();
  cy.findByText(/In favorites/).should('exist');

  // Lots of lines in similar style...
});
```

<!-- // No actual test, just executing the code -->

Now, we have significantly less code, and it’s easier to understand what’s going on and easier to update or delete tests.

I’ve seen so many hopeless abstractions in tests. For example, this pattern is very common:

<!--
let Pony = () => null
let mount = () => ({find: () => ({ prop: () => {} })})
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```jsx
let wrapper;
beforeEach(() => {
  wrapper = mount(<Pony color="pink" />);
});

test('pony has pink tail', () => {
  expect(wrapper.find('.tail').prop('value')).toBe('pink');
});

// More tests that use `wrapper`...
```

<!-- // No actual test, just executing the code -->

This pattern tries to avoid duplication of `mount(...)` in each test case, but it makes tests more confusing than they should be. Let’s inline `mount()` calls:

<!--
let Pony = () => null
let mount = () => ({find: () => ({ prop: () => {} })})
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```jsx
test('pony has pink tail', () => {
  const wrapper = mount(<Pony color="pink" />);
  expect(wrapper.find('.tail').prop('value')).toBe('pink');
});

// More tests that use `wrapper`...
```

<!-- // No actual test, just executing the code -->

In addition, `beforeEach` pattern only works when we want to initialize each test case with the same values, which is rarely the case:

<!--
let Pony = () => null
let mount = () => ({find: () => ({ prop: () => {} })})
let expect = () => ({toBe: () => {}, toBeVisible: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```jsx
test('pony has pink tail', () => {
  const wrapper = mount(<Pony color="pink" />);
  expect(wrapper.find('.tail').prop('value')).toBe('pink');
});

test('pony can breath fire', () => {
  const wrapper = mount(<Pony color="pink" breathFire />);
  expect(wrapper.find('.fire')).toBeVisible();
});
```

<!-- // No actual test, just executing the code -->

To avoid _some_ duplication when testing React components, I often add `defaultProps` object and spread it inside each test case:

<!--
let Pony = () => null
let mount = () => ({find: () => ({ prop: () => {} })})
let expect = () => ({toBe: () => {}, toBeVisible: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```jsx
const defaultProps = { color: 'pink' };

test('pony has pink tail', () => {
  const wrapper = mount(<Pony {...defaultProps} />);
  expect(wrapper.find('.tail').prop('value')).toBe('pink');
});

test('pony can breath fire', () => {
  const wrapper = mount(<Pony {...defaultProps} breathFire={true} />);
  expect(wrapper.find('.fire')).toBeVisible();
});
```

<!-- // No actual test, just executing the code -->

This way we don’t have too much duplication but at the same time each test case is isolated and readable: the difference between test cases is now clearer because it’s easier to see unique props of each test case.

Here’s a more extreme variation of the same pattern:

<!--
let getSelector = (x) => x
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```js
let css;
let res;

beforeEach(() => {
  css = '';
  res = '';
});

test('works with basic selectors', () => {
  css = 'div\n{}';
  res = 'div\n';
  expect(getSelector(css)).toBe(res);
});

test('works with lobotomized owl selector', () => {
  css = '.stack > * + *\n{}';
  res = '.stack > * + *\n';
  expect(getSelector(css)).toBe(res);
});

// More tests that use `css` and `res`...
```

<!-- // No actual test, just executing the code -->

We can inline `beforeEach()` the same way we did in the previous example:

<!--
let getSelector = (x) => x
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```js
test('works with basic selectors', () => {
  const css = 'div\n{}';
  const res = 'div\n';
  expect(getSelector(css)).toBe(res);
});

test('works with lobotomized owl selector', () => {
  const css = '.stack > * + *\n{}';
  const res = '.stack > * + *\n';
  expect(getSelector(css)).toBe(res);
});

// More tests that use `css` and `res`...
```

<!-- // No actual test, just executing the code -->

I’d go even further, and use `test.each()` method because we run the same test with a bunch of different inputs:

<!--
let getSelector = (x) => x
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = {each: () => (_, fn) => fn()}
-->

```js
test.each([
  ['div\n{}', 'div\n'],
  ['.stack > * + *\n{}', '.stack > * + *\n']
  // More inputs...
])('selector: %s', (css, expected) => {
  expect(getSelector(css)).toBe(expected);
});
```

<!-- // No actual test, just executing the code -->

Now, we collected all the test inputs with their expected results in one place, and it’s easier to add new test cases.

## Conclusion

The biggest challenge with abstractions is finding a balance between being too rigid and too flexible, and knowing where to start abstracting things and when to stop. It’s worth waiting to see whether we really need to abstract something — often it’s better not to.

Start thinking about:

- Colocating related code in the same file or folder to make it easier to change, move, or delete.
- Before adding another option to an abstraction, think whether this new use case really belongs there.
- Before making tests DRY, think whether is would make them more readable and maintainable, or a bit of code duplication isn’t an issue.
