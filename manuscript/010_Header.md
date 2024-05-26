# Preface

_For Dessi, the one and only programming dachshund._

This book is about what I’ve learned about writing code since I retyped my first BASIC program from a book into a Soviet clone of ZX Spectrum in 1997. I’ve learned many other things since then, but this book focuses on the craft of programming — writing clean code.

Everything I’ve learned while working as a frontend engineer for almost 20 years. Everything I’ve learned on my personal projects. Everything I’ve learned by developing and maintaining my open source projects. Everything I’ve learned reviewing hundreds of pull requests…

We, programmers, read code more often than we write it, so it makes more sense to optimize for the ease of reading instead of the ease of writing. The practice of writing code that is easy to read is known as _clean code_.

This book is going to be opinionated, but you don’t have to agree with everything I’m saying. That’s not the goal of the book. The goal is to show you one of the possible paths, and inspire you to find your own. These techniques help me to write and review code every day, and I’ll be happy if you find some of them useful.

The book is probably most useful for intermediate developers. If you’re a beginner, you’ll likely have plenty of other things to think about. If you have decades of experience, you can probably write a similar book yourself. Either way, I’d be happy to hear your feedback.

Most of the examples in this book are in JavaScript with a bit of TypeScript because these are my main languages, but you can apply many ideas to other languages too. Sometimes you’ll see CSS and HTML because similar ideas can be applied there too.

I’ve taken most of the examples from real code, with only minor adaptations — mostly different names. I spend several hours every week reviewing other developers’ code, and that gives me enough experience to tell which patterns make the code more readable and which don’t.

I’ll try to keep this book up-to-date, as some kind of a living document for myself and my poor memory.

And remember the “Answer to the Ultimate Question of Life, the Universe, and Everything” for programmers is “it depends” — there are no strict rules in programming.

_Artem, Berlin_

# How to read this book

You don’t have to read the book in any particular order: all chapters aren’t connected and no chapter requires the knowledge from any other chapter. You could read the whole thing from start to finish, or you could read only chapters you’re curious about in any order that suits you best.

The first four chapters are about the basics of writing clean code:

In the **Avoid loops** chapter, we talk about working with iterations and why traditional `for` loops may not be the best way of doing that.

In the **Avoid conditions** chapter, we continue exploring the best ways to write clean code: writing good conditions and simplifying our code by avoiding them.

In the **Avoid reassigning variables** chapter, we talk about improving code readability by making it easier to understand what variables are doing and how they are used in the code.

In the **Avoid mutation** chapter, we continue the topic of working with variables and talk about mutation: why it’s hindering code readability and what can we do about it.

The next two chapters are about more humanistic side of coding:

In the **Avoid comments** chapter, we talk about writing useful comments, when to write them and when not.

In the **Naming is hard** chapter, we talk about how clear names make it easier to understand the code, and how to improve naming in our apps.

The next four chapters are a bit of a mix of architecture, heuristics, tips and tricks, and so on:

In the **Divide and conquer, or merge and relax** chapter, we talk about splitting code into functions and modules, when is the right time to introduce an abstraction, and when it’s better to wait.

In the **Don’t make me think** chapter, we talk about all the different ways programmers like to write clever code, and why we should avoid it as much as possible.

In the **Code style** chapter, we talk about code styles: which ones are actually improving readability and which are just opinions that don’t matter much.

In the **Other techniques** chapter, we talk about everything else that didn’t fit into other chapters.

The last four chapters are about tooling:

In the **Lint your code** chapter, we talk about how linters can help us maintain consistent and modern codebase, and promote some of the techniques discussed in the previous chapters.

In the **Autoformat your code** chapter, we talk about how tools can make our lives much easier by formatting code for us.

In the last chapter, **Learn your code editor**, we talk about different techniques for _editing_ code and customizing our environment to make our work more efficient and less tiring.

# JavaScript of TypeScript?

Most of the examples in this book are written in JavaScript which isn’t how I write code in the past five or so years. These days I mostly write in TypeScript — JavaScript with types. And before that I was using Flow for several years, which is now forgotten.

I was debating whether to use JavaScript or TypeScript for the examples in the book. JavaScript is simpler, but TypeScript is more realistic. However, many “bad” examples are in JavaScript originally, and I’d have to either add types to them before doing all the refactorings or add types as part of the refactoring process. The latter would be more realistic but I feel it would distract from the topic of a particular chapter.

# Acknowledgments

These folks helped me with the book in one way or another.

<!-- cspell:disable -->

Thanks to [Manuel Bieh](https://twitter.com/ManuelBieh), [Inês Carvalho](https://imcarvalho.github.io/), [Evan Davis](https://github.com/evandavis), [Dr. Margarita Diaz Cortes](https://drtaco.net), [Ohans Emmanuel](https://www.ohansemmanuel.com/), [Troy Giunipero](https://github.com/giuniperoo), [Anssi Hautamäki](https://github.com/kosminen), [Oleg Isonen](https://twitter.com/oleg008), [Darek Kay](https://darekkay.com/), Anita Kiss, [Giorgi Kotchlamazashvili](https://github.com/hertzg), [Andy Krings-Stern](https://github.com/ankri) [Veniamin Krol](https://vkrol.dev/), [Monica Lent](https://monicalent.com/), [Mihail Malostanidis](https://twitter.com/qm3ster), Diana Martinez, [Nick Plekhanov](https://nikkhan.com), Rostislav U, [Dr. Axel Rauschmayer](https://dr-axel.de/), [Misha Reyzlin](https://mishareyzlin.com), [Dan Uhl](https://github.com/danieluhl), [Juho Vepsäläinen](https://survivejs.com/), [Michel Weststrate](https://twitter.com/mweststrate), [Mark Wiltshire](https://github.com/mwiltshire).

<!-- cspell:enable -->
