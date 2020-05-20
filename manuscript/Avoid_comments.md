## Avoid comments

Comments are often used to explain poorly written code. People think that their code isn’t clear enough, so they add comments to explain it. And they are usually right: the code isn’t clear. But instead of adding comments, they should rewrite code to make it simpler and more readable.

There’s a popular technique of avoiding comment: when you want to explain a block of code, move this code to its own function instead. For example:

```js
// TODO
```

Can be rewritten as:

```js
// TODO
```

And while it make a lot of sense to extract complex calculations and conditions, used inside an already long line of code:

```php
// TODO: this example is from reafactoring course
if (($platform->toUpperCase()->indexOf("MAC") > -1) &&
     ($browser->toUpperCase()->indexOf("IE") > -1) &&
      $this->wasInitialized() && $this->resize > 0)
{
  // do something
}
// ->
$isMacOs = $platform->toUpperCase()->indexOf("MAC") > -1;
$isIE = $browser->toUpperCase()->indexOf("IE")  > -1;
$wasResized = $this->resize > 0;

if ($isMacOs && $isIE && $this->wasInitialized() && $wasResized) {
  // do something
}
// ->
// use functions instead of variables
```

I don’t think that splitting a linear algorithm, even a long one, into several functions and then calling them one after another, makes code more readable. Jumping between functions is harder than scrolling, and if you have to look into functions’ implementations to understand the code, then the abstraction wasn’t the right one.

Comments are useful to answer _why_ code is written in a certain way. If it’s fixing a bug, a ticket number will be useful. If there’s an obvious simpler alternative solution, a comment should explain why this solution doesn’t work in this case. Such comments will save you from accidental “refactoring” that makes code easier but removes some necessary functionality.

High level comments, explaining how code works, are useful too. If you’re implementing an algorithm, explained somewhere else, link to that place.

And any hack should be explained in a `HACK` or `FIXME` comment.

`TODO` comments are _okay_ too, if you add a ticket number when something will be done. Otherwise they are just dreams that will likely never come true.

But there are several kinds of comments that you should never write.

First are comments explaining _how_ code works:

```js
// This will make sure that your code runs
// in the strict mode in the browser
'use strict';
```

```js
// Fade timeout = 2 seconds
const FADE_TIMEOUT_MS = 2000;
```

If you think someone on your team may not know some of the language features you’re using, it’s better to help them learn these features than clutter the code with comments that will distract everyone else.

Next are _fake_ comments: they pretend to explain a some decision, but actually they don’t explain anything.

```js
// Design decision
// This is for biz requirements
// Non-standard background color needed for design
// Designer's choice
// Using non-standard color to match design
```

I see a lot of them in one-off design _changes?_. For example, a comment will say that there was a _design requirement_ to use a non-standard color but it won’t explain why it was required and why none of the standard color worked in that case.

```scss
.shareButton {
  color: #bada55; // Using non-standard color to match design
}
```

_Requirement_ is a very tricky and dangerous word. Often what’s treated as a requirement is just a lack of education and collaboration between developers, designers and project managers. If you don’t know why something is required, ask, and you may be surprised by the answer.

There may be no _requirement_ at all and you can use a standard color:

```scss
.shareButton {
  color: $text-color--link;
}
```

Or there may be a real reason to use a non-standard color, that you may put into a comment:

```scss
$color--facebook: #3b5998; // Facebook brand color
.shareButton {
  color: $color--facebook;
}
```

In any case it’s your responsibility to ask _why_ as many times as necessary.
