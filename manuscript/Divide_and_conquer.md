<!-- textlint-disable -->

### Divide and conquer, or merge and relax

<!-- textlint-enable -->

TODO: https://kentcdodds.com/blog/moist-programming

TODO: It’s hard to come up with a good API. It’s hard to come up with a good generic API if you only consider a single use case.

TODO: Sometimes you have to roll back an abstraction. When you start adding conditions and options (?), ask yourself: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and options to make your code flexible can make the API hard to use.

TODO: Hide complexity

TODO: To DRY or to DUMP (DUMP for tests)

There are several you may want to split code into several modules:

- size
- complexity
- responsibilities
- change frequency
- code reuse

#### Let abstractions grow

We, developers, hate to do the same work twice. _Don’t repeat yourself_ (DRY) is our mantra. But when you have two or three similar pieces of code, it may be still too early to introduce an abstraction, no matter how tempting it is.

Leave with the pain of code duplication, maybe it’s not so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows you to iterate and evolve code faster.

It’s hard to manage shared code in large projects with many teams. New requirements for one team may not work for another team and break their code, or you end up with unmaintainable spaghetti monster with dozens of conditions.

Imagine your team is adding a comment form: a name, an email, a message and a submit button. Then another team needs a feedback form, so they find your component and try to reuse it. Then your team also wants an email field, but they don’t know that some other team uses the component, so they add a required email field, and break the feature for the other team users. Then the other teams needs a phone number field, but they know that your team is using the component without it, so they add an option to show a phone number field. A year later two teams hate each other for breaking their code, and a component is full of conditions and impossible to maintain. Both teams would save a lot of time and have healthier relationships by maintaining separate components.

[Duplication is cheaper](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) and healthier than the wrong abstraction.

I think the higher level of the code, the longer you should wait with abstracting it. Low level utility abstractions are much more obvious than business logic.

TODO: Don’t let people depend on your code

#### Separate code that changes often

_Code reuse_ isn’t the only and not the most important reason to extract code into a separate module.

_Code length_ is often [used as a metric](https://softwareengineering.stackexchange.com/questions/27798/what-should-be-the-maximum-length-of-a-function) when you should split a module or a function into two, but size alone doesn’t make code hard to read or maintain.

In my experience the most useful reasons to split code are _change frequency_ and _change reason_.

Let’s start from _change frequency_. Business logic is changing much more often than utility code. It makes sense to keep code, that changes often, separately from the code that is mostly static.

The comment form from the previous section is an example of the former, a function that converts `camelCase` to `kebab-case` is an example of the latter. The comment form is likely to change and diverge with time when new business requirements arrive, the conversion function is unlikely to change at all and it’s safe to reuse in many places.

The opposite is also true: if you often have to change several modules or functions at the same time, it may be better to merge them into a single module or a function. [Ducks convention](https://github.com/erikras/ducks-modular-redux) for Redux is a great example of that.

_Change reason_ is also known as the [Single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle): “every module, class, or function should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class”.

Imagine, you’re making a nice looking table with editable fields. You think you’ll never need this table design again, so you decide to keep the whole table in a single module.

Next sprint you have a task to add another column to the table, so you copy the code of an existing table and change a few lines there. Next sprint you have a task to change a design of a table.

Now your module has at least two _reasons to change_, or _responsibilities_:

- new business requirements, like a new table column;
- design changes, like replacing borders with striped row backgrounds.

This makes the module harder to understand and harder to change: to do a change in any of the responsibilities you need to read and modify more code. This makes it harder and slower to iterate on both, business logic and design.

Extraction of a generic table as a separate module solves this problem. Now to add another column to a table, you only need to understand and modify one of the two modules. You don’t need to know anything about the generic table module, except its public API.

This also makes code easier to delete when the requirements change. (TODO: why?)

Even code reuse can be a valid reason to separate code here: if you use some design pattern on one page, you’ll likely need it on another page soon.

#### Flexibility vs. rigidity

TODO: Balance between flexibility and consistency. It’s nice to have a global Button component but if it’s too flexible and you have 10 variations, it will be hard to choose the right one. If it’s too strict, developers will create their own buttons

<!-- test-skip -->

```js
// my_feature_util.js
const noop = () => {};
// ...
export const Utility = {
  noop
  // ...
};

// MyComponent.js
// ...
MyComponent.defaultProps = {
  onClick: Utility.noop()
};
```

Wrong abstraction, incorrect name:

<!-- test-skip -->

```js
function filterEmptyString(dep) {
  return Boolean(dep.trim());
}
generate(
  req ? req.split(',').filter(filterEmptyString) : [],
  dep,
  base,
  fn
);
```
