# Preface

_For Dessi, the one and only programming dachshund._

This book is everything I’ve learned about writing code since I retyped my first BASIC program from a book into a Soviet ZX Spectrum clone in the late 1990s. Of course, I’ve learned some other things since then, but this book focuses on the craft of programming — writing clean code.

Everything I’ve learned while working as a frontend developer for over two decades. Everything I’ve learned by making my personal projects. Everything I’ve learned by developing and maintaining my open source projects. Everything I’ve learned by reviewing hundreds of pull requests…

We, programmers, read code more often than we write it, so it makes more sense to optimize code for the ease of reading instead of the ease of writing. The practice of writing code that is easy to read is called _clean code_.

This book will be opinionated, but you don’t have to agree with everything I’m saying. That’s not the goal of the book — the goal is to show you one of the possible paths and inspire you to find your own. These techniques and patterns help me to write and review code every day, and I’ll be happy if you find some of them useful.

The book is probably most useful for intermediate developers. If you’re a beginner, you’ll likely have plenty of other things to think about, though you may still find the book useful. If you have decades of experience, you can probably write a similar book yourself (and if you do — let me know). Either way, I’d be happy to hear your feedback.

While most readers will probably be frontend or full stack developers, there’s plenty of useful content for everyone, even if you don’t write JavaScript or other frontend languages.

I’ve taken most of the examples from real projects, with only minor adaptations — mostly different names. Usually, I spend several hours every week reviewing other developers’ code, and that gives me enough experience to tell which patterns make the code more readable and which don’t.

I’ll try to keep this book up-to-date as some kind of living document for myself and my poor memory. I’ll also try to update the examples with new JavaScript features as they become available.

And remember, for programmers, the “Answer to the Ultimate Question of Life, the Universe, and Everything” is “it depends”. There are no strict rules in programming.

_Artem, Berlin/Valencia, 2024_

# Introduction

## How to read this book

You don’t have to read the book in any particular order: all chapters are independent, and no chapter requires knowledge from any other chapter. You can read the whole thing from start to finish, or you can only read chapters you’re curious about in any order that suits you best.

The first four chapters are about the basics of writing clean code.

