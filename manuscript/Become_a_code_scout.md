### Become a code scout

The (boy) scout rule states that you should leave the campground cleaner than you found it. For example, if someone else has left garbage, you should take it with you.

Same in programming. For example, you’re done with your task, you’re running the linter before committing your changes, and you realize that there are some warnings but not in the lines you’ve written or even have changed. If it’s not a lot of work and won’t make the diff too big, fix them.

TODO: Postpone and plan big improvements

The opposite to the boy scout rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving lint warning unfixed, leaving debug code or commented out code, general unfinishedness or untidiness of code. This creates an environment when nobody cares, because one new lint warning won’t make code with 100 warnings significantly worse, but code with zero warning will.
