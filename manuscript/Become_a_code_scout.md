### Become a code scout

The (boy) scout rule states that we should leave the campground cleaner than we found it. For example, if someone else has left garbage, we should take it with us.

Same in programming. For example, we’re done with a task, running the linter before committing the changes, and notice that there are some warnings but not in the lines we’ve written or even changed. If it’s not a lot of work and won’t make the diff too big, we should fix these warnings, and make code cleaner for the next person who’s going to work with it.

I don’t fully agree with the idea that a particular code change (pull request) shouldn’t have any refactorings or improvements. If the fix is tiny, why not do it right away instead of postponing it for a separate pull request which likely will never happen. It does make code review slightly harder but often refactorings are easier to understand in the context of a change that caused them. Isolated refactorings often feel like refactorings for the sake of refactoring, which isn’t a good thing to do, and definitely not a good thing to spend your colleagues’ time in code reviews.

However, if the rafactoring is really big, it’s better to postpone it or extract to a separate pull request if once we see that it makes the initial pull request too large. If there’s no time to do it now, making a ticket explaining the improvement is a good idea.

The opposite to the scout rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving lint warning unfixed, leaving debug code, unused or commented out code, sloppy and cluttered code. This creates an environment when nobody cares, because one new lint warning won’t make code with 1473 warnings significantly worse, but code with zero warnings will.

It’s also worth mentioning the David Allen’s [2-minute rule](https://www.skillpacks.com/2-minute-rule/) that states "if an action will take less than two minutes, it should be done now it is defined".

Same in programming. If fixing something takes less than two minutes, we should not postpone it, and fix it right away.

One may argue that doing all these improvements may introduce bugs and it’s true. However, I believe that with good test coverage, static typing and modern tooling, the benefits are greater than the risks.

Some people [even believe](https://www.reddit.com/r/programming/comments/2tjoc8/the_boy_scout_rule_of_coding/) that we shouldn’t touch what’s working and refactoring has no business value for the product but I fiercely disagree. Our job is not only do what we’re told to do by the businessfolks but also to keep our software easy to change so we can quickly react to new business requirements. This is only possible if we care about maintanability, don’t let the tech debt pile up.
