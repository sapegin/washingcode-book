{#linting}

# Lint your code

<!-- description: How linters can help us maintain a consistent and modern codebase, and promote some of the techniques discussed in the book -->

In this book, we talk a lot about _conventions_. For example, don’t mutate your code, so the next programmer will have less trouble understanding it, and you’ll avoid some nasty bugs. This is a convention, meaning we’re agreeing to do something, but there’s no way to enforce it. Developers are still free to mutate any value accidentally or due to evil intent.

The issue with conventions is that they are just words, and the only way to enforce them is manually, for example, using code review comments.

That’s where the _linters_ come in. Linters check the code to make sure it follows the team’s code style or to prevent common bugs. Sometimes, linters fix the code automatically; other times, they just slap our hands with a keyboard when we try to commit our code, or later, during the continuous integration (CI) run.

I> We talk about code style in the [Code style](#code-style) chapter.

Like any tool, linters can make our lives easier and our codebase more consistent and free of bugs, or they could be abused and make our lives full of pain.

Almost anything that automates or simplifies bug fixing or code reviews is worth implementing as a linter rule. However, there are many, many ways linting can go wrong, and that is what we’re going to talk about in this chapter.

Linting in JavaScript has a long history that started in 2002 with JSLint by Douglas Crockford, which allowed developers to catch some bugs but was also rigid and promoted a code style that nobody wanted to use. JSLint was later replaced by JSHint, which was less opinionated and more configurable, and then by ESLint, which is now the standard for JavaScript linting, offering hundreds of rules and dozens of plugins. There were a few other linters as well, like JSCS or Standard, but they were never as popular as these three.

In this chapter, we mostly talk about [ESLint](https://eslint.org).

## Code linting best practices

Let’s start with some healthy linting habits and ways to make linters work for the team, not against it.

### Prefer to have too few linter rules than too many

It’s a good idea to start with recommended configs (like ESLint’s `eslint:recommended`) and add only rules that are important for the team. The road to hell is paved with useless linter rules.

For example, the most minimal ESLint config could look like this:

```js
// eslint.config.mjs
import js from '@eslint/js';
export default [js.configs.recommended];
```

Here, we include only the [recommended rules](https://eslint.org/docs/latest/rules/).

### Define linter rules as errors, not warnings

Developers don’t fix warnings because warnings don’t break the build. Most of the time, they don’t even see them. There’s nothing more annoying than working on a project with hundreds of unfixed linting warnings — they distract from your own errors when you edit code with linting issues highlighting enabled in the editor.

If we want developers to stop and fix something, we should make it an error and set up a pre-commit or pre-push hook or a CI check that will prevent merging of the code with errors.

Here’s how we do it in ESLint:

```js
// eslint.config.mjs
export default [
  {
    rules: {
      'no-unused-vars': 'error'
    }
  }
];
```

All rules in the recommended ESLint config are defined as errors.

### Define autofixable linter rules as warnings

Ideally, anything that could be fixed by a machine shouldn’t be marked as an error or warning or highlighted at all while we’re writing code; there’s no reason to distract us with things that don’t require our immediate attention.

Here’s how we do it in ESLint:

```js
// eslint.config.mjs
export default [
  {
    rules: {
      curly: 'warn'
    }
  }
];
```

### Clean up the rules regularly

If we often disable a particular linter rule using special comments (like `eslint-disable`), we should consider removing that rule.

Consider this example:

<!-- let post = { shortDescription: 'pizza' } -->
<!-- eslint-skip -->

```js
const { id, title, photos } = post;
const description =
  // eslint-disable-next-line unicorn/consistent-destructuring
  ('description' in post && post.description) ||
  ('shortDescription' in post && post.shortDescription);
```

<!-- expect(description).toBe('pizza') -->

The linter wants us to write this piece of code like this:

<!-- let post = { shortDescription: 'pizza' } -->

```js
const { id, title, photos, shortDescription } = post;
const description =
  ('description' in post && post.description) ||
  ('shortDescription' in post && shortDescription);
```

<!-- expect(description).toBe('pizza') -->

This doesn’t make any sense to me: the idea is to use destructuring consistently, but here it actually reduces the consistency of destructuring (we can’t destructure `description` the same way as `shortDescription` because the name is already used) and the condition below. It breaks the pattern of checking the existence of a key in an object and then taking the value with this key.

Such rules are too opinionated and lack the nuance that humans have. We can choose whether to follow a certain pattern or not and whether to be consistent in one part of the code or another if consistency in both isn’t an option.

We can also rewrite this code using _optional chaining_ and _nullish coalescing_ operators, which weren’t common when this code was written:

<!-- let post = { shortDescription: 'pizza' } -->

```js
const { id, title, photos } = post;
const description =
  post?.description ?? post?.shortDescription;
```

<!-- expect(description).toBe('pizza') -->

It’s consistent and short, and avoids repeating `description` and `shortDescription`.

### Document rules

There’s nothing more annoying than a linter demanding to change the code just because there’s a rule saying that one way of coding a particular pattern is better than all others.

We should document all linter rules that deviate from recommended configs, at least as comments in the config file.

Here’s a decent example of a linter config:

```js
// eslint.config.mjs
export default [
  {
    rules: {
      // [2021-01-28]: the spirit of the rule is good, but
      // clashes with some naming conventions in Next.Js
      // and React
      'unicorn/prevent-abbreviations': [
        'error',
        {
          ignore: [
            '.*Props',
            '.*Ref',
            'props',
            'params',
            'ref'
          ]
        }
      ],

      // [2021-02-16]: This conflicts with cases where you
      // explicitly want to provide `undefined` to
      // a function, eg the default variable of a hook
      'unicorn/no-useless-undefined': ['off'],

      // [2022-06-07]: Allow us to write event handlers
      // without an explicit return; on the last line
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false
        }
      ]
    }
  }
];
```

And even this config could benefit from some examples.

### Don’t disable linter rules for the whole file

The following comment disables the [no-await-in-loop](https://eslint.org/docs/latest/rules/no-await-in-loop) rule for the whole file:

<!-- eslint-skip -->

```js
/* eslint-disable no-await-in-loop */
```

The problem with this approach is that we still want to see warnings about `await` in loops by default, unless we decide that this particular usage is valid.

It’s better to disable linter rules for a specific line:

<!--
let fetchPhotos = (endpoint) => ({photos: [endpoint], next: false})
-->

<!-- eslint-skip -->

```js
const allPhotos = [];
let url = '/photos?page=1';

for (;;) {
  // eslint-disable-next-line no-await-in-loop
  const { photos, next } = await fetchPhotos(url);

  allPhotos.push(...photos);
  url = next;

  if (next === false) {
    break;
  }
}
```

<!-- expect(allPhotos).toEqual(['/photos?page=1']) -->

### Don’t disable all linter rules for a line

Disabling a specific linter rule on a particular line, rather than all rules, allows the linter to catch other issues in the same line. This is similar to the previous tip.

Consider this example:

<!--
let console = { log: vi.fn() }
let files = ['eins', 'zwei']
-->

<!-- eslint-skip -->

```js
// eslint-disable-next-line
console.log(files.length == 1 ? 'file' : 'files');
```

<!-- expect(console.log).toHaveBeenCalledWith('files') -->

We’re disabling all linter rules for a line, and this line may trigger at least two rules: [no-console](https://eslint.org/docs/latest/rules/no-console) because of using `console.log()`, and [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq) because of using `==` instead of `===`. Both rules are useful: the first prevents committing debug output, and the second avoids less strict comparisons.

Here, we do want to use `console.log()` to display results to the user, but `==` instead of `===` is a typo, and we want the linter to warn us so we can fix it. We can achieve this by disabling a specific linter rule for this line:

<!--
let console = { log: vi.fn() }
let files = ['eins', 'zwei']
-->

<!-- eslint-skip -->

```js
// eslint-disable-next-line no-console
console.log(files.length === 1 ? 'file' : 'files');
```

<!-- expect(console.log).toHaveBeenCalledWith('files') -->

T> Developing command-line tools is a rare case where disabling `console.log()` for the entire file might be a good idea — we’ll likely have way too many of these logs, and disabling linter for each would clutter the code and reduce readability.

T> The [unicorn/no-abusive-eslint-disable](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-abusive-eslint-disable.md) linter rule requires specifying rules in `eslint-disable` comments.

### Disable style rules

In the past, we used linters not only to find bugs in the code but also to establish a consistent code style. Now, code formatters do this job better, and there’s little need to keep style rules in our linter configs.

I> We’ll cover a few exceptions later in this chapter. We talk more about code style in the [Code style](#code-style) chapter, and about code formatting in the [Autoformat your code](#formatting) chapter.

### Don’t overpolice the code

Unless the coding culture in the team is especially miserable (and in this case, instead of fighting it, you’re better off updating your CV), a linting setup that’s too rigid does more harm than good. It’s better to trust our colleagues and expect that they know how to do their job, allowing us to use linters to catch bugs and code reviews to discuss different approaches. There’s always more than one correct way to do something in programming, and a linter that enforces only one way doesn’t solve any real problems but makes our colleagues suffer more.

## My top 11 linter rules that should have never existed

Many linter rules don’t solve any actual problems with the code; they merely enforce a particular way of writing code — a preference of one of the team members. Many of these rules are purely aesthetic.

Below is a selection of rules that create more problems than they solve. Luckily, none of these rules are included in recommended configs, but I’ve seen them all in real projects. These rules remind us that we shouldn’t try to validate and control everything. And I’m not the only one who [gets mad because of a linter rule](https://x.com/iamsapegin/status/1230760798584098817).

### [no-undefined](https://eslint.org/docs/latest/rules/no-undefined)

This rule disallows the use of `undefined`.

One of the many JavaScript quirks is that there are two keywords that do pretty much the same but at the same time are disturbingly different: `undefined` and `null`.

I have always preferred `undefined` over `null`, and it seems the language does too: for example, default values for function parameters and object destructuring are triggered by `undefined`, not `null`. I [almost never use `null`](https://github.com/sindresorhus/meta/discussions/7), disallowing `undefined` would make us write awkward code without solving any real problems.

It’s true that one can overwrite the value of `undefined`, but I wouldn’t worry about this now, especially if we’re using TypeScript.

Some programmers believe that `null` and `undefined` have different semantics: they say `null` is _the intentional absence of any value_, while `undefined` means _the value was never defined or unknown_. To me, it’s 50 shades of nothingness, and I doubt many developers reading code with both (`null` and `undefined`) would know the difference.

### [no-else-return](https://eslint.org/docs/latest/rules/no-else-return)

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

```js
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

I prefer the latter, and I call this pattern _parallel coding_. However, both are perfectly fine, and I’d never ask anyone to use one of these patterns instead of the other.

I> We talk more about parallel coding in the [Don’t make me think](#no-thinking) chapter.

### [id-length](https://eslint.org/docs/latest/rules/id-length)

This rule allows us to define the minimum and maximum length for an identifier because short names could be potentially less readable, which is true in many cases. However, like any attempt to measure code quality by its physical characteristics, this rule does more harm than good.

For example, this code will be flagged because the `i` variable name is “too short”:

<!-- let console = { log: vi.fn() } -->

<!-- eslint-disable unicorn/no-for-loop -->

```js
const array = ['eins', 'zwei', 'drei'];
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}
```

<!-- expect(console.log.mock.calls).toEqual([['eins'], ['zwei'], ['drei']]) -->

I> We talk about naming in the [Naming is hard](#naming) chapter.

### [max-classes-per-file](https://eslint.org/docs/latest/rules/max-classes-per-file)

This rule limits the number of JavaScript classes in a file. With the default options, it only allows one class per file.

This is an artificial requirement. Splitting code into modules is a skill that can’t be reduced to a linter rule. Often, keeping tiny utility classes, functions, or components at the top of the module that uses them makes the code easier to navigate and maintain.

I> We talk about splitting code into modules in the [Divide and conquer, or merge and relax](#divide) chapter.

There are other similar rules that try to artificially limit the number of React components, lines of code, statements, and so on and so forth. The only useful rule of this kind is `max-params` (see below).

### [no-constant-condition](https://eslint.org/docs/latest/rules/no-constant-condition)

This rule prevents us from writing unnecessary conditions where the condition is constant:

<!-- eslint-skip -->

```js
if (1 === 1 + 5) {
  // We’ll never get here
}
```

<!-- expect($1).toBe(false) -->

This rule can catch a few bugs, but its scope is limited. For example, it won’t catch the same problem here:

```js
const cuantosTacos = 42;
if (cuantosTacos === 41) {
  // We’ll never get here
}
```

<!-- expect($1).toBe(false) -->

In addition, by default, this rule prevents us from writing infinite loops like this:

<!-- test-skip -->

```js
while (true) {
  // Infinite loop
}
```

The only way this rule accepts is:

<!-- test-skip -->

```js
for (;;) {
  // Infinite loop
}
```

I don’t have a problem with either way of writing an infinite loop, and I don’t see any reason to ban one of them.

We can disable loop checking in the rule options; however, the usefulness of this rule is questionable.

### [no-warning-comments](https://eslint.org/docs/latest/rules/no-warning-comments)

This rule disallows todo and fixme comments. This is how the documentation describes it:

> Developers often add comments to code which is not complete or needs review. Most likely you want to fix or review the code, and then remove the comment, before you consider the code to be production ready.

This statement is utterly disconnected from reality: in real projects, it’s often impractical or impossible to fix all issues before code hits production, and disallowing such comments leads to lower quality of the comments, not higher quality of the code.

I> We talk more about comments, and todo comments in particular, in the [Avoid comments](#no-comments) chapter.

### [one-var](https://eslint.org/docs/latest/rules/one-var) and [vars-on-top](https://eslint.org/docs/latest/rules/vars-on-top)

These rules require defining all variables at the beginning of the scope in a single `const` or `let` declaration:

<!-- eslint-disable unicorn/no-for-loop -->

```js
function find(array, query) {
  var i,
    found = false;
  for (i = 0; i < array.length; i++) {
    if (array[i] === query) {
      found = true;
      break;
    }
  }
  return found;
}
```

<!--
expect(find([1, 2, 3], 2)).toBe(true)
expect(find([1, 2, 3], 5)).toBe(false)
-->

I call this _Pascal style_, and it makes the code harder to read.

I> We talk about it in the [Avoid Pascal-style variables](#no-pascal-vars) section of the _Avoid reassigning variables_ chapter.

### [sort-vars](https://eslint.org/docs/latest/rules/sort-vars), [sort-keys](https://eslint.org/docs/latest/rules/sort-keys), and others

All rules that enforce a particular order of variables (inside a `let` or `const` declaration), object keys, React component props, CSS properties, and so on — they are all evil!

Alphabetic sorting looks neat, but is rarely useful for code. Often, some kind of semantic order is more readable. Consider this CSS:

```css
.banner {
  background-color: salmon;
  color: maroon;
  font-size: 2rem;
  left: 0;
  line-height: 1.5;
  padding: 0.5rem;
  position: absolute;
  right: 0;
  top: 0;
}
```

Here, related properties (like `position`, `top`, `right`, and `left`; or `font-size`, and `line-height`) are separated, making the code hard to understand. Compare it with semantic grouping:

```css
.banner {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  padding: 0.5rem;
  font-size: 2rem;
  line-height: 1.5;
  background-color: salmon;
  color: maroon;
}
```

Here, we have position and layout first, then fonts, and finally colors. It’s natural to see `top`, `right`, and `left` properties right after `position`, not scattered across the block. Similarly, it’s natural to see `font-size` and `line-height` together. I always write CSS like this — there’s no strict order of individual properties, but general grouping makes the code more readable.

The issue with semantic sorting and grouping is that different people might have different ideas of what belongs together, and it can be challenging to implement. For example, sorting CSS properties consistently requires having a list of all possible properties.

T> [CSScomb](https://github.com/csscomb/csscomb.js) and [stylelint-semantic-groups](https://github.com/theKashey/stylelint-semantic-groups) sort CSS properties using semantic groups.

Probably, the only exception where alphabetic sorting combined with logical grouping makes sense is `import`s (see `sort-imports` below).

### [complexity](https://eslint.org/docs/latest/rules/complexity)

This rule enforces the _maximum cyclomatic complexity allowed in a program_.

The definition in the docs is too complex for me to even understand what this rule does exactly:

> Cyclomatic complexity measures the number of linearly independent paths through a program’s source code.

As I understand it, the cyclomatic complexity is the same as the number of conditional branches, but I may be wrong. For example, this code has a complexity of three:

```js
function isItCake(a, b, c) {
  if (a) {
    return true;
  } else if (b) {
    return true;
  } else {
    return false;
  }
}
```

<!--
expect(isItCake(true, false, false)).toBe(true)
expect(isItCake(false, false, true)).toBe(false)
-->

And so is this:

```js
function isItCake(a, b, c) {
  return a || b || c;
}
```

<!--
expect(isItCake(true, false, false)).toBe(true)
-->

I’m not a huge fan of teeny-tiny functions in general, especially when the linter is the one demanding them, and I think having an arbitrary limit isn’t helping anyone.

I> We talk about splitting code into functions in the [Divide and conquer, or merge and relax](#divide) chapter.

## Useful rules when used correctly

### [eqeqeq](https://archive.eslint.org/docs/rules/eqeqeq)

This rule requires us to use type-safe equality operators `===` and `!==` instead of `==` and `!=` that do type coercion. This is generally considered a good practice because it may prevent certain bugs where the type coercion gives unexpected results.

For example, `3 == '3'` is okay and expected but `[1] == true` is not (though `[0] == false`, which is inconsistent with how conditions work, where `[]`, `[0]`, and `[1]` are all truthy, meaning `if ([0])` would take the `if` branch, not the `else` branch).

I> A _truthy value_ is a value that is considered `true` during type conversion to a boolean and includes `true`, non-zero numbers (including negative numbers), non-empty strings, arrays, and objects (even empty ones), and [a few others](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

One common use case for `==` is comparison to `null`:

<!-- let result = undefined -->

```js
if (result == null) {
  // No result
}
```

<!-- expect($1).toBe(true) -->

Which would be the same as a strict comparison to `null` or `undefined`:

<!-- let result = undefined -->

```js
if (result === null || result === undefined) {
  // No result
}
```

<!-- expect($1).toBe(true) -->

In my projects, this pattern isn’t common enough to allow an exception, and I can write an expanded comparison using `===` when I need it.

Shockingly, this rule isn’t included in the recommended ESLint config; however, it’s partially autofixable.

### [array-callback-return](https://eslint.org/docs/latest/rules/array-callback-return)

This rule requires using the `return` statement in array method callbacks (such as `map()`, `filter()`, `find()`, or `reduce()`).

This helps avoid bugs when we forget to return a value from a callback:

<!--
let array = ['Eins', 'Zwei', 'Drei']
let fn = () => {
-->

<!-- eslint-skip -->

```js
// WARNING: This code will fail
const indexMap = array.reduce((memo, item, index) => {
  memo[item] = index;
}, {});
```

<!--
}
expect(fn).toThrow(`Cannot set properties of undefined (setting 'Zwei')`);
-->

This code will fail at runtime, because on the second iteration, the accumulator (`memo`) will be `undefined`. We need to return the accumulator from the callback function:

<!-- let array = ['eins', 'zwei', 'polizei'], memo = {} -->

```js
const indexMap = array.reduce((memo, item, index) => {
  memo[item] = index;
  return memo;
}, {});
```

<!-- expect(indexMap).toEqual({eins: 0, zwei: 1, polizei: 2}) -->

This rule also prevents the abuse of array methods. For example, using `map()` instead of `forEach()`:

<!--
let console = { log: vi.fn() }
let errorMessages = ['out of cheese']
-->

<!-- eslint-skip -->

```js
// WARNING: Don’t do this
errorMessages.map(message => {
  console.log(message);
});
```

<!-- expect(console.log).toHaveBeenCalledWith('out of cheese') -->

We should only use the `map()` method when we want to produce a new array based on an existing one of the same length. For side effects, we should use the `forEach()` method:

<!--
let console = { log: vi.fn() }
let errorMessages = ['out of cheese']
-->

<!-- eslint-disable unicorn/no-array-for-each -->

```js
errorMessages.forEach(message => {
  console.log(message);
});
```

<!-- expect(console.log).toHaveBeenCalledWith('out of cheese') -->

I> See the [Avoid loops](#no-loops) chapter for many more examples of using array methods.

This rule is not autofixable and isn’t included in the recommended config.

### [curly](https://archive.eslint.org/docs/rules/curly)

I rarely complain about code style, but conditions and loops written without braces are my pet peeve. They’re too easy to miss when reading code, especially when the condition or loop header is long:

<!--
let errors = ['out of cheese']
let displayErrors = vi.fn()
-->

<!-- eslint-skip -->

```js
if (errors.length > 0) displayErrors(errors);
```

<!-- expect(displayErrors).toHaveBeenCalledWith(['out of cheese']) -->

The `curly` rule requires braces for all loops and conditions:

<!--
let errors = ['out of cheese']
let displayErrors = vi.fn()
-->

```js
if (errors.length > 0) {
  displayErrors(errors);
}
```

<!-- expect(displayErrors).toHaveBeenCalledWith(['out of cheese']) -->

I> See a more detailed explanation and additional examples in the [Code style](#code-style) chapter.

This rule is autofixable but isn’t included in the recommended config.

### [max-params](https://eslint.org/docs/latest/rules/max-params)

This rule limits the number of parameters a function can have. It may sound similar to `max-classes-per-file`, but it’s actually useful.

Consider this example:

<!--
let resizeImage = (...args) => args.join(';'), filepath = 'lenna.jpg'
let result =
-->

```js
resizeImage(filepath, 800, 600, 0.75, true);
```

<!-- expect(result).toBe('lenna.jpg;800;600;0.75;true') -->

I can guess that 800 and 600 are the desired width and height of an image, but what about `0.75` and `true`?

Let’s replace the positional parameters with an object:

<!--
let resizeImage = (filename, options) => `${filename};${Object.values(options).join(';')}`, filepath = 'lenna.jpg'
let result =
-->

```js
resizeImage(filepath, {
  width: 800,
  height: 600,
  quality: 0.75,
  cropToSquare: true
});
```

<!-- expect(result).toBe('lenna.jpg;800;600;0.75;true') -->

Now, everything is clear, and we can make any of the parameters optional.

I> To learn more about the problem this rule solves, see the [Name function parameters](#func-param-naming) section of the _Naming is hard_ chapter.

This rule is not autofixable and isn’t included in the recommended config. The default configuration allows a maximum of three function parameters — the same number I’d use myself.

### [sort-imports](https://eslint.org/docs/latest/rules/sort-imports)

This rule requires ordering `import` statements in a specific way: by type, alphabetically, or both.: by type, alphabetically, or both.

Automatic imports often make code messy. Enabling this rule as a warning with autofixing on a pre-commit or pre-push hook keeps imports tidy. However, without autofixing, this rule does more harm than good.

T> Visual Studio Code and WebStorm allows hiding the block of import statements by default and expand it only when needed.

This rule is partially autofixable but isn’t included in the recommended config.

### [@typescript-eslint/ban-ts-comment](https://typescript-eslint.io/rules/ban-ts-comment/)

TypeScript is a great tool, but sometimes it’s impossible or too hard to type things correctly. Often, the reason is incomplete or incorrect types for third-party libraries. Sometimes, we need to tell the TypeScript compiler to shut the duck up with the `// @ts-ignore` comment, and then we need to tell the linter to shut the duck up because there’s a rule that disallows `ts-ignore` comments… So we end up with this:

<!--
let pizza, makePizza = (...x) => pizza = x.join('-')
let dough = 'dough', sauce = 'sauce', salami = 'salami'
-->

```ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
makePizza(dough, sauce, salami);
```

<!-- expect(pizza).toBe('dough-sauce-salami') -->

This is bloodcurdling and causes more problems than it solves. Fortunately, newer versions of TypeScript and the ESLint TypeScript plugin offer a better solution: TypeScript allows adding explanations to `@ts-*` comments, and the `@typescript-eslint/ban-ts-comment` rule can require them. It also allows us to limit the types of `@ts-*` comments:

```js
// eslint.config.mjs
import tseslint from 'typescript-eslint';
export default tseslint.config({
  rules: {
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description'
      }
    ]
  }
});
```

Here, we allow only `@ts-expect-error` comments and require an explanation for each comment.

Then we can write something like this, and it won’t trigger a linting error:

<!--
let pizza, makePizza = (...x) => pizza = x.join('-')
let dough = 'dough', sauce = 'sauce', salami = 'salami'
-->

```ts
// @ts-expect-error: The Pizzalib types are incorrect
makePizza(dough, sauce, salami);
```

<!-- expect(pizza).toBe('dough-sauce-salami') -->

The difference with the `@ts-ignore` comments is that `@ts-expect-error` shows an error when there’s no compiler error on the next line, making it easier to remove comments that are no longer needed. For example, if we add `@ts-expect-error` comment because of incorrect types in a third-party library, once the types are fixed, our code will stop compiling, requiring us to remove the `@ts-expect-error` comment.

Unfortunately, we still can’t specify a particular TypeScript error for `@ts-expect-error` comments (similar to `eslint-disable-next-line`), and they disable type checking entirely for the whole line, so use them carefully.

This rule is not autofixable but is included in the recommended config. The default configuration is similar to the example above and only allows `@ts-expect-error` comments with a description.

### The Unicorn plugin

The [Unicorn ESLint plugin](https://github.com/sindresorhus/eslint-plugin-unicorn) has over 100 useful rules to improve codebase consistency and promote modern JavaScript features.

Many refactorings and patterns I suggest in this book can be automated by this plugin. Here are some of the rules:

- [explicit-length-check](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/explicit-length-check.md): enforce explicit comparisons of the `length` or `size` property of a value.
- [no-abusive-eslint-disable](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-abusive-eslint-disable.md): enforce specifying rules to disable in eslint-disable comments.
- [no-array-callback-reference](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-callback-reference.md): prevent passing a function reference directly to iterator methods.
- [no-array-for-each](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-for-each.md): prefer `for…of` loops over the `forEach()` method.
- [no-for-loop](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-for-loop.md): prefer `for…of` loops over `for` loops.
- [no-negated-condition](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-negated-condition.md): disallow negated conditions.
- [no-nested-ternary](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-nested-ternary.md): disallow nested ternary expressions.

However, some rules are a bit too opinionated, so feel free to disable anything that doesn’t work for you.

Most rules are autofixable. However, be careful: some rules can make your code too modern, potentially breaking compatibility with some browsers you need to support.

## Linting legacy code

Setting up a linter on an existing project can be challenging. The recommended ESLint config alone, without any extra plugins, can report thousands of issues. Fixing them all at once would take too much time, so we need to introduce them gradually.

My approach would be as follows:

1. Add ESLint to the project.
2. Enable the recommended config.
3. Autofix all autofixable issues.
4. Disable the recommended config.
5. Review the most common issues and decide which ones aren’t important for your team. Disable them.
6. Define the rest of the failing rules as warnings, so they don’t block merging.
7. Agree with your team to fix all warnings in the code they modify.
8. Enable rules one by one as they are fixed.
9. Reenable the recommended config, and remove manually enabled rules that are no longer needed.

I> Fixing all linting issues in a file while making changes to it is a good application of the campsite rule. We talk about it more in the [Become a code scout](#campsite-rule) section of the _Other techniques_ chapter.

Having multiple configs can also help: for example, add a separate, less strict config for integration tests.

T> Organize a _lint day_ with your team, where everyone spends a full day fixing as many linting issues as possible.

## The ideal linting setup

The UX of linters is still very poor and hasn’t improved much in the last ten years. Mostly, they just vomit a bunch of cryptic error messages without any explanation, leaving you to deal with them alone.

This setup is focused on minimizing distractions. Showing squiggles for autofixable issues distracts developers and doesn’t make sense, as such issues don’t require any action.

There are two parts to setting up linters: project setup and editor configuration.

Let’s start with the project configuration:

1. Start with the recommended ESLint rules, `eslint:recommended`.
2. Add recommended configs of ESLint plugins for the project’s stack (see below).
3. Add a few extra rules that make sense for your team.
4. Add ESLint with autofix to a Git pre-commit or pre-push hook using [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/lint-staged/lint-staged) to make sure that all the code in the repository is linted.

T> I don’t like to have linters on a pre-commit hook because they don’t allow committing unfinished code to a branch, either as a backup or to share it with someone. Running linters on the pre-push hook instead is a good compromise. We can also skip the hooks with the `--no-verify` option of the `git commit` command.

Our ESLint config could look like this:

```js
// eslint.config.mjs
import js from '@eslint/js';
export default [
  js.configs.recommended,
  {
    rules: {
      // Require === and !== instead of == and !=
      eqeqeq: 'error',
      // Require `return` statements in array method callbacks
      'array-callback-return': 'error',
      // Require braces in control statements
      curly: 'warn',
      // Maximum three function parameters
      'max-params': 'error'
    }
  }
];
```

Or like this if we use TypeScript:

```js
// eslint.config.mjs
import js from '@eslint/js';
import ts from 'typescript-eslint';
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      // All other rules…
    }
  }
];
```

T> Here’s [my shared ESLint config](https://github.com/sapegin/eslint-config-tamia) that I use on all my projects (including this book).

Now, let’s configure the editor. Here’s how I do it in Visual Studio Code:

1. Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
2. Turn off the display of autofixable issues.
3. Disable ESLint autofixing and autoformatting on file save in the editor.
4. Bind a new command to the Cmd+S hotkey that runs linter autofixing, autoformatting, and saves the file.

See a more detailed explanation in the [Learn your code editor](#editing) chapter.

## Recommended ESLint plugins

There are hundreds of plugins for ESLint. I have these plugins on many of my projects and find them more useful than annoying:

- [TypeScript](https://github.com/typescript-eslint/typescript-eslint): rules for TypeScript code; also includes replacements for built-in ESLint rules that work with TypeScript.
- [Import](https://github.com/import-js/eslint-plugin-import): validates imports in our code, makes sure modules we’re trying to import exist, and export what we’re importing. It’s useful for vanilla JavaScript projects; TypeScript already does most of these checks.
- [React](https://github.com/jsx-eslint/eslint-plugin-react): React and JSX rules.
- [React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks): enforcing the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) for React projects.
- [JSX Accessibility](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y): accessibility in JSX, uses Axe Core.
- [Jest](https://github.com/jest-community/eslint-plugin-jest): ensures our tests do what we expect, and prevents committing disabled tests, among other checks.
- [Vitest](https://github.com/vitest-dev/eslint-plugin-vitest): similar but for Vitest.
- [Testing Library](https://github.com/testing-library/eslint-plugin-testing-library): rules for Testing Library.
- [Jest DOM](https://github.com/testing-library/eslint-plugin-jest-dom): rules for jest-dom.
- [Cypress](https://github.com/cypress-io/eslint-plugin-cypress): rules for Cypress.
- [Playwright](https://github.com/playwright-community/eslint-plugin-playwright): rules for Playwright.
- [Unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn): useful rules to improve codebase consistency and promote modern JavaScript.

Other plugins mentioned in the book:

- [Better mutation](https://github.com/sloops77/eslint-plugin-better-mutation): disallows any mutation except for local variables in functions.
- [Functional](https://github.com/eslint-functional/eslint-plugin-functional): disables mutation and promotes functional programming.

## Not just for JavaScript

Linters exist for almost any programming or markup language. Besides ESLint, I have experience with two others:

- [Stylelint](https://stylelint.io): a linter for CSS that also supports CSS preprocessors and styled-components.
- [Textlint](https://textlint.github.io): a linter for Markdown and plain text. I use it extensively to check this book and [my blog](https://sapegin.me/blog/).

T> I created [several plugins for Textlint](https://www.npmjs.com/search?q=maintainer%3Asapegin%20keywords%3Atextlint) to ensure consistent terminology, avoid buzzwords and clichés, and so on.

---

Linters are useful to prevent bugs and maintain a consistent codebase, but they can also be misused.

On the one hand, it can be a good idea to automate code style checks by adding linter rules for every section of our coding style guide. On the other hand, a codebase with too many linter rules can be intimidating and rigid for developers working with it.

Ideally, all linter rules should be autofixable to prevent developers wasting time tailoring their code to satisfy esoteric linter rules. If it’s impossible or too difficult to make an autofixable rule, we should really think whether it’s worth having such a rule at all.

I wish linters would show links to the team style guide for each error, so developers could read an explanation why a particular team added a particular rule. Explanations in the linter docs are hopelessly generic and unhelpful. I also wish such documentation existed for more projects.

No linter rule is coded in stone: it’s always up to a programmer writing code whether to follow a certain rule, disable it for a single line, or remove it from the linter config altogether.

Start thinking about:

- Adding linter rules for things you often comment during code reviews.
- Removing linter rules that are frustrating, or you often disable with special comments.
- Adding linter rules for typos and bugs that often go unnoticed.
- Adding linter plugins for your UI framework, test runners, and so on, to promote best practices for these tools.
