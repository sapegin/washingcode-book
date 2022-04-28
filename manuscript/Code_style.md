### Code style

I used to be very strict about [code style](https://blog.sapegin.me/all/prettier/). I thought my code style was better than others, but later I’ve realized that it was just different. And it wasn’t the most popular, so anyone else’s code looked wrong to me.

For example, after reading the [The Programmers’ Stone](https://www.datapacrat.com/Opinion/Reciprocality/r0/index.html) I put braces like this for a long time:

<!-- const food = 'pizza', alert = () => {} -->

<!-- prettier-ignore -->
```js
if (food === 'pizza')
{
  alert('Pizza ;-)');
}
else
{
  alert('Not pizza ;-(');
}
```

Or I had two spaces in front of inline comments to better separate them from code:

<!-- prettier-ignore -->
```js
const volume = 200;  // ml
```

So if any other developer touched my code, they would immediately make it inconsistent, because unlikely they would follow _my code style_ — so uncommon it was. And code review would be a nightmare if I wanted to enforce _my code style_.

#### Not all code styles are good

I wasn’t entirely wrong though: not every code style makes code easy to read and maintain.

For example, this way of defining arrays make is harder to move or add new items:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie'
];
```

That’s because you’ll have to change two lines every time you want to do something at the end of an array. It also clutters the diff for the same reason:

```diff
const dogs = [
  'dachshund',
  'saluki',
-  'sheltie'
+  'sheltie',
+  'whippet'
];
```

[Trailing, or dangling, commas](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8) solve both problems without making code any harder to write or read:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
];
```

Now we need to change only one line:

```diff
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
+  'whippet',
];
```

#### Obsolete code styles

Sometimes developers follow a particular code style even if the initial reasoning behind it is no longer relevant.

Like using leading commas in arrays and objects when JavaScript didn’t support trailing commas:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund'
, 'saluki'
, 'sheltie'
];
```

The goal of this style was the same as of trailing commas in the previous section — to make adding new items easier and diffs more readable, but there are no reasons to use this anymore: Internet Explorer 8 was the last browser that didn’t support trailing commas. And now we transpile code with tools like Babel anyway, and Babel can and does remove trailing commas.

Another example is [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions), a style where you put a literal on the left side of a condition:

<!-- const meaning = 0 -->

<!-- prettier-ignore -->
```js
if (42 === meaning) {
}
```

It’s too easy to type `=` instead of `==` in languages like C and make an assignment instead o a comparison:

<!-- let meaning = 0 -->

<!-- prettier-ignore -->
```js
// Compare meaning with 42
if (meaning == 42) {
}

// Assign 42 to meaning
if (meaning = 42) {
}
```

This is much less relevant in JavaScript where the strict equality (`===`, values and types must be equal) is the preferred style and on most projects a linter will complain if you try to use the loose equality (`==`, only values must be equal). It’s really hard to miss two equal signs when typing `===`. So normal order or conditions is fine and easier to read:

<!-- const meaning = 0 -->

```js
if (meaning === 42) {
}
```

#### Nonsensical code styles

Some code styles don’t solve any particular problem, but have high maintenance cost.

Like aligning object values or right-hands of assignments horizontally to make them look “pretty”:

<!-- prettier-ignore -->
```js
var fs        = require('fs')
  , reamde   = require('reamde')
  , examples = reamde(fs.readFileSync('./README.md', 'utf-8'))
  ;
```

<!-- expect(examples).toEqual('./README.md') -->

That’s enormous amount of work and luckily code formatters will remove all the artisanal handcrafted spaces and make code look equally good without requiring any work from a developer:

```js
var fs = require('fs'),
  reamde = require('reamde'),
  examples = reamde(fs.readFileSync('./README.md', 'utf-8'));
```

<!-- expect(examples).toEqual('./README.md') -->

#### Improving readability

In many cases, some ways of writing code are more readable than other ways. Conditions, and especially conditions with negations are good examples. I used to write these as short as possible, now I prefer to be verbose and explicit. Saving a few keystrokes isn’t worth it when the code could be easily misinterpreted. Better learn touch typing.

Consider this example:

<!-- const object = {} -->

```js
if (!isEmpy(object)) {
}
```

It’s hard to notice the negation in `!i`. We could rewrite this code to avoid misunderstanding:

<!-- const object = {} -->

```js
if (isEmpy(object) === false) {
}
```

Someone may argue that it doesn’t read like English — "not is empty" — but there’s no way someone might miss the negation.


Here’s another example:

<!-- const guacamole = {} -->

```js
if (!('garlic' in guacamole)) {
}
```

This pattern was always awkward to write and read for me until my friend Oleg [opened a whole new world for me](https://twitter.com/oleg008/status/1519593163803049984). We could do the same trick as above to make it more readable:

<!-- const guacamole = {} -->

```js
if (('garlic' in guacamole) === false) {
}
```

Parentheses are optional here but I think they make it a tiny bit easier to read.

Another area where condition expansion improves readability is checking array length.

<!-- const puppies = [] -->

Consider these two examples:

```js
if (puppies.length) {
}
if (!puppies.length) {
}
```

They look almost the same and the `!` in front of the second one is easy to miss. Let’s expand them:

<!-- const puppies = [] -->

```js
if (puppies.length === 0) {
}
if (puppies.length > 0) {
}
```

Now the conditions look significantly different and there’s no way to misinterpret them.

I’m starting to think that using `!` in conditions is [generally an antipattern](https://twitter.com/Jack_Franklin/status/1189477268764188672), so instead of:

<!-- const isFriday = false -->

```js
if (!isFriday) {
}
```

We should always write:

<!-- const isFriday = false -->

```js
if (isFriday === false) {
}
```


#### The rest doesn’t matter

There are so many ways to write code. For example you could use function arguments like this:

```js
function ingredientToString(options) {
  return `${options.name} (${options.quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString(options) {
  const { name, quantity } = options;
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString({ name, quantity }) {
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

I prefer the last one for the reasons I explain in the [Naming is hard](#naming-is-hard) chapter, but I wouldn’t ask another developer to change their code just because they use another option: they are all fine.

A few more examples below. Named or namespaced imports:

```js
import React, { Component } from 'react';
class Lunch extends Component {}
```

Or:

```js
import React from 'react';
class Lunch extends React.Component {}
```

Old-style functions or arrow functions, explicit return or implicit return:

```js
function getDropdownOptions(options) {
  return options.map(option => option.value);
}
```

Or:

```js
const getDropdownOptions = options =>
  options.map(option => option.value);
```

Or the same with default export:

```js
const Button = props => <button className="Button" {...props} />;
export default Button;
```

Or:

```js
export default function Button(props) {
  return <button className="Button" {...props} />;
}
```

I can probably write a whole book of such examples.

In all the examples above I prefer the last variation but I’d never ask someone to change their code during code review if they use another variation. Next time you review someone else’s code and want to ask them to change a piece of code, ask yourself: does it really make code more readable and maintainable or just makes it look more familiar to me. If it’s the latter, please don’t write that comment.

#### How to choose the right code style

Choose [the most popular code style](https://blog.sapegin.me/all/javascript-code-styles/), unless a deviation significantly improves readability or maintainability of the code.

Automate as much as possible. [Prettier](https://prettier.io/) formats code with almost zero config, which saves enormous amount of time while you write code, read someone else’s code or discuss code style in your team.

The last point is especially important: developers could waste days arguing where to put spaces in the code, which doesn’t matter at all, but everyone has an opinion on it.

Prefer explicit over implicit, write code to maximize readability but don’t be too strict with others when they don’t do it the same way you would.
