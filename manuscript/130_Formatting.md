{#formatting}

# Autoformat your code

<!-- description: How tools can make our lives much easier by formatting code for us -->

W> This chapter isn’t finished yet

Developers used to waste days arguing where they should put spaces in the code. It doesn’t matter that much, but everyone has an opinion about it. Luckily, these arguments are mostly in the past, thanks to automatic code formatting.

I> We talk about code style in the [Code style](#code-style) chapter.

This is how I was writing code in the past: carefully crafting each line of code, making sure the code is perfectly formatted and all lines are aligned.

This is how I write code now: write everything in a single line, press Cmd+S — BOOM! — everything is perfectly formatted.

This is how we made sure the code is formatted consistently in the past: enable dozens of linter rules to check code formatting that would yell at us all the time, forcing us to tweak whitespace, move pieces of the code around, and sacrifice a goat until the Gods Of Linting are satisfied. Add to that constant debates about the best coding style between developers, and countless code review comments about code formatting.

This is how we make sure that the code is formatted consistently now: add Prettier as a pre-commit hook to silently reformat the code before any other developer gets a chance to look at it. Not action needed from a developer writing the code, the team is happy and productive.

The main difference between code formatters, like Prettier, and linters, like ESLint, is that code formatters are _reprinting_ code using their formatting rules, when linters only validate certain, and usually very basic, code formatting rules. Even with autofixing, the results of using linters to format code aren’t very consistent, and require a lot more configuration than code formatters.

I> We talk about linting in the [Lint your code](#linting) chapter.

## Formatting best practices

Let’s see how to get the most of code formatters, and how to make them the most useful for the team.

### Keep as many default options as possible

Code formatters are usually opinionated, and don’t have many options. I consider it a feature, not a bug. Fewer options, fewer debates in the team, and more consistency across teams and projects.

It’s a good idea to stick to the default formatting options as much as possible, and only change them if your team is very strong about a certain way of formatting code (and even then — give the defaults a try, you may change your mind).

For Prettier, I only change these options:

- `useTabs`: use tabs instead of spaces. I’ve been using tabs for over 20 years, and now I don’t really care anymore, and will not change this option for new projects.
- `singleQuote`: use single quotes instead of double quotes. Also, I’ve been using single quotes in JavaScript for two decades, and I can’t remember a single large project I worked on that was using double quotes. [Their rationale](https://prettier.io/docs/en/rationale#strings) is that double quotes require less escaping: `"It's a good taco"` versus `'It\'s a good taco'`. This doesn’t make sense to me because I’d never use “programmer” apostrophe in UI copy, instead I’d use `'It’s a good taco'` which does’t need escaping with any type of quotes.

The rest options are [the defaults whatever they are](https://prettier.io/docs/en/options).

### Don’t run formatter inside the linter

Don’t use Prettier as a ESLint plugin, because it’ll mark each place formatted “incorrectly” as an error in our code. This isn’t helpful and distracts from the actual linting errors that we need to take care of. The whole idea of code autoformatting is that we no longer need to care about it. There’s no need to tell us that something is wrong when a robot can fix it without our help.

![The curse of linting](images/curse-of-linting.jpeg)

## The ideal code formatting setup

The goal here is to avoid any distractions when writing code, or the need to run formatting manually.

1. Add Prettier to the project, try to keep as many options as defaults as possible.
2. Add Prettier formatting to the Git pre-commit hook using [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/lint-staged/lint-staged) to make sure that all the code in the repository is formatted.
3. Enable code formatting on save in the editor for that extra moment of satisfaction when we save the file and the machine makes it pretty.

T> I only enable autofixing and formatting on explicit saving with Cmd+S in my editor, not with autosave. Often I need to look up something in the docs or google half way into writing a line of code, and autoformat messes up incomplete code too much.

T> [Use Mrm](https://mrm.js.org/) to add Prettier and Husky/lint-staged to the project.
