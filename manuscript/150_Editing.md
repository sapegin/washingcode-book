{#editing}

# Learn your code editor

<!-- description: Different techniques for editing code and customizing our environment to make our work more efficient and less tiring -->

W> This chapter isn’t finished yet

Knowing how to use our code editor efficiently makes code writing and editing faster and easier, and knowing how to use it for various integrated tools, such as Git and terminal, avoids wasting time switching to other apps.

In this chapter, we mostly talk about [Visual Studio Code](https://code.visualstudio.com), since it’s my main code editor. However, most of the things can be applied to other editors and IDEs. We also briefly discuss some other tools, but mostly we talk about code editing and navigation.

## Make it your own

One of the biggest features of moderns development environments and code editors is their flexibility and customizability: hundreds of color schemes (98% are dark though), fonts made specially for programming (from free to very expensive), almost any part of the interface can be hidden or adjusted, countless plugins and extensions (most are broken though), and so on and so forth…

It’s important to customize our environment so it works best for us.

For example, I [don’t do well with distractions](https://sapegin.me/blog/adhd-focus/) and overstimulation, so my environment is very minimal and low-contrast. In some editors it’s called _zen mode_ but for me it’s my normal mode. It’s even more minimal than the zen mode in Visual Studio Code. For example, I never use tabs, toolbars, or statusbars; and hide all panels by default.

Here are some things to look at:

1. Choose a nice coding font. I’ve been using different fonts over the years — Consolas, Hack, and some others I don’t remember. For the past few years I use MonoLisa.

2. Choose a comfortable theme with the right amount of color and contrast: the one that won’t make you tired after looking at it all day long. I had to make [my own color theme](https://sapegin.me/squirrelsong/) because there aren’t many good looking light themes, and most of them have very high contrast for me. Bright and contrast colors distract and tire me.

3. Customize the UI: hide anything you don’t use. By default code editors come with dozens of panels and toolbars, most of which we’ll never use. It makes sense to only keep things we use regularly, and hide the rest.

4. Learn and customize the hotkeys. Hotkeys can make your work much faster, but often it’s hard to remember them. I ended up changing many default hotkeys to something that make more sense to me, so I can remember them.

5. Add plugins for languages and frameworks you use, add more plugins for extra features.

T> [MonoLisa](https://www.monolisa.dev) is a paid font, but there are good free alternatives. [Coding Fonts](https://coding-fonts.netlify.app/fonts/anonymous-pro/?theme=light) is a nice page to compare many programming fonts and choose the one you like.

![My Visual Studio Code setup](images/vscode.png)

W> In this chapter I mention my custom hotkeys (see the _Hotkeys_ section), check out the [default Code key bindings](https://code.visualstudio.com/docs/getstarted/keybindings).

I> Here’s my [Visual Studio Code config](https://github.com/sapegin/dotfiles/blob/master/vscode/User/settings.json)

## File navigation

The _fuzzy file opener_ is one of my favorite tools. I use it all the time to open files I know exist, and, more importantly, to look for files I don’t know exist. For example, I need to save data in browser’s localStorage. I don’t know if there’s any utility function to work with it already, so I’ll look for files with `localstorage` or `storage` in their name.

![Fuzzy file opener in Visual Studio Code](images/vscode-fuzzy-file-opener.png)

I regularly use _symbol navigation_, either inside the current file (`@`), or across the workspace (`#`). I also use _find all references_ often to see where a certain function is used, and _go to definition_ (using a hotkey, or Cmd+click) to quickly open a function’s source code.

![Symbols in Visual Studio Code](images/vscode-symbols.png)

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

Hotkeys can make our work faster, but only when remembering a hotkey is faster than accessing a command using a menu or a command palette.

I always struggled with remembering hotkeys, and the default ones in Visual Studio Code are especially difficult to remember and uncomfortable to use. I ended up making my own hotkeys for most of the things I use regularly, and I keep changing the ones I still can’t remember.

I never liked chord hotkeys (meaning you press two hotkeys one after another, for example Cmd+K Cmd+X) until I read the <!-- textlint-disable -->[Make VS Code awesome](https://makevscodeawesome.com)<!-- textlint-enable --> book by Caleb <!-- cspell:disable -->Porzio<!-- cspell:enable -->. I realized that if use them for less common operations, I can create namespaces within which I can define hotkeys that are easy to remember. They aren’t faster than single hotkeys, but that’s not the point.

Here are some of the chord hotkeys I use:

- Cmd+K Cmd+X: open e**x**tensions panel;
- Cmd+K Cmd+G: open **G**it panel;
- Cmd+K Cmd+M: open <!-- cspell:disable -->**M**arkdown<!-- cspell:enable --> preview;
- Cmd+K Cmd+T: run a **t**ask;
- Cmd+K Cmd+W: re**w**rap a comment (using the Rewrap extension).

I> Here are my [keybinding for Visual Studio Code](https://github.com/sapegin/dotfiles/blob/master/vscode/User/keybindings.json)

## Autosave

I like the autosave feature in editors: you change the code, switch to another app — usually a browser — and the file is automatically saved causing the hot reload to apply the changes to the page.

One thing I’ve struggled with for a long time is that autoformatting on autosave isn’t always desirable. For example, I start typing something, then google how to use a certain API, come back to the editor, and now everything is messed up by autoformatting, because it doesn’t work well with incomplete code.

I solved this by disabling autoformatting on save, and running autoformat and save on Cmd+S. I also disabled autosave when there’s a syntax error in the file, so the page in the browser doesn’t loose its state, such as scroll position or form data.

I> I explain this solution in more detail and with config file examples [on my blog](https://sapegin.me/blog/vscode-autosave/).

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

Multiple cursors also help to avoid premature abstraction, when we have a few lines of code that look the same. Instead of introducing an abstraction, we could use multiple cursors to edit all lines at the same time.

## Code search

TODO: search (regular expressions?)

I use code search all the time to find a particular place in the code. For example, I search for UI copy or CSS class names to find the code that I’m looking at in the browser.

## Tasks

I used to run all commands (such as starting a server, linters, tests) from a command line, but now I use Tasks in Visual Studio Code.

Code can run either project’s npm scripts, or custom tasks defined in the project’s `.vscode/tasks.json` file. The latter are more flexible: for example, tasks can depend on each other (for example, end-to-end tests tasks runs development server first).

![Tasks in Visual Studio Code](images/vscode-tasks.png)

Tasks usually call npm scripts with some extra settings, such as whether to show a terminal panel when the task runs, or reveal errors on the Problems panel. However, the format of defining tasks, especially problem detection patterns, is quite convoluted and confusing, and I haven’t mastered them yet.

I> Check out the official [docs on tasks](https://code.visualstudio.com/docs/editor/tasks).

![Problem panel in Visual Studio Code](images/vscode-tasks-problems.png)

We can also define global tasks that works on all projects in the global `tasks.json` file. I use it to open the project folder or the current file in Finder, Nimble Commander, and WezTerm.

I> Here’s my [Visual Studio Code tasks config](https://github.com/sapegin/dotfiles/blob/master/vscode/User/tasks.json)

## Terminal

I used to keep a separate terminal app running all the time, but now I mostly use the integrated terminal in Visual Studio Code.

My favorite things about are:

- It’s one hotkey away (mine is Cmd+T) and doesn’t distract me when I don’t need it.
- I don’t have to navigate to the project directory when I open it.
- Links to code with errors always work correctly.

I usually use integrated terminal to work with npm, switch and create Git branches, and so on.

![Integrated terminal in Visual Studio Code](images/vscode-terminal.png)

I setup a hotkey (Cmd+T) to open the terminal panel and switch between terminal tabs (tasks, such as running development server, also appear as terminal tabs, so there might be more than one); and another hotkey (Cmd+N) to open new terminal tabs. Escape closes the panel.

I> [WezTerm](https://wezfurlong.org/wezterm/) is my favorite terminal app when I need something more than the integrated terminal.

## Source control

I always felt that Git isn’t a user friendly tool, and too low-level for daily tasks. I’ve been searching for ways to make it bearable, and, though, I couldn’t find a single tool that solves all its issues, I found a combination of tools that make me moderately productive.

Here’s what I use to work with Git:

- I do most of my commits using Git integration in Visual Studio Code.
- I prefer [GitHub Desktop](https://github.com/apps/desktop) when I need to commit separate lines in a file because the UI for line selection is better.
- I mostly use command line to switch and create branches because I find UI for this in Visual Studio Code awkward.
- However, I rarely use Git commands directly and either use [git-friendly](https://github.com/git-friendly/git-friendly) or [my own aliases](https://github.com/sapegin/dotfiles/blob/master/tilde/.gitconfig) and scripts.
- Occasionally I use [Lazygit](https://github.com/jesseduffield/lazygit) to quickly commit something in command line.

What I like the most about committing from Visual Studio Code (besides that it’s accessible with one hotkey) is that I can set large font for the commit message field. Most Git tools set tiny font and limit the size of the message field to one or two lines, and don’t let you change this. This is very uncomfortable, and I’m glad I can finally change it in the Code.

![Committing to Git in Visual Studio Code](images/vscode-spell-checker.png)

My typical Git workflow would be as follows:

1. Open Source Control panel (Cmd+K Cmd+G).
2. Type the commit message (the text field is already focused).
3. Select the individual files, if necessary.
4. Commit the changes (Cmd+Enter).
5. Push the changes (Cmd+P).
6. Create a pull request (Cmd+R, using the [GitHub Pull Request](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) extension).

I like [git-friendly](https://github.com/git-friendly/git-friendly) because it provides scripts to pull, push, switch branches and manage stash that do what Git should do by default, such as proper tracking of remote branches. They are much less confusing than the standard Git terminal commands, or commands in Git GUI clients.

I prefer GUI for reviewing changes and resolving conflicts. Visual Studio Code is good for both because it shows the diff the same way we edit code, and we can change the code in the diff view to do small last minute tweaks, such as fixing typos or removing debug code.

I> I wrote several articles on my Git workflow: [on pull requests, commits, and code reviews](https://sapegin.me/blog/rebels-guide-to-pull-requests-commits-code-reviews/), [on getting good code reviews](https://sapegin.me/blog/faster-code-reviews/).

## Documentation

I easily forget things, and having a quick access to documentation is very important for me. I use [Dash](https://kapeli.com/dash) to read most of the documentation, and usually I access via [Alfred](https://www.alfredapp.com) (using the built-in integration).

![Searching JavaScript documentation in Dash using Alfred integration](images/alfred-dash.png)

Sometimes, I also use [Dash extension](https://marketplace.visualstudio.com/items?itemName=deerawan.vscode-dash) for Visual Studio Code, that open documentation for the symbol under the cursor in Dash by pressing a hotkey.

I> [Velocity](https://velocity.silverlakesoftware.com) and [Zeal](https://zealdocs.org) are Windows alternatives to Dash.

{#spell-checking}

## Spell checking

English isn’t my native language, and having a spell checker pointing out typos in my code is immensely helpful. I’ve seen many misspelled words in comments, variable or function names, and so on, that could have been avoided with a specialized code spell checker.

![Code Spell Checker for Visual Studio Code](images/vscode-spell-checker.png)

<!-- cspell:disable -->

Typos in the comments and names not only make the code slightly harder to read but also make it harder to search for. If we’re searching for `departureDate` but in some places it’s misspelled `depratureDate`, we’re not going to find those places.

T> I use two spell checking extension for Visual Studio Code: [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) (based on CSpell) and [Typos spell checker](https://marketplace.visualstudio.com/items?itemName=tekumara.typos-vscode) — they compliment each other well. The Code Spell Checker is a more traditional spell checker and only checks words longer than three words, and the Typos fixes common misspellings (for example, `ot` instead of `to`). WebStorm comes with a good spell checker too.

I> We talk more about greppability (the quality that makes code findable) in the [Write greppable code](#greppability) section of the _Other techniques_ chapter.

<!-- cspell:enable -->

## Automated refactoring

I don’t use so many automated refactorings because but the ones I use, I use very often:

- **Inline:** replaces all usages of a variable or a function with their bodies.
- **Rename:** renames a symbol and all its usages (including the ones in other files).

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

I don’t use many plugins (or extensions, how Visual Studio Code calls them), and we already talked about some in the book. I’ve written a bunch of my own extensions that I use every day:

- [Just Blame](https://marketplace.visualstudio.com/items?itemName=sapegin.just-blame): Git Blame annotations, inspired by JetBrains editors.
- [Emoji Console Log](https://marketplace.visualstudio.com/items?itemName=sapegin.emoji-console-log): insert `console.log()` statements with a random emoji.
- [Mini Markdown](https://marketplace.visualstudio.com/items?itemName=sapegin.mini-markdown): minimalist kit for comfortable Markdown writing.
- [New File Now](https://marketplace.visualstudio.com/items?itemName=sapegin.new-file-now): create new files from the command palette.
- [Notebox](https://marketplace.visualstudio.com/items?itemName=sapegin.notebox): take quick notes in the bottom panel.
- [Todo Tomorrow](https://marketplace.visualstudio.com/items?itemName=sapegin.todo-tomorrow): highlight `TODO`, `HACK`, `FIXME`, and other comments.

And here are some other extensions I can recommend that weren’t mentioned before:

- [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight): highlight colors in code.
- [File Utils](https://marketplace.visualstudio.com/items?itemName=sleistner.vscode-fileutils): commands to create, duplicate, move, rename, delete files and directories.
- [Template String Converter](https://marketplace.visualstudio.com/items?itemName=meganrogge.template-string-converter): convert a string to a template literal when `${` is typed.

## Extras

Some other tools I use regularly:

- [Bruno](https://www.usebruno.com): API client to test REST APIs.
- [ColorSnapper 2](https://colorsnapper.com): color picker.
- [Contrast](https://usecontrast.com): check color contrast for accessibility.
- [DevToys](https://devtoys.app/): a collection of small tools for developers, such as regular expression tester, date format converter, base64 decoder, lorem ipsum generator, and so on.
- [Icon Slate](https://www.kodlian.com/apps/icon-slate): `favicon.ico` generator.
- [Numi](https://numi.app): calculator.
- [Optimage](https://optimage.app): image optimizer.
- [Polypane](https://polypane.app): browser for testing responsive design.

---

Modern code editors have hundreds of features, and plugins add even more. It’s hard to remember them, and even harder to remember the hotkeys for the features we don’t use regularly. I often use the _command palette_ to access such features. For example, I use features like line sorting, case conversion, removing duplicate lines, and so on, probably a few times a week, but I don’t have hotkeys for them, and always access them using the command palette:

![Command palette in Visual Studio Code](images/vscode-command-palette.png)

Start thinking about:

- Adding hotkeys for features you use often.
- Changing default hotkeys that you struggle to remember.
