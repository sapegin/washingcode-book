{#divide}

# Divide and conquer, or merge and relax

<!-- description: Splitting code into functions and modules, when the right time is to introduce an abstraction, and when it’s better to sleep on it -->

<!-- cspell:ignore favs -->

It’s nice to have a global button component, but if it’s too flexible and has a dozen boolean props to switch between different variations, it will be difficult to use. However, if it’s too rigid, developers will create their own button components instead of using a shared one.

{#grow-abstractions}

## Let abstractions grow

We, developers, hate to do the same work twice. DRY is a mantra for many. However, when we have two or three pieces of code that kind of do the same thing, it may be still too early to introduce an abstraction, no matter how tempting it may feel.

I> The [Don’t repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) (DRY) principle demands that “every piece of knowledge must have a single, unambiguous, authoritative representation within a system”, which is often interpreted as _any code duplication is strictly verboten_.

Live with the pain of code duplication for a while; maybe it’s not so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows us to iterate and evolve code faster without the fear of breaking something.

It’s also hard to come up with a good API when we only consider a couple of use cases.

Managing shared code in large projects with many developers and teams is difficult. New requirements for one team may not work for another Team and break their code, or we end up with an unmaintainable spaghetti monster with dozens of conditions.

Imagine Team A is adding a comment form to their page: a name, a message, and a submit button. Then, Team B needs a feedback form, so they find Team A’s component and try to reuse it. Then, Team A also wants an email field, but they don’t know that Team B uses their component, so they add a required email field and break the feature for Team B users. Then, Team B needs a phone number field, but they know that Team A is using the component without it, so they add an option to show a phone number field. A year later, the two teams hate each other for breaking each other’s code, and the component is full of conditions and is impossible to maintain. Both teams would save a lot of time and have healthier relationships with each other if they maintained separate components composed of lower-level shared components, like an input field or a button.

T> It might be a good idea to forbid other teams from using our code unless it’s designed and marked as shared. The [Dependency cruiser](https://github.com/sverweij/dependency-cruiser) is a tool that could help set up such rules.

Sometimes, we have to roll back an abstraction. When we start adding conditions and options, we should ask ourselves: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and parameters to a module can make the API hard to use and the code hard to maintain and test.

Duplication is cheaper and healthier than the wrong abstraction.

I> See Sandi Metz’s article [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction) for a great explanation.

The higher the level of the code, the longer we should wait before we abstract it. Low-level utility abstractions are much more obvious and stable than business logic.

## Size doesn’t always matter

_Code reuse_ isn’t the only, or even most important, reason to extract a piece of code into a separate function or module.

_Code length_ is often [used as a metric](https://softwareengineering.stackexchange.com/questions/27798/what-is-proven-as-a-good-maximum-length-of-a-function) for when we should split a module or a function, but size alone doesn’t make code hard to read or maintain.

Splitting a linear algorithm, even a long one, into several functions and then calling them one after another rarely makes the code more readable. Jumping between functions (and even more so — files) is harder than scrolling, and if we have to look into each function’s implementation to understand the code, then the abstraction wasn’t the right one.

<!-- cspell:disable -->

I> Egon Elbre wrote a nice article on [psychology of code readability](https://egonelbre.com/psychology-of-code-readability/).

<!-- cspell:enable -->

Here’s an example, adapted from the [Google Testing Blog](https://testing.googleblog.com/2023/09/use-abstraction-to-improve-function.html):

<!--
let checkOvenInterval = 100
let cookTime = 2000
let cookingTemp = 240
let vegToppings = ['champignon'], meatToppings = ['pig']
let time = {sleep: () => {}}
let getOvenTemp = () => 250

class Pizza {
  toppings = []
  baked = false
  boxed = null
  sliced = null
  ready = null
  base = null
  sauce = null
  cheese = null
  constructor({base, sauce, cheese}) {
    this.base = base
    this.sauce = sauce
    this.cheese = cheese
  }
}
class Oven {
  temp = 20
  insert() {}
  remove() {}
}
class Box {
  putIn() { return true }
  slicePizza() { return true }
  close() { return true }
}
-->

```js
function createPizza(order) {
  const pizza = new Pizza({
    base: order.size,
    sauce: order.sauce,
    cheese: 'Mozzarella'
  });

  if (order.kind === 'Veg') {
    pizza.toppings = vegToppings;
  } else if (order.kind === 'Meat') {
    pizza.toppings = meatToppings;
  }

  const oven = new Oven();

  if (oven.temp !== cookingTemp) {
    while (oven.temp < cookingTemp) {
      time.sleep(checkOvenInterval);
      oven.temp = getOvenTemp(oven);
    }
  }

  if (!pizza.baked) {
    oven.insert(pizza);
    time.sleep(cookTime);
    oven.remove(pizza);
    pizza.baked = true;
  }

  const box = new Box();
  pizza.boxed = box.putIn(pizza);
  pizza.sliced = box.slicePizza(order.size);
  pizza.ready = box.close();

  return pizza;
}
```

<!--
let pizza = createPizza({size: 30, sauce: 'red', kind: 'Meat'})
expect(pizza).toEqual({
  baked: true,
  base: 30,
  sauce: 'red',
  cheese: 'Mozzarella',
  toppings: ['pig'],
  boxed: true,
  sliced: true,
  ready: true
})
-->

I have so many questions about the API of the `Pizza` class, but let’s see what improvements the authors suggest:

<!--
let checkOvenInterval = 100
let cookTime = 2000
let cookingTemp = 240
let vegToppings = ['champignon'], meatToppings = ['pig']
let time = {sleep: () => {}}
let getOvenTemp = () => 250

class Pizza {
  toppings = []
  baked = false
  boxed = null
  sliced = null
  ready = null
  base = null
  sauce = null
  cheese = null
  constructor({base, sauce, cheese}) {
    this.base = base
    this.sauce = sauce
    this.cheese = cheese
  }
}
class Oven {
  temp = 20
  insert() {}
  remove() {}
}
class Box {
  putIn() { return true }
  slicePizza() { return true }
  close() { return true }
}
-->

```js
function prepare(order) {
  const pizza = new Pizza({
    base: order.size,
    sauce: order.sauce,
    cheese: 'Mozzarella'
  });
  addToppings(pizza, order.kind);
  return pizza;
}

function addToppings(pizza, kind) {
  if (kind === 'Veg') {
    pizza.toppings = vegToppings;
  } else if (kind === 'Meat') {
    pizza.toppings = meatToppings;
  }
}

function bake(pizza) {
  const oven = new Oven();
  heatOven(oven);
  bakePizza(pizza, oven);
}

function heatOven(oven) {
  if (oven.temp !== cookingTemp) {
    while (oven.temp < cookingTemp) {
      time.sleep(checkOvenInterval);
      oven.temp = getOvenTemp(oven);
    }
  }
}

function bakePizza(pizza, oven) {
  if (!pizza.baked) {
    oven.insert(pizza);
    time.sleep(cookTime);
    oven.remove(pizza);
    pizza.baked = true;
  }
}

function pack(pizza) {
  const box = new Box();
  pizza.boxed = box.putIn(pizza);
  pizza.sliced = box.slicePizza(pizza.size);
  pizza.ready = box.close();
}

function createPizza(order) {
  const pizza = prepare(order);
  bake(pizza);
  pack(pizza);
  return pizza;
}
```

<!--
let pizza = createPizza({size: 30, sauce: 'red', kind: 'Meat'})
expect(pizza).toEqual({
  baked: true,
  base: 30,
  sauce: 'red',
  cheese: 'Mozzarella',
  toppings: ['pig'],
  boxed: true,
  sliced: true,
  ready: true
})
-->

What was already complex and convoluted is now even more complex and convoluted, and half of the code is just function calls. This doesn’t make the code any easier to understand, but it does make it almost impossible to work with. The article doesn’t show the complete code of the refactored version, perhaps to make the point more compelling.

Pierre “catwell” Chapuis [suggests in his blog post](https://blog.separateconcerns.com/2023-09-11-linear-code.html) to add comments instead of new functions:

<!--
let checkOvenInterval = 100
let cookTime = 2000
let cookingTemp = 240
let vegToppings = ['champignon'], meatToppings = ['pig']
let time = {sleep: () => {}}
let getOvenTemp = () => 250

class Pizza {
  toppings = []
  baked = false
  boxed = null
  sliced = null
  ready = null
  base = null
  sauce = null
  cheese = null
  constructor({base, sauce, cheese}) {
    this.base = base
    this.sauce = sauce
    this.cheese = cheese
  }
}
class Oven {
  temp = 20
  insert() {}
  remove() {}
}
class Box {
  putIn() { return true }
  slicePizza() { return true }
  close() { return true }
}
-->

```js
function createPizza(order) {
  // Prepare pizza
  const pizza = new Pizza({
    base: order.size,
    sauce: order.sauce,
    cheese: 'Mozzarella'
  });

  // Add toppings
  if (order.kind == 'Veg') {
    pizza.toppings = vegToppings;
  } else if (order.kind == 'Meat') {
    pizza.toppings = meatToppings;
  }

  const oven = new Oven();

  if (oven.temp !== cookingTemp) {
    // Heat oven
    while (oven.temp < cookingTemp) {
      time.sleep(checkOvenInterval);
      oven.temp = getOvenTemp(oven);
    }
  }

  if (!pizza.baked) {
    // Bake pizza
    oven.insert(pizza);
    time.sleep(cookTime);
    oven.remove(pizza);
    pizza.baked = true;
  }

  // Box and slice
  const box = new Box();
  pizza.boxed = box.putIn(pizza);
  pizza.sliced = box.slicePizza(order.size);
  pizza.ready = box.close();

  return pizza;
}
```

<!--
let pizza = createPizza({size: 30, sauce: 'red', kind: 'Meat'})
expect(pizza).toEqual({
  baked: true,
  base: 30,
  sauce: 'red',
  cheese: 'Mozzarella',
  toppings: ['pig'],
  boxed: true,
  sliced: true,
  ready: true
})
-->

This is already much better than the split version. An even better solution would be improving the APIs and making the code more clear. Pierre suggests that preheating the oven shouldn’t be part of the `createPizza()` function (and baking many pizzas myself, I totally agree!) because in real life the oven is already there and probably already hot from the previous pizza. Pierre also suggests that the function should return the box, not the pizza, because in the original code, the box kind of disappears after all the slicing and packaging magic, and we end up with the sliced pizza in our hands.

I> We talk about commenting code in the [Avoid comments](#no-comments) chapter.

Naming can also be a problem too when all the extracted functions are parts of the same algorithm. We need to invent names that are clearer than the code and shorter than comments — not an easy task.

I> We talk about naming in the [Naming is hard](#naming) chapter.

You probably won’t find many small functions in my code. In my experience, the most useful reasons to split code are _change frequency_ and _change reason_.

{#often-changed}

## Separate code that changes often

Let’s start with _change frequency_. Business logic changes much more often than utility functions. It makes sense to separate often-changing code from code that is very stable.

The comment form we discussed earlier in this chapter is an example of the former; a function that converts camelCase strings to kebab-case is an example of the latter. The comment form is likely to change and diverge over time when new business requirements arise; the case conversion function is unlikely to change at all and it’s safe to reuse in many places.

Imagine that we’re making a nice-looking table to display some data. We may think we’ll never need this table design again, so we decide to keep all the code for the table in a single module.

Next sprint, we get a task to add another column to the table, so we copy the code of an existing column and change a few lines there. Next sprint, we need to add another table with the same design. Next sprint, we need to change the design of the tables…

Our table module has at least three _reasons to change_, or _responsibilities_:

- new business requirements, like a new table column;
- UI or behavior changes, like adding sorting or column resizing;
- design changes, like replacing borders with striped row backgrounds.

This makes the module harder to understand and harder to change. Presentational code adds a lot of verbosity, making it harder to understand the business logic. To make a change in any of the responsibilities, we need to read and modify more code. This makes it harder and slower to iterate on either.

Having a generic table as a separate module solves this problem. Now, to add another column to a table, we only need to understand and modify one of the two modules. We don’t need to know anything about the generic table module except its public API. To change the design of all tables, we only need to change the generic table module’s code and likely don’t need to touch individual tables at all.

However, depending on the complexity of the problem, it’s okay, and often better, to start with a monolithic approach and extract an abstraction later.

Even code reuse can be a valid reason to separate code: if we use some component on one page, we’ll likely need it on another page soon.

{#colocation}

## Keep together code that changes at the same time

It might be tempting to extract every function into its own module. However, it has downsides too:

- Other developers may think that they can reuse the function somewhere else, but in reality, this function is likely not generic or tested enough to be reused.
- Creating, importing, and switching between multiple files creates unnecessary overhead when the function is only used in one place.
- Such functions often stay in the codebase long after the code that used them is gone.

I prefer to keep small functions that are used only in one module at the beginning of the module. This way, we don’t need to import them to use in the same module, but reusing them somewhere else would be awkward.

<!--
let PageWithTitle = ({children}) => children
let Stack = ({children}) => children
let Heading = ({children}) => children
let Text = ({children}) => children
let Link = ({children}) => children
-->

```jsx
function FormattedAddress({
  address,
  city,
  country,
  district,
  zip
}) {
  return [address, zip, district, city, country]
    .filter(Boolean)
    .join(', ');
}

function getMapLink({ name, address, city, country, zip }) {
  return `https://www.google.com/maps/?q=${encodeURIComponent(
    [name, address, zip, city, country]
      .filter(Boolean)
      .join(', ')
  )}`;
}

function ShopsPage({ url, title, shops }) {
  return (
    <PageWithTitle url={url} title={title}>
      <Stack as="ul" gap="l">
        {shops.map(shop => (
          <Stack key={shop.name} as="li" gap="m">
            <Heading level={2}>
              <Link href={shop.url}>{shop.name}</Link>
            </Heading>
            {shop.address && (
              <Text variant="small">
                <Link href={getMapLink(shop)}>
                  <FormattedAddress {...shop} />
                </Link>
              </Text>
            )}
          </Stack>
        ))}
      </Stack>
    </PageWithTitle>
  );
}
```

<!--
const {container: c1} = RTL.render(
  <ShopsPage url="/s" title="Shops" shops={[
    {name: 'Tacos', url: '/tacos', address: 'Bright street',
     city: 'Valencia', country: 'Spain'},
    {name: 'Pizza', url: '/pizza', address: 'Dark street',
     city: 'Berlin', country: 'Germany'},
  ]} />
)
expect(c1.textContent).toEqual(
  'TacosBright street, Valencia, SpainPizzaDark street, Berlin, Germany'
)
-->

Here, we have a component (`FormattedAddress`) and a function (`getMapLink()`) that are only used in this module, so they’re defined at the top of the file.

If we need to test these functions (and we should!), we can export them from the module and test them together with the main function of the module.

The same applies to functions that are intended to be used only together with a certain function or component. Keeping them in the same module makes it clearer that all functions belong together and makes these functions more discoverable.

Another benefit is that when we delete a module, we automatically delete its dependencies. Code in shared modules often stays in the codebase forever because it’s hard to know if it’s still used (though TypeScript makes this easier).

I> Such modules are sometimes called _deep modules_: a relatively large modules that encapsulate complex problems but has a simple APIs. The opposite of deep modules are _shallow modules_: many small modules that need to interact with each other.

If we often have to change several modules or functions at the same time, it might be better to merge them into a single module or function. This approach is sometimes called _colocation_.

Here are a couple of examples of colocation:

- React components: keeping everything a component needs in the same file, including markup (JSX), styles (CSS in JS), and logic, rather than separating each into its own file, likely in a separate folder.
- Tests: keeping tests next to the module file rather than in a separate folder.
- [Ducks convention](https://github.com/erikras/ducks-modular-redux) for Redux: keep related actions, action creators, and reducers in the same file rather than having them in three files in separate folders.

Here’s how the file tree changes with colocation:

| Separated | Colocated |
| --- | --- |
| **React components** |  |
| `src/components/Button.tsx` | `src/components/Button.tsx` |
| `styles/Button.css` |  |
| **Tests** |  |
| `src/util/formatDate.ts` | `src/util/formatDate.ts` |
| `tests/formatDate.ts` | `src/util/formatDate.test.ts` |
| **Ducks** |  |
| `src/actions/feature.js` | `src/ducks/feature.js` |
| `src/actionCreators/feature.js` |  |
| `src/reducers/feature.js` |  |

I> Kent C. Dodds wrote [a nice article on colocation](https://kentcdodds.com/blog/colocation).

A common complaint about colocation is that it makes components too large. In such cases, it’s better to extract some parts into their own components, along with the markup, styles, and logic.

The idea of colocation also conflicts with _separation of concerns_ — an outdated idea that led web developers to keep HTML, CSS, and JavaScript in separate files (and often in separate parts of the file tree) for too long, forcing us edit three files at the same time to make even the most basic changes to web pages.

I> The _change reason_ is also known as the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle), which states that “every module, class, or function should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class.”

{#hide-complexity}

## Sweep that ugly code under the rug

Sometimes, we have to work with an API that’s especially difficult to use or prone to errors. For example, it requires several steps in a specific order or calling a function with multiple parameters that are always the same. This is a good reason to create a utility function to make sure we always do it right. As a bonus, we can now write tests for this piece of code.

String manipulations — such as URLs, filenames, case conversion, or formatting — are good candidates for abstraction. Most likely, there’s already a library for what we’re trying to do.

Consider this example:

```js
const file = 'pizza.jpg';
const prefix = file.slice(0, -4);
// → pizza
```

<!-- expect(prefix).toEqual('pizza') -->

It takes some time to realize that this code removes the file extension and returns the base name. Not only is it unnecessary and hard to read, but it also assumes the extension is always three characters, which might not be the case.

Let’s rewrite it using a library, the built-in Node.js’ `path` module:

```js
const file = 'pizza.jpg';
const prefix = path.parse(file).name;
// → pizza
```

<!-- expect(prefix).toEqual('pizza') -->

Now, it’s clear what’s happening, there are no magic numbers, and it works with file extensions of any length.

Other candidates for abstraction include dates, device capabilities, forms, data validation, internationalization, and more. I recommend looking for an existing library before writing a new utility function. We often underestimate the complexity of seemingly simple functions.

Here are a few examples of such libraries:

- [Lodash](https://lodash.com): utility functions of all kinds.
- [Date-fns](https://date-fns.org): functions to work with dates, such as parsing, manipulation, and formatting.
- [Zod](https://zod.dev): schema validation for TypeScript.

{#inline}

## Bless the inline refactoring!

Sometimes, we get carried away and create abstractions that neither simplify the code nor make it shorter:

```jsx
// my_feature_util.js
const noop = () => {};

export const Utility = {
  noop
  // Many more functions…
};

// MyComponent.js
function MyComponent({ onClick }) {
  return <button onClick={onClick}>Hola!</button>;
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

<!-- eslint-skip -->

```js
const findByReference = (wrapper, reference) =>
  wrapper.find(reference);

const favoriteTaco = findByReference(
  ['Al pastor', 'Cochinita pibil', 'Barbacoa'],
  x => x === 'Cochinita pibil'
);

// → Cochinita pibil
```

<!-- expect(favoriteTaco).toEqual('Cochinita pibil') -->

The best thing we can do in such cases is to apply the almighty _inline refactoring_: replace each function call with its body. No abstraction, no problem.

The first example becomes:

```jsx
function MyComponent({ onClick }) {
  return <button onClick={onClick}>Hola!</button>;
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

// → Cochinita pibil
```

<!-- expect(favoriteTaco).toEqual('Cochinita pibil') -->

The result is not just shorter and more readable; now readers don’t need to guess what these functions do, as we now use JavaScript native functions and features without home-baked abstractions.

In many cases, a bit of repetition is good. Consider this example:

```js
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

It looks perfectly fine and won’t raise any questions during code review. However, when we try to use these values, autocompletion only shows `number` instead of the actual values (see an illustration). This makes it harder to choose the right value.

![Autocompletion with calculated values](images/autocompletion-formula.png)

We could inline the `baseSpacing` constant:

```js
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

Now, we have less code, it’s just as easy to understand, and autocompletion shows the actual values (see the illustration). And I don’t think this code will change often — probably never.

![Autocompletion with literal values](images/autocompletion-literals.png)

{#what-how}

## Separate “what” and “how”

Consider this excerpt from a form validation function:

```jsx
function validate(values) {
  const errors = {};

  if (
    !values.name ||
    (values.name && values.name.trim() === '')
  ) {
    errors.name = 'Name is required';
  }

  if (
    !values.login ||
    (values.login && values.login.trim() === '')
  ) {
    errors.login = 'Login is required';
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = 'No spaces are allowed in login';
  }

  // This goes on and on for a dozen of other fields…

  return errors;
}
```

<!--
expect(validate({name: 'Chuck', login: 'chuck'})).toEqual({})
expect(validate({name: '', login: 'chuck'})).toEqual({name: 'Name is required'})
expect(validate({name: 'Chuck', login: ''})).toEqual({login: 'Login is required'})
expect(validate({name: 'Chuck', login: 'c norris'})).toEqual({login: 'No spaces are allowed in login'})
-->

It’s quite difficult to grasp what’s going on here: validation logic is mixed with error messages, many checks are repeated…

We can split this function into several pieces, each responsible for one thing only:

- a list of validations for a particular form;
- a collection of validation functions, such as `isEmail()`;
- a function that validates all form values using a list of validations.

We can describe the validations declaratively as an array:

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
  // All other validations…
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

Each validation function and the function that runs validations are pretty generic, so we can either abstract them or use a third-party library.

Now, we can add validation for any form by describing which fields need which validations and which error to show when a certain check fails.

I> See the [Avoid conditions](#no-conditions) chapter for the complete code and a more detailed explanation of this example.

I call this process _separation of “what” and “how”_:

- **the “what”** is the data — the list of validations for a particular form;
- **the “how”** is the algorithms — the validation functions and the validation runner function.

The benefits are:

- **Readability:** often, we can define the “what” declaratively, using basic data structures such as arrays and objects.
- **Maintainability:** we change the “what” more often than the “how”, and now they are separated. We can import the “what” from a file, such as JSON, or load it from a database, making updates possible without code changes, or allowing non-developers to do them.
- **Reusability:** often, the “how” is generic, and we can reuse it, or even import it from a third-party library.
- **Testability:** each validation and the validation runner function are isolated, and we can test them separately.

There are many more examples of such refactorings in this book.

{#monster-utilities}

## Avoid monster utility files

Many projects have a file called `utils.js`, `helpers.js`, or `misc.js` where developers throw in utility functions when they can’t find a better place for them. Often, these functions are never reused anywhere else and stay in the utility file forever, so it keeps growing. That’s how _monster utility files_ are born.

Monster utility files have several issues:

- **Poor discoverability:** since all functions are in the same file, we can’t use the fuzzy file opener in our code editor to find them.
- **They may outlive their callers:** often such functions are never reused again and stay in the codebase, even after the code that was using them is removed.
- **Not generic enough:** such functions are often made for a single use case and won’t cover other use cases.

These are my rules of thumb:

- If the function is small and used only once, keep it in the same module where it’s used.
- If the function is long or used more than once, put it in a separate file inside `util`, `shared`, or `helpers` folder.
- If we want more organization, instead of creating files like `utils/validators.js`, we can group related functions (each in its own file) into a folder: `utils/validators/isEmail.js`.

{#default-exports}

## Avoid default exports

JavaScript modules have two types of exports. The first is **named exports**:

<!-- test-skip -->

```js
// button.js
export function Button() {
  /* … */
}
```

Which can be imported like this:

<!-- test-skip -->

```js
import { Button } from './button';
```

And the second is **default exports**:

<!-- test-skip -->

```js
// button.js
export default function Button() {
  /* … */
}
```

Which can be imported like this:

<!-- test-skip -->

```js
import Button from './button';
```

I don’t really see any advantages to default exports, but they have several issues:

- **Poor refactoring:** renaming a module with a default export often leaves existing imports unchanged. This doesn’t happen with named exports, where all imports are updated after renaming a function.
- **Inconsistency:** default-exported modules can be imported using any name, which reduces the consistency and greppability of the codebase. Named exports can also be imported using a different name using the `as` keyword to avoid naming conflicts, but it’s more explicit and is rarely done by accident.

I> We talk more about greppability in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

Unfortunately, some third-party APIs, such as `React.lazy()` require default exports, but for all other cases, I stick to named exports.

{#barrels}

## Avoid barrel files

A barrel file is a module (usually named `index.js` or `index.ts`) that reexports a bunch of other modules:

<!-- test-skip -->

```js
// components/index.js
export { Box } from './Box';
export { Button } from './Button';
export { Link } from './Link';
```

The main advantage is cleaner imports. Instead of importing each module individually:

<!-- test-skip -->

```js
import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
```

We can import all components from a barrel file:

<!-- test-skip -->

```js
import { Box, Button, Link } from '../components';
```

However, barrel files have several issues:

- **Maintenance cost:** we need to add an export of each new component in a barrel file, along with additional items such as types of utility functions.
- **Performance cost:** setting up tree shaking is complex, and [barrel files often lead to increased bundle size or runtime costs](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js#what's-the-problem-with-barrel-files). This can also slow down hot reload, unit tests, and linters.
- **Circular imports:** importing from a barrel file can cause a circular import when both modules are imported from the same barrel files (for example, the `Button` component imports the `Box` component).
- **Developer experience:** navigation to function definition navigates to the barrel file instead of the function’s source code; and autoimport can be confused whether to import from a barrel file instead of a source file.

I> TkDodo explains [the drawbacks of barrel files in great detail](https://tkdodo.eu/blog/please-stop-using-barrel-files).

The benefits of barrel files are too minor to justify their use, so I recommend avoiding them.

One type of barrel files I especially dislike is those that export a single component just to allow importing it as `./components/button` instead of `./components/button/button`.

{#hydrated}

## Stay hydrated

To troll the DRYers (developers who never repeat their code), someone coined another term: [WET](https://overreacted.io/the-wet-codebase/), _write everything twice_, or _we enjoy typing_, suggesting we should duplicate code at least twice until we replace it with an abstraction. It is a joke, and I don’t fully agree with the idea (sometimes it’s okay to duplicate some code more than twice), but it’s a good reminder that all good things are best in moderation.

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
  // Many more lines…
};

it('your recipes', () => {
  visitStory(stories.RECIPE);

  cy.findByText(copyTesters.titleRecipe).should('exist');

  cy.findByTestId(testIds.ADD_TO_FAVORITES).click();
  cy.findByText(copyTesters.addedToFavorites).should('exist');

  // Lots of lines in similar style…
});
```

<!-- // No actual test, just executing the code -->

This is an extreme example of code DRYing, which doesn’t make the code more readable or maintainable, especially when most of these constants are used only once. Seeing variable names instead of actual strings here is unhelpful.

Let’s inline all these extra variables. (Unfortunately, inline refactoring in Visual Studio Code doesn’t support inlining object properties, so we have to do it manually.)

<!--
let visitStory = () => {}
let tester = { should: () => {}, click: () => {} }
let cy = { findByText: () => tester, findByTestId: () => tester, }
let it = (_, fn) => fn()
-->

```js
it('your recipes', () => {
  visitStory('page--recipe');

  cy.findByText(/Cochinita Pibil Tacos/).should('exist');

  cy.findByTestId('add-to-favs-button').click();
  cy.findByText(/In favorites/).should('exist');

  // Lots of lines in similar style…
});
```

<!-- // No actual test, just executing the code -->

Now, we have significantly less code, and it’s easier to understand what’s going on and easier to update or delete tests.

I’ve encountered so many hopeless abstractions in tests. For example, this pattern is very common:

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

// More tests that use `wrapper`…
```

<!-- // No actual test, just executing the code -->

This pattern tries to avoid repeating `mount(...)` calls in each test case, but it makes tests more confusing than they need to be. Let’s inline the `mount()` calls:

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

// More tests that use `wrapper`…
```

<!-- // No actual test, just executing the code -->

Additionally, the `beforeEach` pattern works only when we want to initialize each test case with the same values, which is rarely the case:

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

To avoid _some_ duplication when testing React components, I often add a `defaultProps` object and spread it inside each test case:

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
  const wrapper = mount(
    <Pony {...defaultProps} breathFire />
  );
  expect(wrapper.find('.fire')).toBeVisible();
});
```

<!-- // No actual test, just executing the code -->

This way, we don’t have too much duplication, but at the same time, each test case is isolated and readable. The difference between test cases is now clearer because it’s easier to see the unique props of each test case.

Here’s a more extreme variation of the same problem:

<!--
let getSelector = (x) => x
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

<!-- eslint-skip -->

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

// More tests that use `css` and `res`…
```

<!-- // No actual test, just executing the code -->

We can inline the `beforeEach()` function the same way we did in the previous example:

<!--
let getSelector = (x) => x
let expect = () => ({toBe: () => {}})
let beforeEach = (fn) => fn()
let test = (_, fn) => fn()
-->

```js
test('works with basic selectors', () => {
  const css = 'div\n{}';
  const expected = 'div\n';
  expect(getSelector(css)).toBe(expected);
});

test('works with lobotomized owl selector', () => {
  const css = '.stack > * + *\n{}';
  const expected = '.stack > * + *\n';
  expect(getSelector(css)).toBe(expected);
});

// More tests that use `css` and `res`…
```

<!-- // No actual test, just executing the code -->

I’d go even further and use `test.each()` method because we run the same test with a bunch of different inputs:

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
  // More inputs…
])('selector: %s', (css, expected) => {
  expect(getSelector(css)).toBe(expected);
});
```

<!-- // No actual test, just executing the code -->

Now, we’ve gathered all the test inputs with their expected results in one place, making it easier to add new test cases.

I> Check out my [Jest](https://github.com/sapegin/jest-cheat-sheet) and [Vitest](https://github.com/sapegin/vitest-cheat-sheet) cheat sheets.

---

The biggest challenge with abstractions is finding a balance between being too rigid and too flexible, and knowing when to start abstracting things and when to stop. It’s often worth waiting to see if we really need to abstract something — many times, it’s better not to.

We should be vigilant about letting others reuse our code. Too often, this creates tight coupling between parts of the codebase that should be independent, slowing down development and leading to bugs.

Start thinking about:

- Colocating related code in the same file or folder to make it easier to change, move, or delete.
- Before adding another option to an abstraction, think whether this new use case truly belongs there.
- Before merging several pieces of code that look similar, think whether they actually solve the same problems or just happened to look the same.
- Before making tests DRY, think whether it would make them more readable and maintainable, or a bit of code duplication isn’t an issue.
