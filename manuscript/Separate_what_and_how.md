### Separate “what” and “how”

Declarative code describes the result and imperative explains how to achieve it.

TODO: Example

Declarative is often easier to read and there are many examples of refactoring imperative code to more declarative in this book.

I call this process _separating “what” and “how”_. The benefits are:

- improved readability and maintainability;
- we change “what” much more often than “how”;
- often “how” is generic and can be reused, or even imported from a third-party library.

For example, a form validation (see “Avoid conditions” for the code) could be split into:

- a list of validations for a particular form;
- a collection of validation functions (like `isEmail`);
- a function that validates form values using a list of validations.

TODO: The last two things are pretty generic.
