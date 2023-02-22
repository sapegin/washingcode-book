### Don’t be clever

Clever code is a kind of code we may see in job interview questions or language quizzes. When they expect us to know how a language feature, we probably have never seen before, works. My answer to all these questions is: “it won’t pass code review”.

#### Dark patterns of JavaScript

Let’s look at some examples. Try to cover an answer and guess what these code snippets do. And count how many you’ve guessed right.

Example 1:

<!-- const percent = 5 -->

```js
const percentString = percent.toString().concat('%');
```

<!-- expect(percentString).toBe('5%') -->

This code only adds the `%` sing to a number, and should be rewritten as:

<!-- const percent = 5 -->

```js
const percentString = `${percent}%`;
```

<!-- expect(percentString).toBe('5%') -->

Example 2:

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
if (~url.indexOf('id')) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

The `~` is called the _bitwise NOT_ operator. It’s useful effect here is that it returns a falsy value only when the `.indexOf()` returns `-1`. This code should be rewritten as:

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
if (url.indexOf('id') !== -1) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Or better:

<!--
const url = 'index.html?id=5'
let result = false
-->

```js
if (url.includes('id')) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Example 3:

<!--
let result = (
-->

<!-- prettier-ignore -->
```js
~~3.14
```

<!--
)
expect(result).toBe(3)
-->

Another dark use of the bitwise NOT operator to discard a fractional portion of a number. Use `Math.floor()` instead:

<!--
let result = (
-->

<!-- prettier-ignore -->
```js
Math.floor(3.14)
```

<!--
)
expect(result).toBe(3)
-->

Example 4:

<!--
const dogs = [1], cats = [2]
let result = false
-->

```js
if (dogs.length + cats.length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This one is easy when we spend some time with it, but better make this code obvious:

<!--
const dogs = [1], cats = [2]
let result = false
-->

```js
if (dogs.length > 0 && cats.length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

Example 5:

```js
const header = 'filename="pizza.rar"';
const filename = header.split('filename=')[1].slice(1, -1);
```

<!-- expect(filename).toBe('pizza.rar') -->

This one took me a lot of time to understand. Imagine we have a portion of a URL, like `filename="pizza"`. First, we split the string by `=` and take the second part, `"pizza"`. Then we slice the first and the last characters to get `pizza`.

I’d probably use a regular expression here:

```js
const header = 'filename="pizza.rar"';
const filename = header.match(/filename="(.*?)"/)[1];
```

<!-- expect(filename).toBe('pizza.rar') -->

Or the `URLSearchParams` API if I had access to it:

```js
const header = 'filename="pizza.rar"';
const filename = new URLSearchParams(header)
  .get('filename')
  .replace(/^"|"$/g, '');
```

<!-- expect(filename).toBe('pizza.rar') -->

_These quotes are weird though. Normally we don’t need quotes around URL params, so talking to the backend developer could be a good idea._

Example 6:

<!-- const condition = true -->

```js
const obj = {
  ...(condition && { value: 42 })
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

Adding a property to an object when the `condition` is true, don’t do anything otherwise. The intention is more obvious when we explicitly define object to destructure, and don’t rely on destructuring of falsy values:

<!-- const condition = true -->

```js
const obj = {
  ...(condition ? { value: 42 } : {})
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

I usually prefer when object don’t change their shapes, so I’d move the condition inside the `value` field:

<!-- const condition = true -->

```js
const obj = {
  value: condition ? 42 : undefined
};
```

<!-- expect(obj).toEqual({ value: 42 }) -->

So, what’s your score? I think mine would be around 3/6.

#### Gray areas

Some patterns are on the border of cleverness.

For examples, using `Boolean` to filter out falsy array items:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(Boolean)
// -> ["Not", "enough", "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", "cheese."])
-->

I think this pattern is acceptable, and, though we need to learn it once, it’s better than the alternative:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => !!item)
// -> ["Not", "enough", "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", "cheese."])
-->

However, we should keep in mind that both variations filter out _falsy_ values, so if zeroes or empty strings are important to us, we need to explicitly filter for `undefined` or `null`:

<!-- let result = ( -->

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => item != null)
// -> ["Not", "enough", 0, "cheese."]
```

<!--
)
expect(result).toEqual( ["Not", "enough", 0, "cheese."])
-->
