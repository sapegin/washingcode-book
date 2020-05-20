## Don’t surprise me

TODO: Principle of least surprise. Think what kind of comments your code reviewer might have. Improve code or add comments

Surprising behavior:

- Incorrect semantic: `.map()` with side effects
- Mutating function arguments
- Function that’s doing more than the name says (or not doing what the name says)

Surprising behavior:

<!-- const dogs = [], cats = [] -->

```js
function doMischief(props) {
  // 100 lines of code
  props.cats.push('labrador');
  // 100 lines of code
}

doMischief({ dogs, cats });
```
