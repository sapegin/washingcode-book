# Other tools

TODO

{#prettier}
## Prettier

Developers could waste days arguing where to put spaces in the code, which doesn’t matter at all, but everyone has an opinion on it. Luckily, these arguments are mostly in the past, thanks to automatic code formatting.

How I was writing code 10 years ago: carefully crafting each line of code making sure the code is perfectly formatted and aligned.

How I write code now: write everything in a single line, press Cmd+S — BOOM! — everything is perfectly formatted.

How we made sure the code is formatted consistently in the past: enable dozens of lint rules to check code formatting that would yell at us all the time, forcing us to tweak whitespace, move pieces of the code around, and sacrifice a unicorn until the Gods Of Linting are satisfied. Add to that constant debates about the best coding style between developers.

How we make sure that the code is formatted consistently now: add Prettier as a pre-commit hook to silently reformat the code. Not action needed from a developer, the team is happy and productive.

The main difference between code formatters, like Prettier, and linters, like ESLint, is that code formatters are _reprinting_ code using their formatting rules, when linters only validate that certain, and usually very basic, code formatting rules are met. Even with autofixing, the results aren’t very consistent, and require a lot more configuration than code formatters.

## The ideal code formatting setup

The goal here is to avoid any distractions when writing code, or the need to run formatting manually.

1. Add Prettier to the project, try to keep as many options as defaults as possible.
2. Add Prettier formatting to the Git pre-commit hook using [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to make sure that all the code in the repository is formatted.
3. Enable code formatting on save in the editor for that extra moment of satisfaction when we save the file and the machine makes it pretty.

_Tip:_ [Use Mrm](https://mrm.js.org/) to add Prettier and Husky/lint-staged to the project.

Don’t use Prettier as ESLint plugin, because it’ll mark each place formatted "incorrectly" as an error in our code. This isn’t helpful and distracts from the actual lint errors that we need to take care of. The whole idea of code autoformatting is that we no longer neeed to care about it. There’s no need to tell us that someting is wrong when the robot can fix it without our help.

![The curse of linting](images/curse-of-linting.jpeg)
