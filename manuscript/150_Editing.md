{#editors}

## Learn your code editor

<!-- description: Different techniques for _editing_ code and customizing our environment to make our work more efficient and less tiring -->

W> This chapter isn’t finished yet

### Make it your own

One of the biggest features of moderns development environments and code editors is their flexibility and customizability: hundreds of color schemes, fonts made specially for programming, any part of UI can be hidden or adjusted...

I [don’t do well with distractions](https://sapegin.me/blog/adhd-focus/) and overstimulation, so my environment is very minimal and with very low contrast. In some editors it’s called _zen mode_ but for me it’s my normal mode.

1. Choose a nice coding font. I’ve been using different fonts over the years – Consolas, Hack... For the past few years I use MonoLisa.

2. Choose a comfortable theme with the right amount of color and contrast: the one that won’t make you tired after looking at it all day long. I had to make my own color theme because there aren’t many good looking light themes, and most of them have very high contrast too me. Bright and contrast colors distract and tire me.

3. Customize the UI

4. Learn / customize the shortcuts

5. TODO

TODO: screenshot

### Code navigation

TODO: navigation to previous editing position

TODO: Navigation to symbol definition and usages

TODO: Symbols

### Multiple cursors

I use multiple cursors all the time when I edit code. Usually, I use them in one of three ways:

1. **Add cursor below**: when I need to do the same changes to several lines of code.
2. **Add selection to the next find match** or **Select all occurrences of find match**: when I want to change a few occurrences of a certain string, similar to **replace all** but it gives me slightly more control.
3. Manually adding building selection by alt-clicking words: similar to the previous one but with even more control on what I want to replace.

Imagine, we have this code, and we want to replace `require`s with more modern `import`s:

```js
const fs = require('fs-extra');
const glob = require('glob');
const userHome = require('user-home');
```

This is how I would do it:

1. Place the cursor at the beginning of the first line.
2. Trigger **Add cursor below** (Alt+Down) twice, so we have three cursors at the beginning of each line.
3. Press Alt+Shift+Right to select all `const`s.
4. Type `import` to replace all occurrences of `const` with `import`.
5. Press Alt+Right to skip module names, since we want to keep them as is.
6. Press Alt+Shift+Right twice and Shift+Right to select all `= require(`.
7. Type `from`.
8. Press Cmd+Right and then Backspace twice to remove the `)` at the end of each line.

![Using multiple cursors](images/multiple-cursors.png)

We’ll end up with this after reformatting the code:

```js
import fs from 'fs-extra';
import glob from 'glob';
import userHome from 'user-home';
```

This sounds like a lot, but it’s faster than changing each line manually or making a string replace with a regular expression (unless you need to do such a replacement in multiple files).

Multiple cursors also help to avoid premature abstraction, when we have a few lines of code that look the same.

TODO: Find an example

### Code search

The **fuzzy file opener** is one of my favorite tools. I use it all the time to open files I know exist, and, more importantly, to look for files I don’t know exist. For example, I need to save data in browser Local Storage. I don’t know if there’s any utility function to work with it already, so I’ll look for files with `localstorage` or `storage` in their name.

![Fuzzy file opener in Visual Studio Code](images/fuzzy-file-opener.png)

TODO: search (regexps?)

{#spell-checking}

### Spell checking

English isn’t my native language, and having a spell checker pointing out typos in my code is immensely helpful. I’ve seen many misspelled words in comments, variable or function names, and so on, that could have been avoided with a specialized code spell checker.

![Code Spell Checker for Visual Studio Code](images/code-spell-checker.png)

<!-- cspell:disable -->

Typos in the comments and names not only make the code slightly harder to read but also make it harder to search for. If we’re searching for `departureDate` but in some places it’s misspelled `depratureDate`, we’re not going to find those places.

T> I use two spell checking extension for Visual Studio Code: [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) and [Typos spell checker](https://marketplace.visualstudio.com/items?itemName=tekumara.typos-vscode) — they compliment each other well. The Code Spell Checker is a more traditional spell checker and only checks words longer than three words, and the Typos fixes common misspellings (for example, `ot` instead of `to`). WebStorm comes with a good spell checker too.

I> We talk more about greppability (the quality that makes code findable) in the [Make the code greppable](#greppability) section of the _Other techniques_ chapter.

<!-- cspell:enable -->

### Automated refactoring

TODO: refactoring

My favorite refactorings are:

- Inline: replaces all usages of a variable or a function with their bodies.
- Rename: renames a symbol and all its usages (including the ones in other files).

TODO: Why default exports are bad: rename don’t always change these names, and anyone can use custom names

I never learned to use more complex refactoring because they always need too much fixing after, and I feel that it’s easier to do the refactoring manually.

### Artificial intelligence

Artificial intelligence (AI) is a new useful tool that’s already changing software development for better and for worse. I have many feelings and opinions on these changes, though they are probably out of scope of this book.

I regularly use AI to help me write code, and here are my most common use cases:

- Bootstrapping a new project, especially with a tech stack I’m not very familiar with and can’t copypaste files from an existing project.
- Small utility functions (I used to copy them from Stack Overflow).
- Draft code when I’m stuck.
- Throw-away code, like scripts that I want to run only once.
- Coding “bureaucracy”: generating TypeScript types or some tricky syntax I never remember.
- Asking random questions on how to use a certain library or implement a certain thing, similar to Stack Overflow.

I use two tools: [GitHub Copilot](https://github.com/features/copilot) and (rarely) ChatGPT.

![GitHub Copilot inline chat](images/github-copilot-inline-chat.png)
