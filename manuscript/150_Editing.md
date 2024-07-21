{#editing}

# Learn your code editor

<!-- description: Different techniques for editing code and customizing our environment to make our work more efficient and less tiring -->

W> This chapter isn’t finished yet

Knowing how to use the code editor efficiently makes code writing and editing faster and easier. I use Visual Studio Code, but most tips can be used for other editors too.

TODO

## Make it your own

One of the biggest features of moderns development environments and code editors is their flexibility and customizability: hundreds of color schemes (98% are dark though), fonts made specially for programming (from free to very expensive), almost any part of the interface can be hidden or adjusted, countless plugins and extensions (most are broken though), and so on and so forth…

It’s important to customize our environment so it works best for us.

For example, I [don’t do well with distractions](https://sapegin.me/blog/adhd-focus/) and overstimulation, so my environment is very minimal and low-contrast. In some editors it’s called _zen mode_ but for me it’s my normal mode. It’s even more minimal than the zen mode in Visual Studio Code. For example, I never use tabs, toolbars, or statusbars; and hide all panels by default.

Here are some things to look at:

1. Choose a nice coding font. I’ve been using different fonts over the years — Consolas, Hack, and some others I don’t remember. For the past few years I use MonoLisa.

2. Choose a comfortable theme with the right amount of color and contrast: the one that won’t make you tired after looking at it all day long. I had to make [my own color theme](https://sapegin.me/squirrelsong/) because there aren’t many good looking light themes, and most of them have very high contrast for me. Bright and contrast colors distract and tire me.

3. Customize the UI: hide anything you don’t use.

4. Learn and customize the hotkeys. Hotkeys can make your work much faster, but often it’s hard to remember them. I ended up changing many default hotkeys to something that make more sense to me, so I can remember them.

5. Add plugins for languages and frameworks you use. By default code editors come with dozens of panels and toolbars, most of which we’ll never use. It makes sense to only keep things we use regularly, and hide the rest.

T> [MonoLisa](https://www.monolisa.dev) is a paid font, but there are good free alternatives. [Coding Fonts](https://coding-fonts.netlify.app/fonts/anonymous-pro/?theme=light) is a nice page to compare many programming fonts and choose the one you like.

T> I never liked chord hotkeys (meaning you press two hotkeys one after another, for example Cmd+K Cmd+X) until I read the <!-- textlint-disable -->[Make VS Code awesome](https://makevscodeawesome.com)<!-- textlint-enable --> book by Caleb <!-- cspell:disable -->Porzio<!-- cspell:enable -->. I realized that if use them for less common operations, I can create namespaces within which I can define hotkeys that are easy to remember. They aren’t faster than single hotkeys, but that’s not the point. For example, I use Cmd+K Cmd+X to open eXtensions panel, Cmd+K Cmd+G to open Git panel, and Cmd+K Cmd+M to open Markdown preview.

TODO: screenshot

## File navigation

The _fuzzy file opener_ is one of my favorite tools. I use it all the time to open files I know exist, and, more importantly, to look for files I don’t know exist. For example, I need to save data in browser’s localStorage. I don’t know if there’s any utility function to work with it already, so I’ll look for files with `localstorage` or `storage` in their name.

![Fuzzy file opener in Visual Studio Code](images/fuzzy-file-opener.png)

I regularly use _symbol navigation_, either inside the current file, or across the workspace:

TODO: screenshot

I also use _find all references_ often to see where a certain function is used:

And, lastly, I use _go to definition_ (using a hotkey, or Cmd+click) to quickly open a function source code:

TODO: screenshot

## Code navigation

Some developers only use keyboard to move the cursor across the code. This sounds cool, but I never learned how to do it. Overall, my approach is very minimalist: I heavily rely on just a few tools, and don’t afraid to use trackpad to move the cursor around. For me it often works better than trying to remember complex hotkeys.

T> Don’t feel bad if you can’t lear a certain tool. I’ve been struggling with many tools even after using them for over a decade: Git, Flexbox, and many others.

Besides the basic navigation (home, end, jumping over one word, and so on) I regularly use these hotkeys:

- duplicate current line or selection;
- delete current line or selected lines;
- move current line or selected lines up;
- move current line or selected lines down.

I’ve tried to use more hotkeys, like navigation to previous editing position, but ended up sticking to the few I already know.

## Hotkeys

TODO: Keyboard shortcuts (hotkeys)

## Autosave

I like autosave feature in editors: you switch to another app — usually a browser — and the file is automatically save causing the hot reload to apply the changes to the page.

One thing I’ve struggled with for a long time is that autoformatting on autosave isn’t always desirable. For example, I start typing something, then google how to use a certain API, come back to the editor, and now everything is messed up by autoformatting.

I solved this by disabling autoformatting on save, and running autoformat and save on Cmd+S.

Another useful option here is disabling autosave when there’s a syntax error in the file.

## Multiple cursors

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

## Code search

TODO: search (regular expressions?)

{#spell-checking}

## Spell checking

English isn’t my native language, and having a spell checker pointing out typos in my code is immensely helpful. I’ve seen many misspelled words in comments, variable or function names, and so on, that could have been avoided with a specialized code spell checker.

![Code Spell Checker for Visual Studio Code](images/code-spell-checker.png)

<!-- cspell:disable -->

Typos in the comments and names not only make the code slightly harder to read but also make it harder to search for. If we’re searching for `departureDate` but in some places it’s misspelled `depratureDate`, we’re not going to find those places.

T> I use two spell checking extension for Visual Studio Code: [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) (based on CSpell) and [Typos spell checker](https://marketplace.visualstudio.com/items?itemName=tekumara.typos-vscode) — they compliment each other well. The Code Spell Checker is a more traditional spell checker and only checks words longer than three words, and the Typos fixes common misspellings (for example, `ot` instead of `to`). WebStorm comes with a good spell checker too.

I> We talk more about greppability (the quality that makes code findable) in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

<!-- cspell:enable -->

## Automated refactoring

TODO: refactoring

My favorite refactorings are:

- **Inline:** replaces all usages of a variable or a function with their bodies.
- **Rename:** renames a symbol and all its usages (including the ones in other files).

TODO: Why default exports are bad: rename don’t always change these names, and anyone can use custom names

I never learned to use more complex refactoring because they always need too much fixing after, and I feel that it’s easier to do the refactoring manually.

## Artificial intelligence

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

## Plugins

We already talked about some plugins in the book...

TODO

## Extras

TODO: git-friendly

TODO: Alfred workflow to open projects in Code

## Conclusion

Modern code editors have hundreds of features, and plugins add even more. It’s hard to remember them, and even harder to remember the hotkeys for the features we don’t use regularly. I often use the _command palette_ to access such features. For example, I use features like line sorting, case conversion, removing duplicate lines, and so on, probably a few times a week, but I don’t have hotkeys for them, and always access them using the command palette:

TODO: screenshot

---

Start thinking about:

- Adding hotkeys for features you use often.
- Changing default hotkeys that you struggle to remember.
