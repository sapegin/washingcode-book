# Other techniques and issues

{#impossible-states}

## Make impossible states impossible

In UI programming, or _especially_ in UI programming we often use boolean flags to represent the current state of the UI or its parts: is data loading? is submit button disabled? has action failed?

Often we end up with multiple booleans: one for each condition. Consider this typical data fetching handling in a React component:

```jsx
function Tweets() {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [tweets, setTweets] = useState([]);

  const handleLoadTweets = () => {
    setLoading(true);
    getTweets()
      .then(tweets => {
        setTweets(tweets);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setTweets([]);
        setLoading(false);
        setError(true);
      });
  };

  if (isLoading) {
    return 'Loading…';
  }

  if (isError) {
    return 'Something went wrong!';
  }

  if (tweets.length === 0) {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  return (
    <ul>
      {tweets.map(({ id, username, html }) => (
        <li key={id}>
          {html} by {username}
        </li>
      ))}
    </ul>
  );
}
```

We have two booleans here: _is loading_ and _has errors_. If we look closer how the code uses them, we’ll notice that only one boolean is `true` at any time in a component’s lifecycle. It’s hard to see now and it’s easy to make a mistake and correctly handle all possible state changes, so your component may end up in an _impossible state_, like `isLoading && isError`, and the only way to fix that would be reloading the page. This is exactly why switching off and on electronic devices often fixes weird issues.

We can replace several _exclusive_ boolean flags, meaning only one is `true` at a time, with a single enum variable:

```jsx
const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

function Tweets() {
  const [status, setStatus] = useState(STATUSES.IDLE);
  const [tweets, setTweets] = useState([]);

  const handleLoadTweets = () => {
    setStatus(STATUSES.LOADING);
    getTweets()
      .then(tweets => {
        setTweets(tweets);
        setStatus(STATUSES.SUCCESS);
      })
      .catch(() => {
        setTweets([]);
        setStatus(STATUSES.ERROR);
      });
  };

  if (status === STATUSES.LOADING) {
    return 'Loading…';
  }

  if (status === STATUSES.ERROR) {
    return 'Something went wrong!';
  }

  if (status === STATUSES.IDLE) {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  if (tweets.length === 0) {
    return 'No tweets found';
  }

  return (
    <ul>
      {tweets.map(({ id, username, html }) => (
        <li key={id}>
          {html} by {username}
        </li>
      ))}
    </ul>
  );
}
```

The code is now much easier to understand: we know that the component can be in a single state at any time. We’ve also fixed a bug in the initial implementation: the result with no tweets was treated as no result and the component was showing the “Load tweets” button again.

This is a very simple [finite-state machine](https://gedd.ski/post/state-machines-in-react/). State machines are useful to make logic of your code clear and prevent bugs.

Proper state machines have events that handle transitions between states, guards that define which transitions are allowed and side effects.

TODO

TODO: types

TODO: <Button primary secondary>

## Don’t try to predict the future

Requirements are constantly changing, the business is constantly trying to make more money. Sometimes by improving user experience and making the app better, sometimes by exploiting _human psychology?_ and making app worse. In both cases we need to change the code all the time. People have invented agile software development to deal with the changing requirements: it’s better to develop software in small iterations than to spend months on writing detailed specs that became obsolete by the time we start implementing them.

Somehow, developers often try to think too far in the future: “_they_ will want to add pagination to the list of pizza toppings on our pizzeria site, let’s add support now to save time later.” But then _they_ want infinite scrolling or stop selling pizzas at all, and we end up removing most of our pagination code.

It’s called Premature abstraction, [premature generalization](https://www.codewithjason.com/premature-generalization/), or [speculative generality](https://refactoring.guru/smells/speculative-generality). It feels like we’re saving time for future selves by making our code more generic, but this very code is what often prevents us from implementing real future requirements easily in the future. We end up writing and maintaining code that will never be used or code that we’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. It will be easier to review and test now, and to adapt to new requirements in the future.

T> This approach is often referred to as [Yagni](https://martinfowler.com/bliki/Yagni.html) (You aren’t gonna need it) or [KISS](https://en.wikipedia.org/wiki/KISS_principle) (Keep it simple, stupid!).

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make UI easy to change and move around.

## Become a code scout

The _campsite rule_ (previously known as _boy scout rule_) states that we should leave the campground cleaner than we found it. For example, if someone else has left garbage, we should take it with us.

Same in programming. For example, we’re done with a task, running the linter before committing the changes, and notice that there are some warnings but not in the lines we’ve written or even changed. If it’s not a lot of work and won’t make the diff too big, we should fix these warnings, and make code cleaner for the next person who’s going to work with it.

I don’t fully agree with the idea that a particular code change (pull request) shouldn’t have any refactorings or improvements. If the fix is tiny, why not do it right away instead of postponing it for a separate pull request which likely will never happen. It does make code review slightly harder but often refactorings are easier to understand in the context of a change that caused them. Isolated refactorings often feel like refactorings for the sake of refactoring, which isn’t a good thing to do, and definitely not a good thing to spend our colleagues’ time in code reviews.

Often there’s no easy way to split things into several pull request, and often doing refactoring is actually easier than trying to hack a task into existing code. This also avoid problems with management who may see refactoring as a waste of time. For me it’s an inevitable part of work on features.

However, if the refactoring is really big, it’s better to postpone it or extract to a separate pull request if once we see that it makes the initial pull request too large (which I often do). If there’s no time to do it now, making a ticket explaining the improvement is a good idea.

Try to avoid rewriting everything at once, and look for signs: too many bugs in some part of code, growing code spagettiness because of many changes in the same place. These are the places worth improving.

Having a good test suit makes any refactoring safer, especially when tests aren’t testing low-level implementation details but integration of several higher-level modules.

The opposite to the campsite rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving lint warning unfixed, leaving debug code, unused or commented out code, sloppy and cluttered code. This creates an environment when nobody cares, because one new lint warning won’t make code with 1473 warnings significantly worse. It feels different when we introduce a new lint warning to a project that has none.

It’s also worth mentioning the David Allen’s [2-minute rule](https://www.skillpacks.com/2-minute-rule/) that states "if an action will take less than two minutes, it should be done now it is defined".

Same in programming. If fixing something takes less than two minutes, we should not postpone it, and fix it right away. And if it only takes two minutes to fix, it probably won’t make the pull request diff much larger.

One may argue that doing all these improvements may introduce bugs and it’s true. However, with good test coverage, static typing, and modern tooling, the benefits are greater than the risks.

I often do small improvements, like renaming variables, moving things around or adding comments, when I read the code. If something is confusing for me, I try to make it less confusing for my colleagues or future me.

Here’s a recent example:

<!--
const Platform = { OS: 'PizzaOS' }, copyToClipBoard = () => {}
const useOrderDetails = () => { return { orderId: 'tacos' }}
const MenuListItem = ({concatenateText}) => concatenateText
const OrderIdIcon = () => null, CopyIcon = () => null
-->

```tsx
function OrderIdSection() {
  const { orderId } = useOrderDetails();

  const onOrderIdCopyPressed = () => {
    copyToClipBoard(orderId);
  };

  return Platform.OS === 'web' ? (
    <MenuListItem
      leftContent={<OrderIdIcon />}
      label="Order ID:"
      concatenateText={orderId}
      rightContent={<></>}
    />
  ) : (
    <MenuListItem
      leftContent={<OrderIdIcon />}
      label="Order ID:"
      concatenateText={orderId}
      rightContent={<CopyIcon size="small" />}
      onPress={onOrderIdCopyPressed}
    />
  );
}
```

<!--
const {container: c1} = RTL.render(<OrderIdSection />);
expect(c1.textContent).toEqual('tacos')
-->

Here, it took me a bit of time to notice that the only difference between two branches is the `rightContent` and `onPress` props, which isn’t obvious because shared props are repeated, so I had to compare each line to be sure that they are exactly the same.

We can make it 100% clear by changing the code a bit:

<!--
const Platform = { OS: 'PizzaOS' }, copyToClipBoard = () => {}
const useOrderDetails = () => { return { orderId: 'tacos' }}
const MenuListItem = ({concatenateText}) => concatenateText
const OrderIdIcon = () => null, CopyIcon = () => null
-->

```tsx
function OrderIdSection() {
  const { orderId } = useOrderDetails();

  const onPress = () => {
    copyToClipBoard(orderId);
  };

  const extraProps =
    Platform.OS === 'web'
      ? {
          rightContent: <></>
        }
      : {
          rightContent: <CopyIcon size="small" />,
          onPress
        };

  return (
    <MenuListItem
      leftContent={<OrderIdIcon />}
      label="Order ID:"
      concatenateText={orderId}
      {...extraProps}
    />
  );
}
```

<!--
const {container: c1} = RTL.render(<OrderIdSection />);
expect(c1.textContent).toEqual('tacos')
-->

Now, there’s no question which props are different, and which are the same.

I’m a big fan of parallel code, and, even though the original code was already parallel, thanks to two branches of a ternary operator, now it’s easy to see the difference between branches that was buried in duplicate code before.

(We talk more about parallel code in [Don’t make me think](#thinking) chapter.)

Some people [even believe](https://www.reddit.com/r/programming/comments/2tjoc8/the_boy_scout_rule_of_coding/) that we shouldn’t touch what’s working and refactoring has no business value for the product but I fiercely disagree. Our job is not only do what we’re told to do by the businessfolks but also to keep our software easy to change so we can quickly react to new business requirements. This is only possible if we care about maintainability, don’t let the tech debt pile up.

{#greppability}

## Make the code greppable

TODO: don’t concatenate identifiers

TODO: Find the article about greppable code

http://jamie-wong.com/2013/07/12/grep-test/

TODO: This might be less important in TypeScript but not really

TODO: Why default exports are bad: decreased greppability

TODO: unique module names

## Avoid not invented here syndrome

Not invented here syndrome (NIH) represents fear or a ban of using third-party solutions. It could come from an internal developer’s need to prove themselves to the world, or from an employer, usually a huge one, that hired so many developers that there’s not enough actually useful work for everyone.

Like any extreme, discarding any third-party libraries in our work could be unhealthy. Many problems are generic enough and don’t need to be rewritten by every developer again and again. For many problems, there are popular open source libraries, that are well tested and documented.

In this chapter, I’ll focus on utility functions rather than on big frameworks, because I see developers reinventing utility functions far more often than big frameworks.

### What’s wrong with in-house solutions

The worst case is inlining utility functions like so:

<!--
const object = { o: 0 }
let result = false
-->

```js
if (object && Object.keys(object).length > 0) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This code is checking that the object isn’t empty, meaning it has at least one property. It’s hard to see the code intention immediately and it’s hard to remember to do the existence check to avoid runtime exceptions when the variable is `undefined`.

Having a function with a meaningful name that encapsulates all the required checks (including the ones we’ll come up with in the future) makes the intention of the code more clear:

<!--
const object = { o: 0 }
let result = false
-->

```js
if (isEmpty(object) === false) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This is already much better. Now, the question is whether we write this function ourselves or we use one that somebody has written already.

It might be tempting to quickly write our own function or copypaste the code from Stack Overflow — what’s here to write anyway? — but we should first consider potential problems of maintaining our own solution:

- Often poor tests and documentation, or no documentation at all.
- Many bugs aren’t fixed because of a low number of users.
- No Google and Stack Overflow to help us when something isn’t working.
- Maintenance may take a lot of time.
- New developers, our company hires, need to learn its in-house artisanal libraries, which is often hard because of poor documentation and discoverability.

### Why third-party libraries might be better

When using a good popular library:

- We have access to documentation, updates, and bugfixes.
- New developers, joining the company, may already have experience with the library.
- Fixing an obscure error message might be one Google search away.

### What to keep in mind when using third-party libraries

However, there are things we need to keep in mind when using third-party libraries:

- It’s hard to choose a good library, there are too many, and often all are far from great.
- Open source libraries die every day for many reasons, for example, maintainers’ burnout.
- It may significantly increase the bundle size. Use [Bundlephobia](https://bundlephobia.com/) to check the size of any npm package.
- Interoperability between different libraries: some libraries may require particular versions of some other libraries, or have incompatibilities that are hard to track and fix.
- Security risks: it’s not uncommon that popular npm packages get compromised, and we may end up including some malicious code that will break our app in production or even destroy some data.

Another problem is when the library isn’t doing exactly what we want. In this case, we could:

- Submit a pull request to the library, which may take a lot of time to be reviewed, approved, merged, and released; or it may never be merged.
- Fork the library or copypaste the code to our own codebase, and do the changes there; so we’re essentially converting a third-party library into an in-house one, with all the problems of the artisanal libraries mentioned above.
- Switch to another library that does what we want better, which may take a lot of time.

### My approach to using third-party libraries

I don’t have any strict rules on using third-party libraries versus in-house ones, and balance is important here: both have their place in our work. For me, the choice depends on the complexity of the function I need, the type of the project (personal or not), my experience with a particular library that may do what I need, and so on.

I use [Lodash](https://lodash.com/) on most of my web apps: it’s a hugely popular utility library for JavaScript that has lots of useful functions, and many developers have experience with it, so they’ll spend less time reading and understanding the code that uses these functions.

I tend to use microlibraries on my personal projects but it’s more of a taste choice than a rational one, and my personal projects are pretty small and simple.

Microlibrary is a tiny, often a one-liner, library that does one small task, and nothing else. The good thing about microlibraries — they don’t increase the bundle size much, the bad thing about them — we need to choose, install and update each library separately. Also, different libraries may have very different APIs and the documentation is less accessible (because we need to look for each library separately).

I try to choose microlibraries from a few developers I trust: mainly [Luke Edwards](https://www.npmjs.com/~lukeed) and [Sindre Sorhus](https://www.npmjs.com/~sindresorhus).

Another consideration is how difficult it is to introduce a new dependency on the project. For a small personal project, adding a new dependency is only `npm install something` but a large project may require many steps like presenting a proposal to the team and security approval. The latter makes adding new dependencies less likely, which might be frustrating but has some benefits too. It’s harder to keep track of all dependencies on a large project, to make sure there are no vulnerabilities and no multiple dependencies that do the same thing but are added by different developers.

Probably the best approach to using third-party libraries should be this: the bigger the project and the more developers work on it, the more stable should be its dependencies, with a focus on popular and established libraries rather than on microlibraries.

## Avoid cargo cult programming

[Cargo cult programming](https://en.wikipedia.org/wiki/Cargo_cult_programming) is when developers use some technique because they’ve seen it works somewhere else, or they’ve been told it’s the right way of doing things.

Some examples of cargo cult programming:

- A developer copies a decade-old answer from Stack Overflow with fallbacks for old browsers which they don’t need to support anymore.
- A team applies old “best practices” even if the initial problem they were solving is no longer relevant.
- A developer applies a team “standard” to a case that should be an exception, and inadvertently makes the code worse, not better.

Code isn’t black and white: nothing is always bad (except global variables) or always good (except automation). We’re not working at an assembly line, and we should understand why we write each line of code.

### Never write functions longer than…

If you google “how long should be my functions”, you’ll find a lot of answers: all kinds of random numbers, like [half-a-dozen](https://martinfowler.com/bliki/FunctionLength.html), 10, 25 or 60.

Some developers will brag that all their functions are only one or two lines long. Some developers will say that you must create a new function every time you want to write a comment or add an empty line.

I think it’s a wrong problem to solve and the size itself is rarely a problem. However, long functions often hide real issues, like too many responsibilities or deep nesting.

See the [Lint your code](#linting) chapter for more details.

### Always comment your code

Developers who believe that they must comment each (or at least most) line of their code are having a dangerous lifestyle, and not really better than those who _never_ write any comments.

See the [Avoid comments](#avoid-comments) chapter for more details.

### Always use constants for magic numbers

Using constants instead of magic numbers is a great practice, but not all numbers are magic. Often developer make code less readable by following this principle without thinking and converting all literal values, number and strings, to constants.

See the [Naming is hard](#naming-is-hard) chapter for more details.

### Never repeat yourself

Don’t repeat yourself (DRY) principle is probably the most overrated idea in software development.

See the [Divide and conquer, or merge and relax](#divide-and-conquer) chapter for more details.

<!-- textlint-disable -->

### Never say never

<!-- textlint-enable -->

Never listen when someone says you should never do that or always do this, without any exceptions. Answer to most software development questions is “it depends”, and such generalizations often do more harm than good.

A few more examples:

- _Never_ put state and markup in one component (_always_ use container / presenter pattern).
