### Avoid comments

Some developers never comment their code, some comment too much. The former believe that the code should be self-documenting, the latter read somewhere that they should always comment their code.

Both are wrong.

I don’t believe in self-documenting code. Yes, we should rewrite unclear code to make it more obvious, and use meaningful and correct names, but there are things that can’t be experessed by the code alone.

Commenting too much isn’t helpful either: comments start to repeat the code, and instead of helping to understand it, they introduce noise and repetition.

#### Getting rid of comments (or not)

There’s a popular technique of avoiding comments: when we want to explain a block of code in a comment, we should move this piece of code to its own function instead.

It’s often a good idea to extract complex calculations and conditions used inside an already long line of code:

<!--
class Test {
  resize = 1
  wasInitialized() { return true }
  test(platform, browser) {
 -->

```js
if (
  platform.toUpperCase().indexOf('MAC') > -1 &&
  browser.toUpperCase().indexOf('IE') > 1 &&
  this.wasInitialized() &&
  this.resize > 0
) {
  return true;
}
```

<!--
    return false
  }
}
const test = new Test();
expect(test.test('Mac_PowerPC', 'Mozilla/4.0 (compatible; MSIE 5.17; Mac_PowerPC)')).toBe(true)
expect(test.test('MacInter', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50')).toBe(false)
-->

Here, we could extract the conditions into their own functions or variables with meaningful names:

<!--
class Test {
  resize = 1
  wasInitialized() { return true }
  test(platform, browser) {
 -->

```js
const isMacOs = platform.toUpperCase().includes('MAC');
const isIE = browser.toUpperCase().includes('IE');
const wasResized = this.resize > 0;
if (isMacOs && isIE && this.wasInitialized() && wasResized) {
  return true;
}
```

<!--
    return false
  }
}
const test = new Test();
expect(test.test('Mac_PowerPC', 'Mozilla/4.0 (compatible; MSIE 5.17; Mac_PowerPC)')).toBe(true)
expect(test.test('MacInter', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.50')).toBe(false)
-->

Now, the condition is shorter and more readable, because names help us to understand what the condition does in the context of the code.

However, I don’t think that splitting a linear algorithm, even a long one, into several functions, and then calling them one after another, makes code more readable. Jumping between functions (and even more so – files) is harder than scrolling, and if we have to look into functions’ implementations to understand the code, then the abstraction wasn’t the right one. Naming could be a problem too, when all the extracted functions are parts of the same algorithm.

Overall, I don’t like when the code is measured by its physical metrics, like number of lines. Long functions aren’t always hard to read and modify, And the really complex code could be tiny. We talk about code splitting in more detail in the [Divide and conquer, or merge and relax](#divide-and-conquer-or-merge-and-relax) chapter.

#### Good comments

Comments are useful to answer _why_ code is written in a certain, often mysterious, way:

- If the code is fixing a bug or is a workaround for a bug in a third-party library, a ticket number or a link will be useful.
- If there’s an obvious simpler alternative solution, a comment should explain why this solution doesn’t work in this case.
- If different platforms behave differently, and the code accounts for this, it should be also mentioned in a comment.

Such comments will save us from accidental “refactoring” that makes code easier but removes some necessary functionality or breakes it for some users.

High-level comments, explaining how code works, are useful too. If the code implements an algorithm, explained somewhere else, a link to that place would be useful.

And any hack should be explained in a `HACK` or `FIXME` comment:

<!-- class Test { -->

```js
  // HACK: Importing defaultProps from another module crashes Storybook Docs,
  // so we have to duplicate them here
  static defaultProps = {
    label: '',
  }
```

<!-- } -->

`TODO` comments are okay (more like _okayish_) too, if they contain a ticket number when something will be done. Otherwise they are just dreams that will likely never come true. Unless _a dream_ is exactly what we want to document: a desire that the code was doing more than it does – error handling, special cases, supporting more platforms, minor features, and so on – but it wasn’t implemented due to, probably, lack of time.

<!--
const Environment = {
  DEV: 'DEV',
  QA: 'QA',
  PROD: 'PROD',
}
-->

```js
// TODO: On React Native it always returns DEV, since there's no actual location available
const getEnvironment = (hostname = window.location.hostname) => {
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

**Idea:** Maybe we should start using `DREAM` comments for such cases...

#### Bad comments

We’ve talked about useful comments. However, there are many more kinds of comments that we should never write.

Probably the wost kind of comments are comments explaining _how_ code works. They either repeat the code in a more verbose language, or explain language features:

```js
// Fade timeout = 2 seconds
const FADE_TIMEOUT_MS = 2000;
```

```js
// This will make sure that your code runs
// in the strict mode in the browser
'use strict';
```

Code comments isn’t the best place to teach teammates how to use certain language features. Code reviews, pair programming sessions, and team documentation would be more suitable and efficient.

Next, _fake_ comments: they pretend to explain some decision, but actually they don’t explain anything, and othen blame someone else for poor code and tech debt:

<!-- const locale = 'ko' -->

```js
// force 24 hours formatting for Chinese and Korean
const hour12 = locale === 'zh' || locale === 'ko' ? false : undefined;
```

<!-- expect(hour12).toBe(false) -->

I see lots of these comments in one-off design "adjustments". For example, a comment will say that there was a _design requirement_ to use a non-standard color but it won’t explain why it was required and why none of the standard colors worked in that case:

```scss
.shareButton {
  color: #bada55; // Using non-standard color to match design
}
```

And by lots I mean really _plenty_:

```js
// Design decision

// This is for biz requirements

// Non-standard background color needed for design

// Designer's choice

// Using non-standard color to match design
```

_Requirement_ is a very tricky and dangerous word. Often what’s treated as a requirement is just a lack of education and collaboration between developers, designers, and project managers. If we don’t know why something is required, we should always ask, and the answer could be flabbergasting!

There may be no _requirement_ at all, and we can use a standard color from the project theme:

```scss
.shareButton {
  color: $text-color--link;
}
```

Or there may be a real reason to use a non-standard color, that we may put into a comment:

```scss
$color--facebook: #3b5998; // Facebook brand color
.shareButton {
  color: $color--facebook;
}
```

In any case it’s our responsibility to ask _why_ as many times as necessary.

Same with comments that explain conditions: there may be no need for a special case, and we could remove the whole condition with its comment. See more in the [Avoid conditons](#avoid-conditions) chapter.

---

Start thinking about:

- Replacing a comment with a meaningfuly named function.
- Removing comments that don’t add anything that’s not already in the code.
- Asking why documented requirement or decision exists in the first place.