In the [Avoid loops](#no-loops) chapter, we talk about iterating over collections and why traditional loops, such as `for` or `while`, may not be the best way of doing that.

In the [Avoid conditions](#no-conditions) chapter, we continue exploring the best practices for writing clean code: crafting good conditions and simplifying code by removing unnecessary conditions.

In the [Avoid reassigning variables](#no-reassigning) chapter, we talk about improving code readability by making it easier to understand what variables are do and how they are used in the code.

In the [Avoid mutation](#no-mutation) chapter, we continue the topic of working with variables and talk about mutation: why it hinders code readability and how we can avoid it.

The next two chapters are about the more humanistic side of coding.

In the [Avoid comments](#no-comments) chapter, we talk about writing useful comments, when to comment our code, and when it’s better not to.

In the [Naming is hard](#naming) chapter, we talk about how clear names make it easier to understand the code, and how to improve naming in our code.

The next four chapters are a bit of a mix of architecture, heuristics, tips and tricks, and so on:

In the [Divide and conquer, or merge and relax](#divide) chapter, we talk about splitting code into functions and modules, when the right time is to introduce an abstraction, and when it’s better to sleep on it.

In the [Don’t make me think](#no-thinking) chapter, we talk about all the different ways programmers like to write clever code, and why we should avoid clever code as much as possible.

In the [Code style](#code-style) chapter, we talk about code styles: which ones actually improve readability and which are merely preferences that don’t matter much.

In the [Other techniques](#otter) chapter, we talk about everything else that didn’t fit into previous chapters.

The last three chapters are about tooling.

In the [Lint your code](#linting) chapter, we talk about how linters can help us maintain a consistent and modern codebase, and promote some of the techniques discussed in the book.

In the [Autoformat your code](#formatting) chapter, we talk about how tools can make our lives easier by formatting code for us.

In the last chapter, [Learn your code editor](#editing), we talk about various techniques for editing code and customizing our environment to make our work more efficient and less tiring.

## About code examples

I was debating whether to use JavaScript or TypeScript for the examples in the book. While JavaScript is simpler, TypeScript is more realistic. I’ve been using TypeScript almost exclusively since 2020. Previously, I used Flow for several years, which is another, now forgotten, implementation of types for JavaScript.

However, many “bad” examples are originally written in JavaScript, and I’d either need to add types to them before refactoring or add them during the process. The latter would be more realistic, but I feel it would distract from a particular technique I’m showing. Most techniques in this book apply to both, JavaScript and TypeScript code, with only a few specific to TypeScript.

I mostly work with React these days, so you’ll see examples using React quite often. Occasionally, you’ll see CSS and HTML, as similar ideas can be applied there as well.

I strive to keep the book up-to-date with the latest versions of JavaScript. This book uses ECMAScript 2024.

I> ECMAScript is the JavaScript spec that defines its syntax and behavior. To learn about new JavaScript features, check out Dr. Axel Rauschmayer’s book, [Exploring JavaScript](https://exploringjs.com/js/).

The examples are formatted using Prettier with a maximum line length of 62 characters to avoid unnecessary wrapping in the PDF and print versions of the book. This makes code examples more readable, though a bit narrower than most developers are used to.

I> We talk about code formatting and Prettier in the [Autoformat your code](#formatting) chapter.

Where appropriate, I added the result of calculations in the code using comments like this:

```js
const inputs = ['1', '2', '3'];
const integers = inputs.map(value => Number.parseInt(value));
// → [1, 2, 3]
```

<!-- expect(integers).toEqual([1, 2, 3]) -->

And where the code is incorrect or won’t compile at all, I added warning comments:

<!-- let inputs = ['1', '2', '3'] -->
<!-- eslint-disable unicorn/no-array-callback-reference -->

```js
// WARNING: This code is incorrect
const integers = inputs.map(Number.parseInt);
// → [1, NaN, NaN]
```

<!-- expect(integers).toEqual([1, NaN, NaN]) -->

Some examples include a comment with their filename. Mostly, it’s either config files (where the filename is significant) or files that are later imported in another example:

```js
// eslint.config.mjs
import js from '@eslint/js';
export default [js.configs.recommended];
```

I also use the [Lodash](https://lodash.com/) utility library in some examples. I try to provide alternative solutions without dependencies where it makes sense, but often the benefits of using a well-written, popular library outweigh the cost. I consistently use the `_` namespace for Lodash methods in the book:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

W> In 2024 it’s still more efficient to import separate modules from Lodash. I use the `_` imports here mostly for convenience, but such imports may increase the bundle size.

T> We talk about third-party libraries and their trade-offs in the [Avoid not invented here syndrome](#no-nih) section of the _Other techniques_ chapter.

## Acknowledgments

These folks helped me with the book in one way or another.

<!-- cspell:disable -->

Thanks to [Manuel Bieh](https://www.manuelbieh.de/en), [Inês Carvalho](https://ines.omg.lol), [Alexei Crecotun](https://crecotun.com), [Evan Davis](https://github.com/evandavis), [Dr. Margarita Diaz Cortes](https://drtaco.net), [Ohans Emmanuel](https://www.ohansemmanuel.com/), [Troy Giunipero](https://github.com/giuniperoo), [Anssi Hautamäki](https://github.com/kosminen), [Oleg Isonen](https://x.com/oleg008), [Darek Kay](https://darekkay.com/), Anita Kiss, [Giorgi Kotchlamazashvili](https://hertz.gg), [Andy Krings-Stern](https://github.com/ankri) [Veniamin Krol](https://vkrol.com), [Monica Lent](https://monicalent.com/), [Mihail Malostanidis](https://x.com/qm3ster), Diana Martinez, [Nick Plekhanov](https://nikkhan.com), [Jon Randy](https://dev.to/jonrandy), Rostislav U, [Dr. Axel Rauschmayer](https://dr-axel.de/), [Misha Reyzlin](https://mishareyzlin.com), [Dan Uhl](https://github.com/danieluhl), [Juho Vepsäläinen](https://survivejs.com/), [Michel Weststrate](https://michel.codes), [Mark Wiltshire](https://github.com/mwiltshire).

<!-- cspell:enable -->
