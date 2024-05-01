{#divide-and-conquer}

# Divide and conquer, or merge and relax

TODO: `util` and `utils` (what about them?): keep each function in it’s own file

TODO: I’m not a huge fan of teeny-tiny functions in general

> Aside: Make a util directory and keep different utilities in different files. A single util file will always grow until it is too big and yet too hard to split apart. Using a single util file is unhygienic.

It’s nice to have a global Button component but if it’s too flexible and has a dozen of boolean props to switch between different variations, it will be difficult to use. However, if it’s too strict, developers will create their own button components instead of using a shared one.

## Let abstractions grow

We, developers, hate to do the same work twice. _Don’t repeat yourself_ (DRY) is our mantra. But when we have two or three pieces of code that kinda do the same thing, it may be still too early to introduce an abstraction, no matter how tempting it may feel.

Live with the pain of code duplication for a while, maybe it’s not so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows us to iterate and evolve code faster, without caring so much that we break something.

It’s also hard to come up with a good API when we only consider a few use cases.

It’s hard to manage shared code in large projects with many teams. New requirements for one team may not work for another team and break their code, or we end up with unmaintainable spaghetti monster with dozens of conditions.

Imagine team A is adding a comment form: a name, a message, and a submit button. Then team B needs a feedback form, so they find team A’s component and try to reuse it. Then team A also wants an email field, but they don’t know that team B uses their component, so they add a required email field, and break the feature for team A users. Then team B needs a phone number field, but they know that team A is using the component without it, so they add an option to show a phone number field. A year later two teams hate each other for breaking each other’s code, and a component is full of conditions and impossible to maintain. Both teams would save a lot of time and have healthier relationships by maintaining separate components composed of lower lever shared components, like an input field or a button.

Sometimes, we have to roll back an abstraction. When we start adding conditions and options, we should ask ourselves: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and parameters to a module can make the API hard to use.

[Duplication is cheaper](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) and healthier than the wrong abstraction.

I think the higher level of the code is, the longer we should wait before we abstract it. Low-level utility abstractions are much more obvious than business logic.

## Separate code that changes often

_Code reuse_ isn’t the only and not the most important reason to extract a piece of code into a separate module.

_Code length_ is often [used as a metric](https://softwareengineering.stackexchange.com/questions/27798/what-should-be-the-maximum-length-of-a-function) when we should split a module or a function into two, but size alone doesn’t make code hard to read or maintain.

In my experience, the most useful reasons to split code are _change frequency_ and _change reason_.

Let’s start from _change frequency_. Business logic is changing much more often than utility functions. It makes sense to keep code, that changes often, separately from the code that is mostly static.

The comment form in the previous section is an example of the former, a function that converts `camelCase` strings to `kebab-case` is an example of the latter. The comment form is likely to change and diverge with time when new business requirements arrive, the conversion function is unlikely to change at all and it’s safe to reuse in many places.

Imagine, we’re making a nice looking table with editable fields. We may think we’ll never need this table design again, so we decide to keep the whole table in a single module.

Next sprint we have a task to add another column to the table, so we copy the code of an existing column and change a few lines there. Next sprint we have a task to change a design of a table.

Now our module has at least two _reasons to change_, or _responsibilities_:

- new business requirements, like a new table column;
- design changes, like replacing borders with striped row backgrounds.

This makes the module harder to understand and harder to change: to do a change in any of the responsibilities we need to read and modify more code. This makes it harder and slower to iterate on both, business logic and design.

Extraction of a generic table as a separate module solves this problem. Now to add another column to a table, we only need to understand and modify one of the two modules. We don’t need to know anything about the generic table module, except its public API.

Even code reuse can be a valid reason to separate code here: if we use some design pattern on one page, we’ll likely need it on another page soon.

## Keep together code that changes together

It might be tempting to extract every function to its own module. And there are benefits to this approach, like easier testing and reuse.

However, we should be vigilant with letting others reuse our code. If we put a function that was used only once to a separate module, other developers may think that they can reuse it somewhere else, when in reality this function is likely not generic and not tested enough to be reused.

I prefer to keep small functions, that are used only in one module, at the beginning of this module. This makes reusing such functions somewhere else difficult and awkward. If we need to test these functions (and we should!), we could export them from the module.

The same applies to functions that are meant to be used only together with a certain module. Keeping them inside this module makes it clearer and these functions more discoverable.

Another benefit is that when we delete a module, we automatically delete its dependencies.

If we often have to change several modules or functions at the same time, it may be better to merge them into a single module or a function. [Ducks convention](https://github.com/erikras/ducks-modular-redux) for Redux is a great example of that.

This is sometimes called _colocation_. Another example here is React components: keeping everything a component needs in the same file, including markup, styles and logic, makes it easier to change, move and delete such component. The common complaint about this approach is that it makes components too large. If that’s the case, it’s better to extract some parts into their own components, together with their markup, styles and logic.

_Change reason_ is also known as the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle): “every module, class, or function should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class”.

It might be a good idea to no allow other teams use our code unless it’s designed and marked as shared. [Dependency cruiser](https://github.com/sverweij/dependency-cruiser) is a tool that could help to set up such rules on a project.

## Sweep that ugly code under the rug

Sometimes, we have to use an API that’s especially difficult to use, or requre several steps in a particular order with particular parameters that are always the same. This is a good reason to create a utility function to make sure we always to it right. As a bonus: we could now write tests for this piece of code.

Various string manipulations, like URLs and filenames, are often good candidates for abstraction. And most likely, there’s already a library for what we’re trying to do.

Consider this example:

<!-- const file = 'pizza.exe' -->

```js
const prefix = file.slice(0, -4);
```

<!-- expect(prefix).toEqual('pizza') -->

It’ll take some time to understand that this code remove the file extension and return the base name. Not only it’s unnecessary hard to read, it also assumes that the extension is always three characters, which might not be the case.

Let’s rewrite it using a library to parse filenames (Node.js `path` module):

<!-- const file = 'pizza.exe' -->

```js
const prefix = path.parse(file).name;
```

<!-- expect(prefix).toEqual('pizza') -->

Now it’s clear what’s happening, no magic numbers, and works with any file extension lengh.

## Bless the inline refactoring!

Sometimes we get carried away and produce abstractions that don’t make code easier to read or even shorter:

```js
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

The best thing we can do in this case it to apply the _inline refactoring_: replace each usage of these functions with their bodies. No abstraction, no problem.

First example becomes:

```js
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

And the second becomes:

```js
const favoriteTaco = [
  'Al pastor',
  'Cochinita pibil',
  'Barbacoa'
].find(x => x === 'Cochinita pibil');
```

<!-- expect(favoriteTaco).toEqual('Cochinita pibil') -->

The result is not just shorter and more readable, now the reader won’t need to guess what these function do since we use JavaScript native functions and features without home-baked abstractions.

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

It looks totally fine, and won’t raise any questions during code review. However, every time we try to use these values, autocompletion will show just `number` instead of actual values. This makes it harder to choose the right value.

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
};
```

<!-- expect(spacing.xlarge).toEqual(32) -->

Now we have less code, it’s easier to understand, and autocompletion show the actual values. And I don’t think this code will change often, probably never.

![Autocompletion with literal values](images/autocompletion-literals.png)

---

The biggest challenge with abstractions is finding a balance, and knowing where to start abstracting things and when to stop. It’s worth waiting to see whether we really need to abstract something, and often it’s better not to. And before adding another option to an abstraction, think whether this new use case really belongs there.
