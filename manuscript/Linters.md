## Linters

Linters check our code to make sure it follows teams’s code style or to prevent some common bugs. Sometimes linters fix our code automatically, sometimes they just hit our hands with a keyboard when we try to commit our code, or later, during the CI run.

Like any tool, linters could be used to make our life easier, and our codebase more consistent and free of bugs; or they could be abused and make our life full of pain.

I believe, anything that automates or simplifies bugfixing or code reviews should become lint rules. However, there are many many ways linting can go wrong, and that is what we’re going to talk about in this chapter.

I’ll use ESLint as an example, however, best practices and general advice apply to any linting too.

### Linter best practices

Let’s start with some healthy linter habits, and how to make linters work for our team, not against it.

#### Prefer to have too few lint rules than too many

It’s a good idea to start with recommended configs (like `eslint:recommended`), and only add rules that are important for the team. A road to hell is paved with [useless lint rules](https://github.com/sindresorhus/eslint-plugin-unicorn).

#### Define lint rules as errors, not warnings

Developers don’t fix warnings, most of the time they don’t even see them. If we want them to stop and fix something, we should make it an error, and setup a pre-commit hook or a CI check that will prevent code with errors from merging.

### Define autofixable lint rules as warnings

Ideally, anything that could be fixed by a machine, shouldn’t be marked as an error or warning or highlighted at all while we’re writing code, there’s no reason to distract us with things that don’t require our immediate attention.

#### Clean up rules regularly

If developers disable a particular lint rule using special comments (like `eslint-disable`), we should probably remove this rule.

#### Document rules

There’s nothing more annoying than a linter demanding to change the code just because there’s a rule saying that one way of coding a particular pattern is better then all others.

We should document all linter rules at least as comments in the config file, better in prose with all the other frontend documentation. I wish there was a feature to add links to the team style guide, so developers could read an explanation why a particular rule was enabled by a particular team. Explanations in the linter docs are generally hopeless.

#### Don’t disable linter rules for a whole file

Disabling lint rules for a particular line, instead of the whole file, will allow the linter to find violations of the same rule in other lines.

#### Don’t disable all linter rules

Disabling a particular linter rule that is expected in a particular line of code, instead of all rule, will allow the linter to find other problems in the same file. Similar to the previous one.

#### Don’t overpolice the code

Unless the coding culture in the team is especially miserable (and in this case it’s better to start updating a CV than trying to fight it), a too rigid linting setup does more harm than good. It’s better to trust our colleauges, and expect that they know how to do their job, and use linters to catch bugs and code reviews to discuss different approaches. There’s always more than one correct way of doing something in programming, having a linter that’s allowing only one way isn’t solving any real problem but makes our colleagues suffer more.

### My top 99 (TODO) lint rules that should have never existed

Many lint rules don’t solve any actual problem with the code, they merely enforce a particular way of writing code that one of the team members likes the most. Many of such rules are purely aesthetical.

Below is a selection of rules that make more problems than they solve. Some are popular, and even included in recommended presets, some are quite obscure but still could be good reminders that we shouldn’t try to validate and control everything. And I’m not the only one, who [gets mad because of a linter rule](https://twitter.com/iamsapegin/status/1230760798584098817).

#### [no-undefined](https://eslint.org/docs/rules/no-undefined])

This rule disallows the use of `undefined`.

One of the many JavaScript quirks is that there are two keywords that do pretty much the same but at the same time disturbingly different: `undefined` and `null`.

I always preferred `undefined` over `null`, and looks like the language itself does the same: for example, default values for function parameters and in object destructuring are triggered on `undefined` values, not on `null`. I [almost never use `null`](https://lukeshiru.dev/articles/we-dont-need-null), disallowing `undefined` would make us write awkward code without solving any real problem. The ability to overwrite the value of `undefined` mentioned in the rule docs is soo 2000s, I woulnd’t bother about this.

#### [no-else-return](https://eslint.org/docs/rules/no-else-return)

This rule forces us to write:

```js
function somethingToSomethingElse(something) {
  if (something === 42) {
    return 1;
  }

  return 2;
}
```

<!--
expect(somethingToSomethingElse(42)).toBe(1)
expect(somethingToSomethingElse(41)).toBe(2)
-->

Instead of:

```ts
function somethingToSomethingElse(something) {
  if (something === 42) {
    return 1;
  } else {
    return 2;
  }
}
```

<!--
expect(somethingToSomethingElse(42)).toBe(1)
expect(somethingToSomethingElse(41)).toBe(2)
-->

I prefer the latter but I’d never force anyone to write either of them — both are perfectly fine. I call this pattern _parallel code_ (see more in [Don’t make me think](#dont-make-me-think) chapter).

#### [id-length](https://eslint.org/docs/rules/id-length)

This rule allows us to define minimum and maximum length for an identifier, because short names could be potentially less readable, which is true in many cases. However, like any attempt to measure code quality by its phisical dimensions, this rule causes more damage than good. (See more about this in the [Naming is hard](#naming-is-hard) chapter.)

#### [max-classes-per-file](https://eslint.org/docs/rules/max-classes-per-file)

This rules limits the number of JavaScript classes in a file. Usually set to 1, meaning we could declare only one class per file.

This is an artificial requirement. Splitting code into modules is a skill that can’t be simplified to a lint rule. Often keeping tiny utility classes, function, or components at the top of the module makes the code easier to navigate and maintain — the very thing that this lint rule is trying to prevent. (See more in the [Divide and conquer, or merge and relax](#divide-and-conquer) chapter.)

Tere are other similar rules that try to artificially limit the number of React components, lines of code, statements and so on. The only useful on of the kind is `max-params` (see below).

#### [no-constant-condition](https://eslint.org/docs/rules/no-constant-condition)

This rule prevents us from writing unnecessary conditions, where the condition is constant:

<!-- let x -->

```js
if (1 === 1+5) {
```

<!--
  x = true
} else {
  x = false
}
expect(x).toBe(false)
-->

This can catch a few bugs, but the scope of this rule is limited. For example, it won’t catch the same problem here:

<!-- let x -->

```js
const cuantosTacos = 42;
if (cuantosTacos === 41) {
```

<!--
  x = true
} else {
  x = false
}
expect(x).toBe(false)
-->

Also, by default, this rule also prevents us from writing infinite loops like this:

```js
while (true) {
```

<!-- break} -->

The only acceptable way with this rule is this:

```js
for (;;) {
```

<!-- break} -->

I don’t see any problem with either form of writing an infinite loop, and don’t understand why we should ban one of them.

We can disable loop checking in the rule settings. Hovewer, the usefulness of this rule is questionable.

### Good rules when used correctly

#### [max-params](https://eslint.org/docs/rules/max-params)

This rule limits the number of parameters a fuction can have. It may sound similar to `max-classes-per-file` but it’s actually useful. To learn more about the problem it solves, see the [Name things](#name-things) section of Don’t make me think chapter.

##### [sort-imports](https://eslint.org/docs/rules/sort-imports)

This rule requires us to sort `import` statements in a particular way: by type or alphabetically. The only benefit is aesthetical, and unless it could be done without distracing developers and making them move the imports manually, this rules does much more harm than good.

I prefer not to see imports at all, and let my editor manage them. In this case enabling this rule as a warning and enabling autofixing on pre-commit isn’t such a bad idea. Otherwise auto importing would make the code messy. I wish this was actually working without problems!

In WebStorm, we could hide the block of import statements by default, and expand it only when we need it:

![Hidden by default imports in WebStorm](images/webstorm-import-spoiler.png)

There are other similar rules to demand sorting of object keys, React component props, CSS properties, an so on. These are all evil!

##### [@typescript-eslint/ban-ts-comment](https://typescript-eslint.io/rules/ban-ts-comment/)

TypeScript is a great tool but sometimes it’s impossible or too hard to type things correctly. Often because of the incomplete or incorrect types for third-party libraries. Sometimes, we need to tell the TypeScript compiler to shut the duck up with the `// @ts-ignore` comment, and then, on many projects, we’ll need to tell the linter to shut the duck up because there’s a rule that disallows this kind of comments, so the resulting code looks like this:

```ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
```

This is bloodcurdling and makes more problems than it solves. Fortunately, newer versions of TypeScript and ESLint TypeScript plugin have a better solution. TypeScript allows adding explanations to `@ts-*` comments and this ESLint rule allows us to require them.

So, we could write something like this, and it won’t trigger a lint error:

```ts
// @ts-ignore: The Pizzalib types are incorrect
```

Or even better, [we could use](https://typescript-eslint.io/rules/prefer-ts-expect-error) the newer `@ts-expect-error` comment:

```ts
// @ts-expect-error: The Pizzalib types are incorrect
```

The difference between the two comments is that `@ts-expect-error` will show an error when there’s no compiler error on the next line, making it easier to remove unnecessary comments.

### The ideal linting setup (dream)

Unfortunately, [the ideal linting setup](https://twitter.com/iamsapegin/status/1527553857416462336) as I see it isn’t possible with the current tools.

It doesn’t make sense to distract developers with autofixable issues and highlight them in the code, they don’t require any action from a developer. It might be nice to have a log explaining what and why the linter autofixed but it shouldn’t distract us from the work we’re doing.

There’s a `--quiet` option in ESLint that sound like what we want: it doesn’t report warnings so if we convert all autofixable issues to warnings, it won’t report any, which is true. The sad part is that it won’t autofix them, which makes it useless.

The only way to implement this setup is to split the ESLint config into two: the main config with issues we must fix manually, and the secondary config with all autofixable issues. Then we run ESLint on pre-commit hook twice, with both configs. The editor will only see the main config, meaning we’ll never see autofixable issues. I don’t think it’s worth the trouble though.

### The ideal linting setup (reality)

In reality, there’s not much we can do to improve the linting experience. Here’s how I set up ESLint:

1. Start with [the recommened ESLint rules](https://eslint.org/docs/rules/), `eslint:recommended`.
2. Add recommended configs of ESLint plugins for the project’s stack (see below).
3. Install ESLint plugin for the editor.
4. Enable ESLint autofix on file save in the editor.
5. Add ESLint with autofix to the Git pre-commit hook using [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to make sure that all the code in the repository is linted.

_Tip:_ [Use Mrm](https://mrm.js.org/) to add ESLint and Husky/lint-staged to the project.

### Recommended ESLint plugins

There are hundreds of plugins for ESLint, few are useful. I have these plugins on many of my projects and found them more useful than annoying:

- [Import](https://github.com/import-js/eslint-plugin-import): validates imports in our code, makes sure modules we’re trying to import exist and export what we’re importing. It’s useful for vanilla JavaScript projects, TypeScript already does most of these checks.
- [TypeScript](https://github.com/typescript-eslint/typescript-eslint): rules specific for TypeScrpt, also includes replacements for built-in ESLint rules that work with TypeScript.
- [React](https://github.com/jsx-eslint/eslint-plugin-react): React and JSX specific rules.
- [React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks): enforcing the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) for React projects.
- [JSX Accessibility](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y): accessibility in JSX, uses Axe Core.
- [Jest](https://github.com/jest-community/eslint-plugin-jest): makes sure our tests are doing what we expect, we’re not committing disabled tests and so on.
- [Jest DOM](https://github.com/testing-library/eslint-plugin-jest-dom): rules for jest-dom.
- [Testing Library](https://github.com/testing-library/eslint-plugin-testing-library): rules for Testing Library.
- [Cypress](https://github.com/cypress-io/eslint-plugin-cypress): rules for Cypress.

### Conclusion

Linters are useful to prevent bugs and maintain consistent codebase but often be misused.

Each rule in our coding style guide should have a corresponding lint rule. Ideally autofixable, so developers don’t waste time tailoring their code. If it’s impossible or too difficult to make an autofixable rule, we should really think whether such rule is a good idea or not, and maybe we shound’t be so picky about the way our colleagues writing code.

I wish there was a way not to show autofixable lint errors in the editor, so they don’t distract us from writing code. The same way as Prettier (see the next section) is formatting the code for us without yelling at us when we write it the "wrong" way.

---

Start thinking about:

- Adding lint rules for thing you often point out during code reviews.
- Removing lint rules that are frustrating or you often disable using a comment.
