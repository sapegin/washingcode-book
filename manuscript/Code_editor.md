## Learn your code editor

TODO: navigation to previous editing position

TODO: refactoring

TODO: AI

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
