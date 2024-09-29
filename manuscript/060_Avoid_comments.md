{#no-comments}

# Avoid comments

<!-- description: Writing useful comments, when to comment our code, and when it’s better not to -->

Some programmers never comment their code, while others comment too much. The former believe code should be self-documenting, while the latter have read somewhere that they should comment every line of their code.

Both are wrong.

I don’t believe in self-documenting code. Yes, we should rewrite unclear code to make it more obvious and use meaningful, correct names, but some things can’t be expressed by the code alone.

Commenting too much doesn’t help either: comments start to repeat the code, and instead of aiding understanding, they clutter the code and distract the reader.

Let’s talk about writing useful comments.

## Getting rid of comments (or not)

Some programmers have a habit of creating a new function whenever they need to explain a block of code. Instead of writing a comment, they turn the comment text into a function name. Most of the time there’s no benefit, and often it reduces code readability and clarity of comments (function names are less expressive than comment text).

Here’s a typical example of code I usually write:

<!--
let window = { showInformationMessage: () => {} }
let logMessage = () => {}
class Test {
  quickPick = {
    hide: () => {}
  }
  getRelativePath() { return 'src/foo.txt' }
  getAbsolutePath() { return '/stuff/src/foo.txt' }
  isDirectory() { return true }
  ensureFolder() { return true }

  test() {
-->

```js
async function createNew() {
  const relativePath = this.getRelativePath();
  const fullPath = this.getAbsolutePath();

  if (this.isDirectory()) {
    // User types a folder name: foo/bar/
    logMessage('Creating a folder:', fullPath);

    // Create a folder with all subfolders
    const created = await this.ensureFolder(fullPath);
    if (created === false) {
      return;
    }

    // There seem to be no API to reveal a folder in Explorer,
    // so show a notification instead
    window.showInformationMessage(
      `Folder created: ${relativePath}`
    );
  } else {
    // User types a file name: foo/bar.ext
    logMessage('Creating a file:', fullPath);

    // Check if file already exists
    if (fs.existsSync(fullPath)) {
      // Open the file and show an info message
      await window.showTextDocument(Uri.file(fullPath));
      window.showInformationMessage(
        `File already exists: ${relativePath}`
      );
      return;
    }

    // Create an empty file
    const created = await this.ensureFile(fullPath);
    if (created === false) {
      return;
    }

    // Open the new file
    await window.showTextDocument(Uri.file(fullPath));
  }

  this.quickPick.hide();
}
```

<!--
    return true;
  }
}
let test = new Test()
expect(test.test).not.toThrowError()
-->

Let’s try to replace comments with function calls:

<!--
let window = { showInformationMessage: () => {} }
let logMessage = () => {}
class Test {
  quickPick = {
    hide: () => {}
  }
  getRelativePath() { return 'src/foo.txt' }
  getAbsolutePath() { return '/stuff/src/foo.txt' }
  isDirectory() { return true }
  ensureFolder() { return true }

  test() {
-->

```js
async function createDirectory(fullPath, relativePath) {
  logMessage('Creating a folder:', fullPath);

  const created = await this.ensureFolder(fullPath);
  if (created === false) {
    return;
  }

  window.showInformationMessage(
    `Folder created: ${relativePath}`
  );
}

async function openExistingFile(fullPath, relativePath) {
  await window.showTextDocument(Uri.file(fullPath));
  window.showInformationMessage(
    `File already exists: ${relativePath}`
  );
}

async function createFile(fullPath, relativePath) {
  logMessage('Creating a file:', fullPath);

  if (fs.existsSync(fullPath)) {
    await this.openExistingFile(fullPath, relativePath);
    return;
  }

  const created = await this.ensureFile(fullPath);
  if (created === false) {
    return;
  }

  await window.showTextDocument(Uri.file(fullPath));
}

async function createNew() {
  const relativePath = this.getRelativePath();
  const fullPath = this.getAbsolutePath();

  if (this.isDirectory()) {
    await this.createDirectory(fullPath, relativePath);
  } else {
    await this.createFile(fullPath, relativePath);
  }

  this.quickPick.hide();
}
```

<!--
    return true;
  }
}
let test = new Test()
expect(test.test).not.toThrowError()
-->

The main condition (is directory?) is now more visible and the code has less nesting. However, the `openExistingFile()` method adds unnecessary indirection: it doesn’t contain any complexity or nesting worth hiding away, but now we need to check the source to see what it actually does. It’s hard to choose a name that is both concise and clearer than the code itself.

Each branch of the main condition has only one level of nesting, and the overall structure is mostly linear, so it doesn’t make sense to split them further than extracting each branch into its own method. Additionally, comments provided a high-level overview and the necessary context, allowing us to skip blocks we aren’t interested in.

On the other hand, the `isDirectory()` and `ensureFile()` are good examples of methods, as they abstract away generic low-level functionality.

Overall, I don’t think that splitting a function into many small functions just because it’s “long” makes the code more readable. Often, it has the opposite effect because it hides important details inside other functions, making it harder to modify the code.

I> We talk about code splitting in more detail in the [Divide and conquer, or merge and relax](#divide) chapter.

Another common use for comments is complex conditions:

<!--
let regExp = /y/
let textEditor = {
  document: {
    lineCount: 9,
    lineAt: () => ({text: 'xxxx'})
  }
}
let decorate = vi.fn()
-->

```js
function handleChange({
  contentChanges,
  decoratedLines,
  lineCount
}) {
  const changedLines = contentChanges.map(
    ({ range }) => range.start.line
  );

  // Skip decorating for certain cases to improve performance
  if (
    // No lines were added or removed
    lineCount === textEditor.document.lineCount &&
    // All changes are single line changes
    contentChanges.every(({ range }) => range.isSingleLine) &&
    // Had no decorators on changed lines
    changedLines.every(
      x => decoratedLines.has(x) === false
    ) &&
    // No need to add decorators to changed lines
    changedLines.some(x =>
      regExp?.test(textEditor.document.lineAt(x).text)
    ) === false
  ) {
    return;
  }

  decorate();
}
```

<!--
decorate.mockClear();

handleChange({
  contentChanges: [
    {range: {start: { line: 4 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).not.toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 10
})
expect(decorate).toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: false }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).toHaveBeenCalled()
-->

In the code above, we have a complex condition with multiple clauses. The problem with this code is that it’s hard to see the high-level structure of the condition. Is it `something && something else`? Or is it `something || something else`? It’s hard to see what code belongs to the condition itself and what belongs to individual clauses.

We can extract each clause into a separate variable or function and use comments as their names:

<!--
let regExp = /y/
let textEditor = {
  document: {
    lineCount: 9,
    lineAt: () => ({text: 'xxxx'})
  }
}
let decorate = vi.fn()
-->

```js
function handleChange({
  contentChanges,
  decoratedLines,
  lineCount
}) {
  const changedLines = contentChanges.map(
    ({ range }) => range.start.line
  );

  const lineCountHasChanged =
    lineCount !== textEditor.document.lineCount;
  const hasMultilineChanges = contentChanges.some(
    ({ range }) => range.isSingleLine === false
  );
  const hadDecoratorsOnChangedLines = changedLines.some(x =>
    decoratedLines.has(x)
  );
  const shouldHaveDecoratorsOnChangedLines =
    changedLines.some(x =>
      regExp?.test(textEditor.document.lineAt(x).text)
    );

  // Skip decorating for certain cases to improve performance
  if (
    lineCountHasChanged === false &&
    hasMultilineChanges === false &&
    hadDecoratorsOnChangedLines === false &&
    shouldHaveDecoratorsOnChangedLines === false
  ) {
    return;
  }

  decorate();
}
```

<!--
decorate.mockClear();

handleChange({
  contentChanges: [
    {range: {start: { line: 4 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).not.toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 10
})
expect(decorate).toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: false }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).toHaveBeenCalled()

handleChange({
  contentChanges: [
    {range: {start: { line: 5 }, isSingleLine: true }}
  ],
  decoratedLines: new Set([5]),
  lineCount: 9
})
expect(decorate).toHaveBeenCalled()
-->

In the code above, we separated levels of abstraction, so the implementation details of each clause don’t distract us from the high-level condition. Now, the structure of the condition is clear.

However, I wouldn’t go further and extract each clause into its own function unless they are reused.

I> We talk more about conditions in the [Avoid conditions](#no-conditions) chapter.

## Good comments

Good comments explain _why_ code is written in a certain, sometimes mysterious, way:

- If the code is fixing a bug or is a workaround for a bug in a third-party library, a ticket number or a link to the issue will be useful.
- If there’s an obvious, simpler alternative solution, a comment should explain why this solution doesn’t work in this case.
- If different platforms behave differently and the code accounts for this, it should be mentioned in a comment.
- If the code has known limitations, mentioning them (possibly using todo comments, see below) will help developers working with this code.

Such comments save us from accidental “refactoring” that makes the code easier but removes some necessary functionality or breaks it for some users.

High-level comments explaining how the code works are useful too. If the code implements an algorithm, explained somewhere else, a link to that place would be useful. However, if a piece of code is too difficult to explain and requires a long, convoluted comment, we should probably rewrite it instead.

{#hack-comments}

## Hack comments

Any hack should be explained in a _hack comment_:

<!-- let Button = {} -->

```js
// HACK: Importing defaultProps from another module crashes
// Storybook Docs, so we have to duplicate them here
Button.defaultProps = {
  label: ''
};
```

<!-- expect(Button.defaultProps).toHaveProperty('label') -->

Here’s another example:

<!--
let item = { image: 'pizza.jpg' }
let SliderSlide = () => null
let Test = () => (
-->

```jsx
// @hack: Use ! to override width:100% and height:100%
// hardcoded in Swiper styles
<SliderSlide
  key={item.image ?? item.text}
  className="mr-8 !h-auto !w-80 shrink-0 last:mr-0"
>
  …
</SliderSlide>
```

<!--
)
const {container: c1} = RTL.render(<Test />);
expect(c1.textContent).toEqual('')
-->

I> You may encounter various styles of hack comments: `HACK`, `XXX`, `@hack`, and so on, though I prefer `HACK`.

{#todo-comments}

## Todo comments

I like _todo comments_, and I add plenty of them when writing code. Todo comments can serve several purposes:

- **Temporary comments** that we add while writing code so we don’t forget what we want to do.
- **Planned improvements:** must haves that weren’t yet implemented.
- **Known limitations and dreams:** nice to haves that may never be implemented.

**Temporary comments** help us focus on the essentials when we write code by writing down everything we want to do or try later. Such comments are an essential part of my coding process, and I remove most of them before submitting my code for review.

I> You may encounter various styles of todo comments: `TODO`, `FIXME`, `UNDONE`, `@todo`, `@fixme`, and so on. I prefer `TODO`.

Comments for **planned improvements** are useful when we know that we need to do something:

<!--
let FavoriteType = {Taco: 'Taco'}
let fetchFavorites = ({favoriteType}) => favoriteType
-->

```js
const query = await fetchFavorites({
  favoriteType: FavoriteType.Taco
  // TODO: Implement pagination (TCO-321)
});
```

<!-- expect(query).toBe(FavoriteType.Taco) -->

It’s a good idea to include a ticket number in such comments, like in the example above.

There might be another condition, like a dependency upgrade, required to complete the task:

```js
/**
 * Manually toggle the window scroll functionality,
 * important especially when the modal is open from another
 * modal. In such cases HeadlessUI messes up the html element
 * state and the scroll is not working properly
 * See following:
 * https://github.com/tailwindlabs/headlessui/issues/1000
 * https://github.com/tailwindlabs/headlessui/issues/1199
 * The clean up is called after the modal is open and when
 * closed.
 * @todo [headlessui/react@>=2.0.0]: review if the issue is
 * fixed in HeadlessUI, debug in WebDev tools using the 6x
 * CPU slowdown
 */
function blockWindowScroll(active) {
  /* … */
}
```

This is a hell of a comment!

Comments for **known limitations and dreams** express a desire for the code to do more than it does. For example, error handling, special cases, support for more platforms or browsers, minor features, and so on. Such todos don’t have any deadlines or even the expectation that they will ever be resolved:

<!--
const Environment = {
  DEV: 'DEV',
  QA: 'QA',
  PROD: 'PROD',
}
-->

```js
// TODO: On React Native it always returns DEV, since there's
// no actual location available
const getEnvironment = (
  hostname = window.location.hostname
) => {
  if (hostname.includes('qa.')) {
    return Environment.QA;
  }
  if (hostname.includes('example.com')) {
    return Environment.PROD;
  }
  return Environment.DEV;
};
```

<!--
expect(getEnvironment('qa.example.com')).toBe('QA')
expect(getEnvironment('www.example.com')).toBe('PROD')
expect(getEnvironment('localhost')).toBe('DEV')
-->

T> Maybe we should start using `DREAM` comments for such cases…

However, there’s a type of todo comments I don’t recommend — comments with an expiration date:

```js
// TODO [2024-05-12]: Refactor before the sprint ends
```

The [unicorn/expiring-todo-comments](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/expiring-todo-comments.md) linter rule fails the build after the date mentioned in the comment. This is unhelpful because it usually happens when we work on an unrelated part of the code, forcing us to deal with the comment right away, most likely by adding another month to the date.

There are other conditions in the `unicorn/expiring-todo-comments` rule that might be more useful, such as the dependency version:

```js
// TODO [react@>=18]: Use useId hook instead of generating
// IDs manually
```

This is a better use case because it will fail only when someone updates React, and fixing such todos should probably be part of the upgrade.

T> I made a Visual Studio Code extension to highlight todo and hack comments: [Todo Tomorrow](https://marketplace.visualstudio.com/items?itemName=sapegin.todo-tomorrow).

## Comments that reduce confusion

Comments can make code more intentional. Consider this example:

<!--
const doOrDoNot = () => { throw new Error('x') }
function test() {
-->

<!-- eslint-skip -->

```js
try {
  doOrDoNot();
} catch {
  // eslint-disable-next-line no-empty
}
```

<!--
}
expect(test).not.toThrowError()
-->

In the code above, we disable the linter, which complains about missing error handling. However, it’s unclear why the error handling is missing.

We can make the code clearer by adding a comment:

<!--
const doOrDoNot = () => { throw new Error('x') }
function test() {
-->

```js
try {
  doOrDoNot();
} catch {
  // Ignore errors
}
```

<!--
}
expect(test).not.toThrowError()
-->

Now, it’s clear that we don’t care about errors in this piece of code. On the other hand, this comment:

<!--
const doOrDoNot = () => { throw new Error('x') }
function test() {
-->

```js
try {
  doOrDoNot();
} catch {
  // TODO: Handle errors
}
```

<!--
}
expect(test).not.toThrowError()
-->

Tells a different story: we want to add error handling in the future.

{#example-comments}

## Comments with examples

I like to add examples of input and output in function comments:

```js
/**
 * Returns a slug from a Markdown link:
 * [#](tres-leches-cake) → tres-leches-cake
 */
function getSubrecipeSlug(markdown) {
  /* … */
}
```

<!-- expect(getSubrecipeSlug).not.toThrowError() -->

Such comments help to immediately see what the function does without reading the code.

Here’s another example:

<!-- cspell:disable -->

```js
/**
 * Add IDs to headings.
 *
 * Copy of rehype-slug but handles non-breaking spaces by
 * converting them to regular spaces before generating slugs.
 * The original rehype-slug swallows non-breaking spaces:
 * rehype-slug: `best tacos in\xA0town` → `best-tacos-intown`
 * this module: `best tacos in\xA0town` → `best-tacos-in-town`
 */
function rehypeSlug() {
  /* … */
}
```

<!-- expect(rehypeSlug).not.toThrowError() -->
<!-- cspell:enable -->

In the code above, we don’t just give an example of the input and output, but also explain the difference with the original `rehype-slug` package and why a custom implementation exists in the codebase.

Usage examples are another thing to include in function comments:

```js
/**
 * React component which children are only rendered when
 * there is an active authenticated user session
 *
 * @example
 * <AuthenticatedOnly>
 *   <button>Add to favorites</button>
 * </AuthenticatedOnly>
 */
function AuthenticatedOnly({ children }) {
  /* … */
}
```

Such comments help to understand how to use a function or a component, highlight the necessary context, and the correct way to pass parameters.

T> When we use the JSDoc `@example` tag, Visual Studio Code shows a syntax-highlighted example when we hover on the function name anywhere in the code.

![Usage example tooltip in Visual Studio Code](images/jsdoc-example.png)

## Bad comments

We’ve talked about useful comments. However, there are many other kinds of comments that we should avoid.

Probably the worst kind of comments are those explaining _how_ code works. They either repeat the code in more verbose language or explain language features:

```js
// Fade timeout = 2 seconds
const FADE_TIMEOUT_MS = 2000;
```

Or:

```js
// This will make sure that your code runs
// in the strict mode in the browser
'use strict';
```

Such comments are good for coding tutorials, but not for production code. Code comments aren’t the best place to teach teammates how to use certain language features. Code reviews, pair programming sessions, and team documentation are more suitable and efficient.

Next, there are _fake_ comments: they pretend to explain some decision, but they don’t explain anything, and they often blame someone else for poor code and tech debt:

<!-- const locale = 'ko' -->

```js
// force 24 hours formatting for Chinese and Korean
const hour12 =
  locale === 'zh' || locale === 'ko' ? false : undefined;
```

<!-- expect(hour12).toBe(false) -->

Why do Chinese and Koreans need a different time format? Who knows; the comment only tells us what’s already clear from the code but doesn’t explain why.

I see lots of these comments in one-off design “adjustments.” For example, a comment might say that there was a _design requirement_ to use a non-standard color, but it won’t explain why it was required and why none of the standard colors worked in that case:

```scss
.shareButton {
  color: #bada55; // Using non-standard color to match design
}
```

And by lots, I mean really _plenty_:

```js
// Design decision

// This is for biz requirements

// Non-standard background color needed for design

// Designer's choice
```

_Requirement_ is a very tricky and dangerous word. Often, what’s treated as a requirement is just a lack of education and collaboration between developers, designers, and project managers. If we don’t know why something is required, we should always ask. The answer can be surprising!

There may be no _requirement_ at all, and we can use a standard color from the project theme:

```scss
.shareButton {
  color: $text-color--link;
}
```

Or there may be a real reason to use a non-standard color, that we can put into a comment:

```scss
$color--facebook: #3b5998; // Facebook brand color
.shareButton {
  color: $color--facebook;
}
```

In any case, it’s our responsibility to ask _why_ as many times as necessary; otherwise we’ll end up with mountains of tech debt that don’t solve any real problems.

---

Comments enrich code with information that cannot be expressed by the code alone. They help us understand why the code is written in a certain way, especially when it’s not obvious. They help us avoid disastrous “refactorings”, when we simplify the code by removing its essential parts.

However, if it’s too hard to explain a certain piece of code in a comment, perhaps we should rewrite such code instead of trying to explain it.

Finding a balance between commenting too much and too little is essential and comes with experience.

Start thinking about:

- Removing comments that don’t add anything to what’s already in the code.
- Adding hack comments to document hacks in the code.
- Adding todo comments to document planned improvements and dreams.
- Adding examples of input/output, or usage to function comments.
- Asking why a commented requirement or decision exists in the first place.
