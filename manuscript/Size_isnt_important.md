## Size isn’t important

- Short functions are overrated
- Long functions and long files isn’t a problem
- In UI state or custom styles are great reasons to create new components

> Generally, any method longer than ten lines should make you start asking questions.

Often big functions and big modules have other problems, but just size is never an issue. There are many valid cases when you’d want to extract a piece of code into its own function, like code reuse state isolation, separation of data from an algorithm, separation of concerns, different levels of abstraction, reducing number of local variables, and so on.

Opposite is often true: if several functions or modules are often changed together, merge them into one function or module. For example, markup and styles of an HTML component are often changed together and keeping them in separate files is inconvenient. CSS in JS where both, styles and markup, are in the same file is a great solution for this problem. It clearly doesn’t make modules smaller.

TODO: Example of styled-components

TODO: Splitting tax: passing bunch of parameters and objects between functions.

TODO: Props drilling in React?
