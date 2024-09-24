{#editing}

# Learn your code editor

<!-- description: Different techniques for editing code and customizing our environment to make our work more efficient and less tiring -->

Knowing how to use our code editor efficiently makes code writing and editing faster and easier. Using its various integrated tools, such as Git and the terminal, also helps avoid wasting time switching between apps.

In this chapter, we mostly talk about [Visual Studio Code](https://code.visualstudio.com), as it’s my main code editor. However, most of these things can be applied to other editors and IDEs. We also briefly discuss some other tools, but mostly we talk about code editing and navigation.

W> In this chapter, I mention my custom hotkeys (see the _Hotkeys_ section), check out the [default Code key bindings](https://code.visualstudio.com/docs/getstarted/keybindings).

## Make it your own

One of the biggest benefits of modern development environments and code editors is their flexibility and customizability: hundreds of color schemes (98.7% are dark though), fonts made specially for code (from free to very expensive), almost any part of the interface can be hidden or adjusted, countless plugins and extensions (most are broken or abandoned though), and so on and so forth…

It’s important to customize our environment so it works best for us.

For example, I [struggle with distractions](https://sapegin.me/blog/adhd-focus/) and overstimulation, so I keep my environment minimal and low-contrast. In some editors, it’s called _zen mode_, but for me, it’s my normal mode. My setup is even more minimal than Visual Studio Code’s zen mode. For example, I never use tabs, toolbars, or a status bar; and hide all panels by default.

Here are some things to consider:

1. Choose a nice coding font. I’ve been using different fonts over the years: Consolas, Hack, and some others I don’t remember. For the past few years, I have used MonoLisa.

2. Choose a comfortable theme with the right amount of color and contrast, one that won’t tire your eyes after looking at it all day long. I had to make [my own color theme](https://sapegin.me/squirrelsong/) because there aren’t many good-looking light themes, and most of them have very high contrast for me. My eyes can’t stand dark themes; bright colors and high contrast distract and tire me.

3. Customize the UI: hide anything you don’t use. Code editors come with dozens of panels and toolbars by default, most of which you’ll never use. It makes sense to only keep things you use regularly and hide the rest.

4. Learn and customize the hotkeys. Hotkeys can make your work much faster, but often it’s hard to remember them. I ended up changing many default hotkeys to something that makes more sense to me, so I can remember them.

5. Add plugins for languages and frameworks you use, add more plugins for extra features.

T> [MonoLisa](https://www.monolisa.dev) is a paid font, but there are good free alternatives. [Coding Fonts](https://coding-fonts.netlify.app/fonts/anonymous-pro/?theme=light) is a nice page to compare many programming fonts and choose the one you like.

![My Visual Studio Code setup](images/vscode.png)

I> Here’s my [Visual Studio Code config](https://github.com/sapegin/dotfiles/blob/master/vscode/User/settings.json).

## File navigation

The _fuzzy file opener_ is one of my favorite tools. I use it all the time to open files I know exist, and, more importantly, to look for files I think may exist. For example, I need to save data in the browser’s `localStorage`. If I don’t know if there’s any utility function to work with it already, I’ll look for files with `localstorage` or `storage` in their name.

![Fuzzy file opener in Visual Studio Code](images/vscode-fuzzy-file-opener.png)

I regularly use _symbol navigation_, either inside the current file (`@`) or across the workspace (`#`). I also use _find all references_ a lot to see where a certain function is used, and _go to definition_ to quickly open a function’s source code.

![Symbols in Visual Studio Code](images/vscode-symbols.png)

Additionally, I use code search all the time to find a particular place in the code. For example, I search for UI copy or CSS class names to find the code that I’m looking at in the browser.

## Code navigation

Some developers only use the keyboard to move the cursor through the code. While this sounds cool, I’ve never learned how to do it. Overall, my approach is very minimalist: I heavily rely on just a few tools, and I’m not afraid to use a trackpad to move the cursor around, which works better for me than trying to remember complex hotkeys.

T> Don’t feel bad if you can’t learn a certain tool. I’ve struggled with many tools, such as Git and Flexbox, even after using them for a decade.

Besides the basic navigation (home, end, jumping over one word, and so on), I regularly use these hotkeys:

- duplicate current line or selection (Cmd+D, <!-- cspell:disable -->**d**elete<!-- cspell:enable -->);
- delete current line or selected lines (Cmd+E, **e**rase);
- move current line or selected lines up (Cmd+Alt+Up);
- move current line or selected lines down (Cmd+Alt+Down).

I tried using more hotkeys, like navigation to the previous editing position, but ended up sticking to the few I already know.

## Hotkeys

Hotkeys can speed up our work, but only if recalling a hotkey is faster than accessing a command through a menu or command palette.

I’ve always struggled with remembering hotkeys, and the default ones in Visual Studio Code are especially hard to remember and uncomfortable to use. I ended up creating my own hotkeys for most things I use regularly, and I keep adjusting the ones I still can’t remember.

I never liked chord hotkeys — where you press two keys sequentially, like Cmd+K followed by Cmd+X — until I read Caleb [<!-- cspell:disable -->Porzio’s<!-- textlint-enable --> book](https://makevscodeawesome.com). I realized that if I use them for less common operations, I can create namespaces within which I can define hotkeys that are easy to remember. They’re not faster than single hotkeys, but speed isn’t the point.

Here are some of the chord hotkeys I use:

- Cmd+K Cmd+X: open the e**x**tensions panel;
- Cmd+K Cmd+G: open the **G**it panel;
- Cmd+K Cmd+M: open <!-- cspell:disable -->**M**arkdown<!-- cspell:enable --> preview;
- Cmd+K Cmd+T: run a **t**ask;
- Cmd+K Cmd+W: re**w**rap a comment (using the Rewrap extension).

I> Here are my [keybinding for Visual Studio Code](https://github.com/sapegin/dotfiles/blob/master/vscode/User/keybindings.json)

## Autosave

I like the autosave feature in editors: you change the code, switch to another app — usually a browser — and the file is automatically saved, causing the hot reload to apply the changes to the page.

One thing I’ve struggled with for a long time is that autoformatting on autosave isn’t always desirable. For example, I start typing something, then switch to the browser to google how to use a certain API, then come back to the editor to find my code messed up by autoformatting because it doesn’t work well with incomplete code.

I solved this by disabling autoformatting on save and running autoformat and save on Cmd+S. I also disabled autosave of files with syntax errors, so the page in the browser doesn’t lose its state, such as scroll position or form data.

I> I explain this solution in more detail and with config file examples [on my blog](https://sapegin.me/blog/vscode-autosave/).

## Multiple cursors

I use multiple cursors all the time when editing code. Usually, I use them one of three ways:

1. **Add cursor below**: when I need to do the same changes to several lines of code, I add cursors to the beginning of each line.
2. **Add selection to the next find match** or **select all occurrences of find match**: when I want to change a few occurrences of a certain string, which is similar to **replace all**, but provides slightly more control.
3. Manually building selection by alt-clicking words: similar to the previous method, but with even more control over what I want to edit.

Imagine we have this code, and we want to replace `require`s with more modern `import`s:

```js
const fs = require('fs-extra');
const glob = require('glob');
const userHome = require('user-home');
```

Here’s how I’d do it:

1. Place the cursor at the beginning of the first line.
2. Trigger **add cursor below** (Alt+Down) twice, so we have three cursors at the beginning of each line.
3. Press Alt+Shift+Right to select all occurrences of `const`.
4. Type `import` to replace all occurrences of `const` with `import`.
5. Press Alt+Right to skip module names, since we want to keep them as is.
6. Press Alt+Shift+Right twice and Shift+Right to select all `= require(`.
7. Type `from`.
8. Press Cmd+Right, then Backspace twice to remove the `);` at the end of each line.

![Using multiple cursors](images/multiple-cursors.png)

We’ll end up with this after reformatting the code:

```js
import fs from 'fs-extra';
import glob from 'glob';
import userHome from 'user-home';
```

Another approach is to use **add selection to the next find match**, so instead of steps 1–3, we do:

1. Place the cursor anywhere inside the first `const`.
2. Trigger add **selection to the next find match** (F2) to select the word under the cursor (`const`).
3. Trigger **selection to the next find match** twice more to select all occurrences of `const`.

This may sound like a lot, but it’s faster than changing each line manually or using a regular expression for replacement — unless you need to make that replacement across multiple files.

Multiple cursors also help to avoid premature abstraction when we have a few lines of code that look the same. Instead of introducing an abstraction, we could use multiple cursors to edit all lines at the same time.

## Tasks

I used to run all commands (such as starting a server, linters, or tests) from a command line, but now I prefer tasks in Visual Studio Code.

Visual Studio Code can run either the project’s npm scripts or custom tasks defined in the project’s `.vscode/tasks.json` file. The latter are more flexible: for example, tasks can depend on each other (imagine an end-to-end tests task running the development server first).

![Tasks in Visual Studio Code](images/vscode-tasks.png)

Tasks usually call npm scripts with additional settings, such as whether to display a terminal panel when the task runs or show errors in the Problems panel. However, the format for defining tasks, especially problem detection patterns, is quite convoluted and confusing, and I haven’t mastered it yet.

I> Check out the official [tasks docs](https://code.visualstudio.com/docs/editor/tasks).

![Problem panel in Visual Studio Code](images/vscode-tasks-problems.png)

We can also define global tasks that work on all projects in the global `tasks.json` file. I use it to open the project folder or current file in Finder, Nimble Commander, and WezTerm.

I> Here’s my [Visual Studio Code tasks config](https://github.com/sapegin/dotfiles/blob/master/vscode/User/tasks.json)

## Terminal

I used to keep a separate terminal app running constantly, but now I mostly use the integrated terminal in Visual Studio Code.

My favorite things about it are:

- It’s one hotkey away and doesn’t distract me when I don’t need it.
- I don’t have to navigate to the project directory when I open it.
- Clicking on filenames with line numbers (such as the ones in tests or lint results) always works correctly.

I usually use the integrated terminal to work with npm, switch and create Git branches, and so on.

![Integrated terminal in Visual Studio Code](images/vscode-terminal.png)

I set up a hotkey (Cmd+T) to open the terminal panel and switch between terminal tabs (tasks, such as a development server, also appear as terminal tabs); and another hotkey (Cmd+N) to open new terminal tabs. Escape closes the panel.

I> [WezTerm](https://wezfurlong.org/wezterm/) is my favorite terminal app when I need something more than the integrated terminal.

## Source control

I always felt that Git wasn’t a very user-friendly tool and was too low-level for daily tasks. I’ve been searching for ways to make it bearable, and though I couldn’t find a single tool that solves all its issues, I found a combination of tools that makes me moderately productive.

Here’s what I use to work with Git:

- I do most of my commits using Git integration in Visual Studio Code.
- I prefer [GitHub Desktop](https://github.com/apps/desktop) when I need to commit separate lines in a file because the UI for line selection is much better and less confusing than in other tools.
- I mostly use the command line to switch and create branches because I find UI for this in Visual Studio Code awkward.
- However, I rarely use Git commands directly and either use [git-friendly](https://github.com/git-friendly/git-friendly) or [my own aliases](https://github.com/sapegin/dotfiles/blob/master/tilde/.gitconfig) and scripts.
- Occasionally I use [Lazygit](https://github.com/jesseduffield/lazygit) to quickly commit something in the command line.

What I like the most about committing from Visual Studio Code (besides its accessibility with a hotkey) is that I can set a large font size for the commit message field. Most Git tools set a tiny font, limit the size of the message field to one or two lines, and don’t let you change them. This is very uncomfortable, and I’m glad I can finally change it in the Code.

![Committing to Git in Visual Studio Code](images/vscode-spell-checker.png)

My typical Git workflow in Visual Studio Code is as follows:

1. Open Source Control panel (Cmd+K Cmd+G).
2. Type the commit message (the text field is already focused).
3. Select individual files, if necessary.
4. Commit the changes (Cmd+Enter).
5. Push the changes (Cmd+P).
6. Create a pull request using the [GitHub Pull Request](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) extension (Cmd+R).

I like [git-friendly](https://github.com/git-friendly/git-friendly) because it provides scripts to pull, push, switch branches, and manage stash that do what Git should do by default, such as proper tracking of remote branches. These commands are much less confusing than standard Git terminal commands or commands in Git GUI clients.

I prefer GUI for reviewing changes and resolving conflicts. Visual Studio Code is good for both because it shows the diff the same way we edit code, allowing us to do small last-minute tweaks in the diff view, such as fixing typos or removing debug code.

I> I wrote a couple articles on my Git workflow: [on pull requests, commits, and code reviews](https://sapegin.me/blog/rebels-guide-to-pull-requests-commits-code-reviews/), and [on getting good code reviews](https://sapegin.me/blog/faster-code-reviews/).

## Documentation

I easily forget things, and having quick access to documentation is very important for me. I use [Dash](https://kapeli.com/dash) to read most documentation, such as HTML, JavaScript, and CSS, and usually I access it via [Alfred](https://www.alfredapp.com) (using the built-in integration).

![Searching JavaScript documentation in Dash using Alfred integration](images/alfred-dash.png)

Sometimes, I also use [Dash extension](https://marketplace.visualstudio.com/items?itemName=deerawan.vscode-dash) for Visual Studio Code, which opens documentation for the symbol under the cursor in Dash with a hotkey.

I> [Velocity](https://velocity.silverlakesoftware.com) and [Zeal](https://zealdocs.org) are Windows alternatives to Dash.

{#spell-checking}

## Spell checking

English isn’t my native language, and having a spell checker point typos in my code is immensely helpful. I’ve seen many misspelled words in comments and variable or function names that could have been avoided with a specialized code spell checker.

![Code Spell Checker for Visual Studio Code](images/vscode-spell-checker.png)

Typos in comments and names not only make the code slightly harder to read but also make it harder to search for. If we’re searching for `departureDate`, but in some places it’s misspelled as <!-- cspell:disable -->`depratureDate`<!-- cspell:enable -->, we won’t find those places.

I use two extensions to check spelling in Visual Studio Code:

- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker): a more traditional spell checker that only checks words longer than three letters (based on CSpell).
- [Typos spell checker](https://marketplace.visualstudio.com/items?itemName=tekumara.typos-vscode): fixes common misspellings (for example, <!-- cspell:disable -->`ot`<!-- cspell:enable --> instead of `to`).

These two extensions complement each other, finding all kinds of typos and misspellings.

T> WebStorm comes with a good spell checker out of the box, so you don’t need to install any extensions.

I> We talk more about greppability (the quality that makes code findable) in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

## Automated refactoring

I don’t use many automated refactorings, but the ones I do use, I use very often:

- **Inline:** replaces all usages of a variable or a function with their bodies.
- **Rename:** renames a symbol and all its usages (including the ones in other files).

I never learned to use more complex refactorings because they always require too much cleanup after applying them, and I find it easier to do these refactorings manually. TypeScript makes many refactorings more reliable. It’s also a good idea to commit the code before running a big refactoring to review the changes it makes.

## Artificial intelligence

Artificial intelligence (AI) is a new, useful tool that’s already changing software development for better and for worse. I have many feelings and opinions on these changes, though they are likely outside the scope of this book.

I regularly use AI to help me write code. Here are my most common use cases:

- Bootstrapping a new project, especially with a tech stack I’m not very familiar with and can’t copypaste files from an existing project.
- Writing small utility functions (I used to copy them from Stack Overflow).
- Drafting code when I’m stuck.
- Writing throw-away code, like scripts that I want to run only once.
- Dealing with coding “bureaucracy”: generating TypeScript types or some tricky syntax I never remember.
- Asking random questions on how to use a certain library or implement a certain thing, similar to Stack Overflow.

I use two tools:

- [GitHub Copilot](https://github.com/features/copilot) in inline chat mode: good for small stuff, like adding a new function, adding types to an existing one, or refactoring.
- [ChatGPT](https://chatgpt.com): good for more general questions.

![GitHub Copilot inline chat](images/github-copilot-inline-chat.png)

I’ve also tried Copilot’s autocomplete and found it infuriatingly annoying and distracting.

AI is very good at generating an initial solution, especially when I feel stuck and don’t know how to approach a problem. However, you really need to understand what’s going on to detect when the AI is hallucinating and giving you the wrong solution.

Think of it as a slightly smarter Stack Overflow or an assistant who can google something for you or write some code but doesn’t understand whether it’s a good solution or not, or whether it’ll work at all.

## Plugins

I don’t use many plugins (or extensions, as Visual Studio Code calls them), and we already talked about some in this book. I’ve made a several of my own extensions that I use daily:

- [Just Blame](https://marketplace.visualstudio.com/items?itemName=sapegin.just-blame): Git Blame annotations, inspired by JetBrains editors.
- [Emoji Console Log](https://marketplace.visualstudio.com/items?itemName=sapegin.emoji-console-log): insert `console.log()` statements with a random emoji.
- [Mini Markdown](https://marketplace.visualstudio.com/items?itemName=sapegin.mini-markdown): minimalist kit for comfortable Markdown writing.
- [New File Now](https://marketplace.visualstudio.com/items?itemName=sapegin.new-file-now): create new files from the command palette.
- [Notebox](https://marketplace.visualstudio.com/items?itemName=sapegin.notebox): take quick notes in the bottom panel.
- [Todo Tomorrow](https://marketplace.visualstudio.com/items?itemName=sapegin.todo-tomorrow): highlight `TODO`, `HACK`, `FIXME`, and other comments.

Here are some other extensions I can recommend that I didn’t mention before:

- [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight): highlight colors in code.
- [File Utils](https://marketplace.visualstudio.com/items?itemName=sleistner.vscode-fileutils): commands to create, duplicate, move, rename, and delete files and directories.
- [Template String Converter](https://marketplace.visualstudio.com/items?itemName=meganrogge.template-string-converter): convert a string to a template literal when you type `${`.

## Extras

Here are some other tools I use regularly:

- [Bruno](https://www.usebruno.com): API client to test REST APIs.
- [ColorSnapper 2](https://colorsnapper.com): color picker.
- [Contrast](https://usecontrast.com): check color contrast for accessibility.
- [DevToys](https://devtoys.app/): a collection of small tools for developers, such as a regular expression tester, date format converter, base64 decoder, lorem ipsum generator, and so on.
- [Icon Slate](https://www.kodlian.com/apps/icon-slate): `favicon.ico` generator.
- [Numi](https://numi.app): calculator.
- [Optimage](https://optimage.app): image optimizer.
- [Polypane](https://polypane.app): browser for testing responsive design.

I> You may also find [my dotfiles](https://github.com/sapegin/dotfiles) useful: I keep there config files for various tools, shell and Git aliases, scripts, and so on.

---

Modern code editors have hundreds of features, and plugins add even more. It’s hard to remember them, and even harder to remember the hotkeys for features we don’t use regularly. I often use the _command palette_ to access such features. For example, I use features like line sorting, case conversion, and removing duplicate lines a few times a week, but I don’t have hotkeys for them and always access them via the command palette.

![Command palette in Visual Studio Code](images/vscode-command-palette.png)

Start thinking about:

- Adding hotkeys for features you use often.
- Changing default hotkeys that you struggle to remember.
- Learning integrated tooling in your editor, such as Git or terminal, to avoid switching between applications.
- Using multiple cursors to edit code instead of introducing an abstraction.
- Using AI to generate draft code or help you come up with an initial solution.
