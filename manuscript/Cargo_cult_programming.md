# Cargo cult programming

[Cargo cult programming](https://en.wikipedia.org/wiki/Cargo_cult_programming) is when developers use some technique because they’ve seen it works somewhere else, or they’ve been told it’s the right way of doing things.

Some examples of cargo cult programming:

- A developer copies a decade-old answer from Stack Overflow with fallbacks for old browsers which they don’t need to support anymore.
- A team applies old “best practices” even if the initial problem they were solving is no longer relevant.
- A developer applies a team “standard” to a case that should be an exception, and inadvertently makes the code worse, not better.

Code isn’t black and white: nothing is always bad (except global variables) or always good (except automation). We’re not working at an assembly line, and we should understand why we write each line of code.

## Never write functions longer than…

If you google “how long should be my functions”, you’ll find a lot of answers: all kinds of random numbers, like [half-a-dozen](https://martinfowler.com/bliki/FunctionLength.html), 10, 25 or 60.

Some developers will brag that all their functions are only one or two lines long. Some developers will say that you must create a new function every time you want to write a comment or add an empty line.

I think it’s a wrong problem to solve and the size itself is rarely a problem. However, long functions often hide real issues, like too many responsibilities or deep nesting.

## Always comment your code

Developers who believe that they must comment each (or at least most) line of their code are having a dangerous lifestyle, and not really better than those who _never_ write any comments.

See the [Avoid comments](#avoid-comments) chapter for more details.

## Always use constants for magic numbers

Using constants instead of magic numbers is a great practice, but not all numbers are magic. Often developer make code less readable by following this principle without thinking and converting all literal values, number and strings, to constants.

See the [Constants](#constants) chapter for more details.

## Never repeat yourself

Don’t repeat yourself (DRY) principle is probably the most overrated idea in software development. See the “Let abstractions grow” section for more details.

<!-- textlint-disable -->

## Never say never

<!-- textlint-enable -->

Never listen when someone says you should never do that or always do this, without any exceptions. Answer to most software development questions is “it depends”, and such generalizations often do more harm than good.

A few more examples:

- _Never_ put state and markup in one component (_always_ use container / presenter pattern).
