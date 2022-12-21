### Don’t be clever

Clever code is a kind of code you may see in job interview questions or language quizzes. When they expect you to know how a language feature, you maybe have never seen before, works. My answer to all these questions is “it won’t pass code review”.

#### Dark patterns of JavaScript

Let’s look at some examples. Try to cover an answer and guess what these code snippets do. And count how many you’ve guessed right.

Example 1:

<!-- const percent = 5 -->

```js
const percentString = percent.toString().concat('%');
```

This code only adds the `%` sing to a number, and should be rewritten as:

<!-- const percent = 5 -->

```js
const percentString = `${percent}%`;
```

Example 2:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (~url.indexOf('id')) {}
```

The `~` is called the _bitwise NOT_ operator. It’s useful effect here is that it returns a falsy value only when the `.indexOf()` returns `-1`. This code should be rewritten as:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (url.indexOf('id') !== -1) {}
```

Or better:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (url.includes('id')) {}
```

Example 3:

<!-- prettier-ignore -->
```js
~~3.14
```

Another dark use of the bitwise NOT operator to discard a fractional portion of a number. Use `Math.floor()` instead:

<!-- prettier-ignore -->
```js
Math.floor(3.14)
```

Example 4:

<!-- const dogs = [], cats = [] -->

<!-- prettier-ignore -->
```js
if (dogs.length + cats.length > 0) {}
```

This one is easy when you spend some time with it, but better make this code obvious:

<!-- const dogs = [], cats = [] -->

<!-- prettier-ignore -->
```js
if (dogs.length > 0 && cats.length > 0) {}
```

Example 5:

```js
const header = 'filename="pizza.rar"';
const filename = header.split('filename=')[1].slice(1, -1);
```

This one took me a lot of time to understand. Imagine we have a portion of a URL, like `filename="pizza"`. First, we split the string by `=` and take the second part, `"pizza"`. Then we slice the first and the last characters to get `pizza`.

I’d probably use a regular expression here:

```js
const header = 'filename="pizza.rar"';
const filename = header.match(/filename="(.*?)"/)[1];
```

Or the `URLSearchParams` API if I had access to it:

```js
const header = 'filename="pizza.rar"';
const filename = new URLSearchParams(header)
  .get('filename')
  .replace(/^"|"$/g, '');
```

_These quotes are weird though. Normally you don’t need quotes around URL params, so talking to your backend developer could be a good idea._

Example 6:

<!-- const condition = true -->

```js
const obj = {
  ...(condition && { value: 42 })
};
```

Adding a property to an object when the `condition` is true, don’t do anything otherwise. The intention is more obvious when we explicitly define object to destructure, and don’t rely on destructuring of falsy values:

<!-- const condition = true -->

```js
const obj = {
  ...(condition ? { value: 42 } : {})
};
```

I usually prefer when object don’t change their shapes, so I’d move the condition inside the `value` field:

<!-- const condition = true -->

```js
const obj = {
  value: condition ? 42 : undefined
};
```

So, what’s your score? I think mine would be around 3/6.

#### Gray areas

Some patterns are on the border of cleverness.

For examples, using `Boolean` to filter out falsy array items:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(Boolean)
// -> ["Not", "enough", "cheese."]
```

I think this pattern is acceptable, and, though you need to learn it once, it’s better than the alternative:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => !!item)
// -> ["Not", "enough", "cheese."]
```

But you should keep in mind that both variations filter out _falsy_ values, so if zeroes or empty strings are important to you, you’ll need to explicitly filter for `undefined` or `null`:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => item != null)
// -> ["Not", "enough", 0, "cheese."]
```
