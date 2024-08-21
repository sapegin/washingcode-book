# Conclusion

All the topics covered in this book, aren’t hard rules, but ideas for possible improvements. When I say _avoid conditions, mutation, reassignments, or something else_, I don’t mean _never use them_, more like _there might be a better solution_.

There are valid use cases for all programming techniques, maybe even `goto`, who knows. I’m probably too young to know. The only certain thing is that the answer to any question about programming is: _it depends_. No matter how many likes this solution has on Stack Overflow, it may not be the best choice for your case.

So the goal of this book isn’t to teach you how to write good code, but to teach you to notice certain patterns, or code smells, that can _often_ (not _always_) be improved.

And remember: we write code for our colleagues and future us, so they can understand it. We should prioritize code readability and trust our gut feelings over whatever random people on the internet or linters tell us to do.

Also remember this: _code is evil_. Our job isn’t writing code but solving our client’s problems, whether it’s our employer or ourselves. Code is a by-product, a necessary evil. Don’t be too attached to your code: one day it’ll be rewritten or deleted, that’s why we call it _software_.

<!-- cspell:disable -->

# Index of teqniques and patterns

Here’s a list of all teqniques and patterns described in the book.

- [Colocation](#colocation).
- [Condition expansion](#condition-expansion).
- [`defaultProps` for testing React components](#hydrated).
- [Early returns](#early-returns).
- [Hiding complexity](#hide-complexity).
- [Inline refactoring](#inline).
- [Parallel coding](#parallel).
- [Range conditions](#range-conditions).
- [Readable numbers](#readable-numbers).
- [Sections, paragraphs, phrases](#sections-etc).
- [Separation of “what” and “how”](#what-how).
- [Separation of code that changes often](#often-changed).
- [Single responsibility principle](#colocation).
- [WET](#hydrated) (write everything twice, or we enjoy typing).

# Index of antipatterns

Here’s a list of all antipatterns described in the book.

- [DRY](#grow-abstractions) (don’t repeat yourself).
- [Monster utility files](#monster-utilities).
- [Shortcuts](#shortcuts).

# Resources

## Books

- [The Art of Readable Code](https://www.amazon.com/gp/product/0596802293/) by Dustin Boswell
- [Code Complete: A Practical Handbook of Software Construction](https://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670/) by Steve McConnell
- [Exploring JavaScript](https://exploringjs.com/js/) by Dr. Axel Rauschmayer
- [The Practice of Programming](https://www.amazon.com/Practice-Programming-Addison-Wesley-Professional-Computing/dp/020161586X/) by Brian Kernighan and Rob Pike
- [The Pragmatic Programmer: Your journey to mastery, 20th Anniversary Edition](https://www.amazon.com/Pragmatic-Programmer-journey-mastery-Anniversary-ebook/dp/B07VRS84D1/) by David Thomas and Andrew Hunt
- [The Programmers’ Stone](https://www.datapacrat.com/Opinion/Reciprocality/r0/index.html) by Alan Carter and Colston Sanger
- [Refactoring: Improving the Design of Existing Code](https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599) by Martin Fowler

## Articles

- [AHA programming](https://kentcdodds.com/blog/aha-programming) by Kent C. Dodds
- [Array reduce vs. chaining vs. for loop](https://kentcdodds.com/blog/array-reduce-vs-chaining-vs-for-loop) by Kent C. Dodds
- [The case for Discriminated Union Types with TypeScript](https://thoughtbot.com/blog/the-case-for-discriminated-union-types-with-typescript) by Alejandro Dustet
- [Cargo Cult Software Engineering](https://stevemcconnell.com/articles/cargo-cult-software-engineering/) by Steve McConnell
- [Clever code considered harmful](https://www.joshwcomeau.com/career/clever-code-considered-harmful/) by Josh Comeau
- [Code Health: Reduce Nesting, Reduce Complexity](https://testing.googleblog.com/2017/06/code-health-reduce-nesting-reduce.html?m=1) by Elliott Karpilovsky
- [Code Health: To Comment or Not to Comment?](https://testing.googleblog.com/2017/07/code-health-to-comment-or-not-to-comment.html?m=1) by Dori Reuveni and Kevin Bourrillion
- [Cognitive Load is what matters](https://github.com/zakirullin/cognitive-load) by Artem Zakirullin
- [Colocation](https://kentcdodds.com/blog/colocation) by Kent C. Dodds
- [Everything is a Component](https://medium.com/@level_out/everything-is-a-component-cf9f469ad981) by Luke Hedger
- [Implicit Assertions](https://www.epicweb.dev/implicit-assertions) by Artem Zakharchenko
- [Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html) by Martin Fowler
- [It’s probably time to stop recommending Clean Code](https://qntm.org/clean) by qntm
- [John Carmack on Inlined Code](http://number-none.com/blow/blog/programming/2014/09/26/carmack-on-inlined-code.html)
- [Learning Code Readability](https://medium.com/@egonelbre/learning-code-readability-a80e311d3a20) by Egon Elbre
- [Linear code is more readable](https://blog.separateconcerns.com/2023-09-11-linear-code.html) by Pierre “catwell” Chapuis
- [Making Wrong Code Look Wrong](https://www.joelonsoftware.com/2005/05/11/making-wrong-code-look-wrong/) by Joel Spolsky
- [Modern React Testing](https://sapegin.me/blog/react-testing-1-best-practices/) by Artem Sapegin
- [Naming conventions in programming — a review of scientific literature](https://makimo.com/blog/scientific-perspective-on-naming-in-programming/) by Iwo Herka
- [On the changing notion of code readability](https://github.com/kbilsted/CodeQualityAndReadability/blob/master/Articles/Readability/TheChangingNotionOfReadability.md) by Kasper B. Graversen
- [Outliving the Great Variable Shortage](https://www.rssing.com/noserver.html?a=4) by Tim Ottinger
- [Psychology of Code Readability](https://egonelbre.com/psychology-of-code-readability/) by Egon Elbre
- [Small Functions considered Harmful](https://copyconstruct.medium.com/small-functions-considered-harmful-91035d316c29) by Cindy Sridharan
- [The “Bug-O” Notation](https://overreacted.io/the-bug-o-notation/) by Dan Abramov
- [The Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/) by Joel Spolsky
- [The wrong abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction) by Sandi Metz
- [Too DRY — The Grep Test](https://jamie-wong.com/2013/07/12/grep-test/) by Jamie Wong
- [Why I don’t like reduce](https://tkdodo.eu/blog/why-i-dont-like-reduce) by TkDodo
- [Why the Boy Scout Rule Is Insufficient](https://www.codewithjason.com/boy-scout-rule-insufficient/) by Jason Swett
- [Why you should enforce Dangling Commas for Multiline Statements](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8) by Nik Graf
- [Write code that is easy to delete, not easy to extend](https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to)
- [Writing system software: code comments](http://antirez.com/news/124)
- [The Zen of Python](https://peps.python.org/pep-0020/)

## Talks

- [Beyond PEP 8: Best practices for beautiful intelligible code](https://www.youtube.com/watch?v=wf-BqAjZb8M) by Raymond Hettinger, PyCon 2015
- [Building resilient frontend architecture](https://www.youtube.com/watch?v=brMZLmZ1HR0) by Monica Lent, React Finland 2019
- [The WET codebase](https://overreacted.io/the-wet-codebase/) by Dan Abramov, Deconstruct 2019.

<!-- cspell:enable -->

## Please review the book

If you liked the book, I’ll appreciate your review! I’ve spent many hours writing and editing it, and your review will help to make it more visible to others and help me continue improving it.

Until the book is final and available on Amazon, and so on, please send me your review at [artem@sapegin.ru](mailto:artem@sapegin.ru).

## Got feedback?

This book is full of opinions, and I don’t expect you’ll agree with them all. That’s expected and it was never my goal to convince my readers that my opinions are the only right ones. I wanted to make my readers think of certain things and start a dialogue.

Let me know what you think at [artem@sapegin.ru](mailto:artem@sapegin.ru).

## Found an issue?

I’ve tried my best to check all the facts, fix all the typos, and test all the examples in the book, but I’m sure I missed many. If you spot anything fishy, please [file an issue on GitHub](https://github.com/sapegin/washingcode-book/issues) or write me at [artem@sapegin.ru](mailto:artem@sapegin.ru).
