### Replacing loops with array methods

Modern languages have better ways to express iterative operations, and [JavaScript has many useful methods](http://exploringjs.com/impatient-js/ch_arrays.html#methods-iteration-and-transformation-.find-.map-.filter-etc) to transform and iterate over arrays, like `.map()` or `.find()`.

For example, let’s convert an array of strings to `kebab-case` with a `for` loop:

<!-- const _ = require('lodash') -->

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
for (let i = 0; i < names.length; i++) {
  kebabNames.push(_.kebabCase(names[i]));
}
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

And with the `.map()` method instead of a `for` loop:

<!-- const _ = require('lodash') -->

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

We can shorten it even more if our callback function accepts only one argument: the value. Take [kebabCase from Lodash](https://lodash.com/docs#kebabCase) for example:

And with the `.map()` method instead of a `for` loop:

<!-- skip-test -->

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

But nested ternaries are different beasts: they usually make code hard to read and there’s almost always a better alternative:

<!-- prettier-ignore -->
```jsx
function Products({products, isError, isLoading}) {
  return isError
    ? <p>Error loading products</p>
      : isLoading
        ? <Loading />
        : products.length > 0
          ? <ul>{products.map(
              product => <li key={product.id}>{product.name}</li>
            )}</ul>
          : <p>No products found</p>
}
```
