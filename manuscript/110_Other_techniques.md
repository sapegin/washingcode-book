{#otter}

# Other techniques

<!-- description: Everything else that didn’t fit into other chapters -->
<!-- show-sections: true -->

{#impossible-states}

## Make impossible states impossible

In user interface (UI) programming, or _especially_ in UI programming, we often use boolean flags to represent the current state of the UI or its parts: _is data loading?_, _is submit button disabled?_, _has action failed?_

Often, we end up with multiple booleans: one for each condition. Consider this typical implementation of data fetching in a React component:

<!--
let state;
let useState = (x) => { state = x; return [x, (y) => state = y] }
-->

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
    return <p>Loading…</p>;
  }

  if (isError) {
    return <p>Something went wrong!</p>;
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

<!--
const {container: c1} = RTL.render(<Tweets />);
expect(c1.textContent).toEqual('Load tweets')
-->

We have two booleans here: _is loading_, and _has errors_. If we look closer at how the code uses them, we’ll notice that only one boolean is `true` at any time in a component’s lifecycle. It’s hard to see now, and it’s easy to make a mistake and correctly handle all possible state changes, so our component may end up in an _impossible state_ like _is loading_ and _has errors_ at the same time, and the only way to fix that would be to reload the page. This is exactly why switching off and on electronic devices often fixes weird issues.

We can replace several _exclusive_ boolean flags, meaning only one is `true` at a time, with a single enum:

<!--
function getTweets() { return Promise.resolve([{id: '1', username: 'taco', html: 'test'}, {id: '2', username: 'taco', html: 'test 2'}]) }
-->

```jsx
const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Ready: 'ready',
  Failed: 'failed'
};

function Tweets() {
  const [status, setStatus] = useState(Status.Idle);
  const [tweets, setTweets] = useState([]);

  const handleLoadTweets = () => {
    setStatus(Status.Loading);
    getTweets()
      .then(tweets => {
        setTweets(tweets);
        setStatus(Status.Ready);
      })
      .catch(() => {
        setTweets([]);
        setStatus(Status.Failed);
      });
  };

  if (status === Status.Loading) {
    return <p>Loading…</p>;
  }

  if (status === Status.Failed) {
    return <p>Something went wrong!</p>;
  }

  if (status === Status.Idle) {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  if (tweets.length === 0) {
    return <p>No tweets found</p>;
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

<!--
const {container: c1, getByRole, getByText} = RTL.render(<Tweets />);
expect(c1.textContent).toEqual('Load tweets')
-->

The code is now easier to understand: we know that the component can only be in a single state at any time. We’ve also fixed a bug in the initial implementation: the result with no tweets was treated as no result, and the component was showing the “Load tweets” button again.

For more complex cases, I’d go one step further and use `useReducer()` hook to manage all component state instead of separate `useState()` hooks:

<!--
function getTweets() { return Promise.resolve([{id: '1', username: 'taco', html: 'test'}, {id: '2', username: 'taco', html: 'test 2'}]) }
-->

```jsx
const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Ready: 'ready',
  Failed: 'failed'
};

const Action = {
  Load: 'load',
  LoadSuccess: 'load-success',
  LoadFailed: 'load-failed'
};

const initialState = {
  status: Status.Idle,
  tweets: []
};

function reducer(state, action) {
  switch (state.status) {
    case Status.Idle:
      switch (action.type) {
        case Action.Load:
          return { status: Status.Loading, tweets: [] };
      }
    case Status.Loading:
      switch (action.type) {
        case Action.LoadSuccess:
          return { status: Status.Ready, tweets: action.tweets };
        case Action.LoadFailed:
          return { status: Status.Failed, tweets: [] };
      }
  }
  return state;
}

export function Tweets() {
  const [{ status, tweets }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const handleLoadTweets = () => {
    dispatch({ type: Action.Load });
    getTweets()
      .then(tweets => {
        dispatch({ type: Action.LoadSuccess, tweets });
      })
      .catch(() => {
        dispatch({ type: Action.LoadFailed });
      });
  };

  if (status === Status.Loading) {
    return 'Loading…';
  }

  if (status === Status.Failed) {
    return 'Something went wrong!';
  }

  if (status === Status.Idle) {
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

<!--
const {container: c1, getByRole, getByText} = RTL.render(<Tweets />);
expect(c1.textContent).toEqual('Load tweets')
-->

It’s definitely more code, but now all the state management is contained in our reducer function. We also added another layer of protection: now certain actions are only allowed in certain statuses; for example, `LoadSuccess` only makes sense when we’re loading data (`Loading` status).

We’ve created a very simple _finite-state machine_:

![State machine diagram](images/tweets-state-machine.svg)

I> Proper state machines have many useful features, like events that handle transitions between states, or guards that define which transitions are allowed, and side effects. Here’s a good introduction to [state machines in React](https://mastery.games/post/state-machines-in-react/).

Reducers and state machines are even more powerful with TypeScript, where we can define more precise types for each status. For example, we can say that the `tweets` array only exists in the `Ready` status.

<!--
function getTweets() { return Promise.resolve([{id: '1', username: 'taco', html: 'test'}, {id: '2', username: 'taco', html: 'test 2'}]) }
-->

```tsx
type Status = 'Idle' | 'Loading' | 'Ready' | 'Failed';
type ActionType = 'Load' | 'LoadSuccess' | 'LoadFailed';

type Tweet = {
  id: string;
  username: string;
  html: string;
};

type State =
  | {
      status: 'Ready';
      tweets: Tweet[];
    }
  | {
      status: Exclude<Status, 'Ready'>;
    };

type Action =
  | {
      type: 'LoadSuccess';
      tweets: Tweet[];
    }
  | {
      type: Exclude<ActionType, 'LoadSuccess'>;
    };

const initialState: State = {
  status: 'Idle'
};

function reducer(state: State, action: Action): State {
  switch (state.status) {
    case 'Idle':
      switch (action.type) {
        case 'Load':
          return { status: 'Loading' };
      }
    case 'Loading':
      switch (action.type) {
        case 'LoadSuccess':
          return { status: 'Ready', tweets: action.tweets };
        case 'LoadFailed':
          return { status: 'Failed' };
      }
  }
  return state;
}

export function Tweets() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleLoadTweets = () => {
    dispatch({ type: 'Load' });
    getTweets()
      .then(tweets => {
        dispatch({ type: 'LoadSuccess', tweets });
      })
      .catch(() => {
        dispatch({ type: 'LoadFailed' });
      });
  };

  if (state.status === 'Loading') {
    return <p>Loading…</p>;
  }

  if (state.status === 'Idle') {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  if (state.status === 'Ready') {
    if (state.tweets.length === 0) {
      return <p>No tweets found</p>;
    }

    return (
      <ul>
        {state.tweets.map(({ id, username, html }) => (
          <li key={id}>
            {html} by {username}
          </li>
        ))}
      </ul>
    );
  }

  return <p>Something went wrong!</p>;
}
```

<!--
const {container: c1, getByRole, getByText} = RTL.render(<Tweets />);
expect(c1.textContent).toEqual('Load tweets')
-->

It’s about the same amount of code as the plain JavaScript implementation, but it’s much more bulletproof. We also got rid of the enums and simplified the code since TypeScript can check if the status and action types are correct. This method even helped me find several bugs in my initial JavaScript implementation of this example.

I> The pattern we used for `State` and `Action` types is called _discriminated unions_, read more about it in [an article by Alejandro Dustet](https://thoughtbot.com/blog/the-case-for-discriminated-union-types-with-typescript).

UI components can have similar issues caused by multiple conflicting styles. Consider a button component that supports primary and secondary styles. We change the style using component props: `<Button primary>` or `<Button secondary>`.

But what if we try to use it as `<Button primary secondary>`? Probably something ugly will appear on the screen that will give hiccups to our designer.

We can fix it the same way we fixed the previous example: by replacing two boolean props with a single one, let’s call it `variant`: `<Button variant="primary">` or `<Button variant="secondary">`.

Now it’s clear that we can only use one variant of a button at a time.

## Don’t try to predict the future

Requirements are constantly changing, the business is constantly trying to make more money. Sometimes by improving user experience and making the app better, sometimes by exploiting human psychology and making app worse. In both cases we need to change the code all the time. People have invented agile software development to deal with the changing requirements: it’s better to develop software in small iterations than to spend months on writing detailed specs that became obsolete by the time we start implementing them.

Somehow, developers often try to think too far in the future: “_they_ will want to add pagination to the list of pizza toppings on our pizzeria site, let’s add support now to save time later.” But then _they_ want infinite scrolling or stop selling pizzas at all, and we end up removing most of our pagination code.

It’s called Premature abstraction, [premature generalization](https://www.codewithjason.com/premature-generalization/), or [speculative generality](https://refactoring.guru/smells/speculative-generality). It feels like we’re saving time for future selves by making our code more generic, but this very code is what often prevents us from implementing real future requirements easily in the future. We end up writing and maintaining code that will never be used or code that we’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. It will be easier to review and test now, and to adapt to new requirements in the future.

<!-- textlint-disable alex -->

I> This approach is often called [Yagni](https://martinfowler.com/bliki/Yagni.html) (You aren’t gonna need it) or [KISS](https://en.wikipedia.org/wiki/KISS_principle) (Keep it simple, stupid!).

<!-- textlint-enable -->

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make UI easy to change and move around.

{#campsite-rule}

## Become a code scout

The _campsite rule_ (previously known as _boy scout rule_) states that we should leave the campground cleaner than we found it. For example, if someone else has left garbage, we should take it with us.

Same in programming. For example, we’re done with a task, running the linter before committing the changes, and notice that there are some warnings but not in the lines we’ve written or even changed. If it’s not a lot of work and won’t make the diff too big, we should fix these warnings, and make code cleaner for the next person who’s going to work with it.

I don’t fully agree with the idea that a particular code change (pull request) shouldn’t have any refactorings, bugfixes, or improvements. If the fix is tiny, why not do it right away instead of postponing it for a separate pull request which likely will never happen. It does make code review slightly harder, but often refactorings are easier to understand in the context of a change that requires them. Isolated refactorings often feel like refactorings for the sake of refactoring, which isn’t a good thing to do, and definitely not a good thing to spend our colleagues’ time in code reviews.

Often there’s no easy way to split things into several pull requests, and often doing refactoring is actually easier than trying to hack a task into existing code without the refactoring. This also avoids problems with management who may see refactoring as a waste of time. For me, it’s an inevitable part of work on features.

I was also never good at splitting refactoring into many tiny pull requests, atomic commits, and such. It requires the discipline I don’t have. Also, I disagree that we shouldn’t fix bugs during refactoring. It seems weird to me to spend time on recreating the incorrect behavior in the refactored code just to keep the refactoring “pure”.

However, if the refactoring is really big, it’s better to postpone it or extract to a separate pull request if once we see that it makes the initial pull request too large (which I often do). If there’s no time to do it now, making a ticket explaining the improvement is a good idea.

Try to avoid rewriting everything at once, and look for signs: too many bugs in some part of code, growing code spagettiness because of many changes in the same place. These are the places worth improving.

Having a good test suit makes any refactoring safer, especially when tests aren’t testing low-level implementation details but integration of several higher-level modules.

The opposite to the campsite rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving linting warning unfixed, leaving debug code, unused or commented out code, sloppy and cluttered code. This creates an environment when nobody cares, because one new linting warning won’t make code with 1473 warnings significantly worse. It feels different when we introduce a new linting warning to a project that has none.

I> We talk about linting in the [Lint your code](#linting) chapter.

It’s also worth mentioning the David Allen’s [2-minute rule](https://www.skillpacks.com/2-minute-rule/) that states “if an action will take less than two minutes, it should be done now it is defined”.

Same in programming. If fixing something takes less than two minutes, we should not postpone it, and fix it right away. And if it only takes two minutes to fix, it probably won’t make the pull request diff much larger.

One may argue that doing all these improvements may introduce bugs, and it’s true. However, with good code coverage, static typing, and modern tooling, the benefits are greater than the risks.

I often do small improvements, like renaming variables, moving things around or adding comments, when I read the code. If something is confusing for me, I try to make it less confusing for my colleagues or future me.

Here’s a recent example:

<!--
const Platform = { OS: 'PizzaOS' }, copyToClipBoard = () => {}
const useOrderDetails = () => { return { orderId: 'tacos' }}
const MenuListItem = ({concatenateText}) => concatenateText
const OrderIdIcon = () => null, CopyIcon = () => null
-->

```jsx
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

```jsx
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

I> We talk more about parallel code in [Don’t make me think](#no-thinking) chapter.

Some people [even believe](https://www.reddit.com/r/programming/comments/2tjoc8/the_boy_scout_rule_of_coding/?rdt=48062) that we shouldn’t touch what’s working and refactoring has no business value for the product, but I fiercely disagree. Our job is not only do what we’re told to do by the business people but also to keep our software easy to change, so we can quickly react to new business requirements. This is only possible if we care about maintainability, don’t let the tech debt pile up.

{#greppability}

## Make the code greppable

Consider this example:

```jsx
function BookCover({ title, type, width = 150, height = 194 }) {
  return (
    <img
      className="book-cover"
      src={`/images/cover-${type}.jpg`}
      width={width}
      height={height}
      alt={`${title} book cover`}
    />
  );
}
```

<!--
const {getByRole} = RTL.render(<BookCover title="Tacos" type="tacos" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/cover-tacos.jpg')
-->

The issues with this code is the dynamic generation of the image filename.

Imagine, we’re looking at the `/images/cover-washing-code.jpg` file and we wan to know where this file is used. We try to search `cover-washing-code.jpg` or `cover-washing-code` and don’t find anything. We may assume that this file is unused and delete it. Naturally, this breaks our app.

We can have a similar situation in many other cases: filenames, translation keys, CSS class names, function and module names…

There are two possible solutions to this.

When we know all possible values in advance, we can map them:

```jsx
const COVERS = {
  'washing-code': 'cover-washing-code.jpg',
  tacos: 'cover-tacos.jpg'
};
function BookCover({ title, type, width = 150, height = 194 }) {
  return (
    <img
      className="book-cover"
      src={`/images/${COVERS[type]}`}
      width={width}
      height={height}
      alt={`${title} book cover`}
    />
  );
}
```

<!--
const {getByRole} = RTL.render(<BookCover title="Tacos" type="tacos" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/cover-tacos.jpg')
-->

Here, we have a map with all possible filenames, so if we search by a filename (`cover-washing-code.jpg` or `cover-washing-code`), we’ll find this component.

However, we don’t always know all the values in advance. In our example, we can move the files to a separate folder and use a complete name without extension as an identifier:

```jsx
function BookCover({ title, type, width = 150, height = 194 }) {
  return (
    <img
      className="book-cover"
      src={`/images/covers/${type}.jpg`}
      width={width}
      height={height}
      alt={`${title} book cover`}
    />
  );
}
```

<!--
const {getByRole} = RTL.render(<BookCover title="Tacos" type="tacos" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/covers/tacos.jpg')
-->

Here, we can search either by a folder name (`/images/covers`) and find this component or by a filename (`cover-washing-code`) and find all usages of this component.

I call such identifiers _greppable_, meaning we can search for them and find all places in the code where they are used. The name comes from the `grep` unix command that finds a substring in a file.

I> This idea is also known as _the grep test_ and is greatly described in [Jamie Wong’s article with the same title](https://jamie-wong.com/2013/07/12/grep-test/).

We can also create a map using types:

```tsx
type Cover = 'washing-code' | 'tacos';
interface BookCoverProps {
  title: string;
  type: Cover;
  width?: number;
  height?: number;
}

function BookCover({
  title,
  type,
  width = 150,
  height = 194
}: BookCoverProps) {
  return (
    <img
      className="book-cover"
      src={`/images/covers/${type}.jpg`}
      width={width}
      height={height}
      alt={`${title} book cover`}
    />
  );
}
```

<!--
const {getByRole} = RTL.render(<BookCover title="Tacos" type="tacos" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/covers/tacos.jpg')
-->

The benefit of this approach over the map implemented as JavaScript object is that types won’t increase our bundle size and won’t be shipped to the client. This isn’t an issue for backend code though.

Some tips to improve _code greppability_:

- **Don’t concatenate identifiers**, try to write them fully.
- **Avoid generic and ambiguous names** (like `processData()`) for things that are used in more than one module. Generic names are harder to find in the codebase because we’ll get false positives: other things that have the same name but not the thing we’re looking for.
- **Consider using a map**, where all names are fully written, if they depend on a parameter.

TypeScript helps a lot with these things: for example, we can now find all places where a particular function is used, even if it’s imported with a different name. However, for many other cases, it’s still important to keep identifiers greppable: filenames, translation keys, CSS class names, and so on.

## Avoid not invented here syndrome

[Not invented here](https://en.wikipedia.org/wiki/Not_invented_here) syndrome (NIH) represents fear or a ban on using third-party solutions. It could come from an internal developer’s need to prove themselves to the world or from an employer, usually a huge one, that hired so many developers that there’s not enough actually useful work for everyone.

Like any extreme, discarding all third-party libraries in our work is unhealthy. Many problems are generic enough and don’t need to be rewritten by every developer on the planet again and again. For many problems, there are popular open source libraries, that are well tested and documented.

In this section, we focus on utility functions rather than on big frameworks, because I see developers reinventing utility functions far more often than big frameworks.

### What’s wrong with in-house solutions

The worst case is inlining utility functions like this:

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

This code is checking that the object isn’t empty, meaning it has at least one property. It’s hard to see the code intention immediately, and it’s hard to remember to do the existence check to avoid runtime exceptions when the variable is `undefined`.

Having a function with a meaningful name that encapsulates all the required checks (including the ones we’ll come up with in the future) makes the intention of the code more clear:

<!--
const object = { o: 0 }
let result = false
let isEmpty = _.isEmpty
-->

```js
if (isEmpty(object) === false) {
```

<!--
  result = true
}
expect(result).toBe(true)
-->

This is a bit more readable. Now, the question is whether we write this function ourselves or use one that somebody has already written.

It might be tempting to quickly write our own function or copypaste one from Stack Overflow — what’s here to write anyway? Our function could look like this:

```js
function isEmpty(object) {
  return Object.keys(object ?? {}).length === 0;
}
```

<!--
expect(isEmpty()).toBe(true)
expect(isEmpty({})).toBe(true)
expect(isEmpty({foo: 42})).toBe(false)
-->

However, we should first consider potential problems of maintaining our own solution:

- Poor tests and documentation, or no documentation at all.
- Not generic enough and built to cover only one or a few use cases.
- Many bugs aren’t fixed because of a small number of users and a lack of tests.
- No Google and Stack Overflow to help us when something isn’t working.
- Maintenance may take a lot of time that we could spend adding new features or improving the product.
- New developers our company hires need to learn how to use its in-house artisanal libraries, which is often hard because of poor documentation and discoverability.

Let’s compare our own function with one from a popular library: [isEmpty from Lodash](https://lodash.com/docs#isEmpty). It looks quite similar, but it supports objects, arrays, maps, and sets; it’s documented with examples, and it’s tested. I wouldn’t want to deal will all these myself, if an alternative already exists.

On a real project, I’d make sure that the `object` is always an object (never `undefined` or `null`, TypeScript can help with this), and then either use Lodash’s `isEmpty` function if available, or inline the `Object.keys(object).length > 0` condition where I need it (now we don’t need to check object existence first).

### Why third-party libraries might be better

When using a popular, well-established library:

- **Lots of information:** documentation, articles, books, Stack Overflow answers, and conference talks (even whole conferences dedicated to a single library).
- **Big community:** many plugins and additional libraries to use with it, and so on
- **Easier hiring and onboarding:** many developers will already be familiar with a library and have experience working with it.
- **Few bugs:** most bugs have already been found and fixed.
- **Regular updates,** and bugfixes.

### What to keep in mind when using third-party libraries

Some things we need to keep in mind when using third-party libraries:

- **Hard to choose** a good library: there are too many, and often all are far from great.
- **May be abandoned:** open source libraries die every day for many reasons, for example, [maintainers’ burnout](https://sapegin.me/blog/open-source-no-more/).
- **Bundle size:** they may significantly increase the bundle size.
- **Interoperability:** some libraries may require particular versions of some other libraries, or have incompatibilities that are hard to track and fix.
- **Security risks:** it’s not uncommon that popular npm packages get compromised, and we may end up including some malicious code that will break our app in production or even destroy some data.

T> Use [Bundlephobia](https://bundlephobia.com/) to check the size of any npm package.

Another problem is when the library isn’t doing exactly what we want. In this case, we could:

- Submit a pull request to the library, which may take a lot of time to be reviewed, approved, merged, and released; or it may never be merged.
- Fork the library or copy the code to our own codebase, and make the changes there; so we’re essentially converting a third-party library into an in-house one, with all the problems of the artisanal libraries mentioned above.
- Switch to another library that does what we want better, which may take a lot of time and won’t really solve the problem long-term.

### My approach to using third-party libraries

I don’t have any strict rules on using third-party libraries versus in-house ones, and balance is important here: both have their place in our work. For me, the choice depends on the complexity of the function I need, the type of the project (personal or not), my experience with a particular library that may do what I need, and so on.

I use [Lodash](https://lodash.com/) on most of my projects: it’s a hugely popular utility library for JavaScript that has lots of useful functions, and many developers have experience with it, so they’ll spend less time reading and understanding the code that uses these functions.

I tend to use _microlibraries_ on my personal projects, but it’s more of a personal preference than a rational chose, and my personal projects are usually small and simple.

A microlibrary is a tiny library, often a one-liner, that does one small task, and nothing else.

Some examples of microlibraries are:

- [clsx](https://github.com/lukeed/clsx): constructing `className` strings conditionally.
- [dlv](https://github.com/developit/dlv): safely get a dot-notated path within a nested object.
- [pretty-bytes](https://github.com/sindresorhus/pretty-bytes): convert bytes to a human-readable string.
- [rgb-hex](https://github.com/sindresorhus/rgb-hex): convert colors from RGB to HEX.
- [uid](https://github.com/lukeed/uid): generation of random IDs.

The good things about microlibraries are:

- **Small size:** don’t increase the bundle size much.
- **Zero or few dependencies:** often don’t have dependencies.
- **Understandable:** one can read and understand the code in a few minutes.

The bad things about microlibraries are:

- **Hard to choose:** we need to choose, install and update each library separately.
- **Inconsistent:** Different libraries may have very different APIs.
- **Lack of documentation:** it’s less accessible because we need to look for each library separately.

It would probably take me less time to write many of these microlibraries myself than to choose a decent one on npm. But then I’d need to write tests, types, comments… and the idea of writing my own utility function doesn’t seem so attractive anymore.

I try to choose microlibraries from a few developers I trust: mainly [Luke Edwards](https://www.npmjs.com/~lukeed) and [Sindre Sorhus](https://www.npmjs.com/~sindresorhus).

Another consideration is how difficult it is to introduce a new dependency on the project. For a small personal project, adding a new dependency is only one `npm install` away, but a large project may require many steps, like presenting a proposal to the team and obtaining security approval. The latter makes adding new dependencies less likely, which might be frustrating but has some benefits too. It’s harder to keep track of all dependencies on a large project to make sure there are no vulnerabilities and no multiple dependencies that do the same thing but are added by different developers.

For larger projects, it makes a lot of sense to use popular, well-established libraries, like React, styled-components, or Tailwind.

The best approach to using third-party libraries is probably this: the bigger the project and the more developers work on it, the more stable its dependencies should be, with a focus on popular and established libraries rather than on microlibraries.

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

I> We talk about measuring code dimensions in the [Lint your code](#linting) chapter.

### Always comment your code

Developers who believe that they must comment each (or at least most) line of their code are having a dangerous lifestyle, and not really better than those who _never_ write any comments.

I> We talk about commenting code in the [Avoid comments](#no-comments) chapter.

### Always use constants for magic numbers

Using constants instead of magic numbers is a great practice, but not all numbers are magic. Often developer make code less readable by following this principle without thinking and converting all literal values, number and strings, to constants.

I> We talk about naming in the [Naming is hard](#naming) chapter.

### Never repeat yourself

Don’t repeat yourself (DRY) principle is probably the most overrated idea in software development.

I> We talk about DRY principle and organizing code in the [Divide and conquer, or merge and relax](#divide) chapter.

### Always use only one return statement in a function

There’s this idea that functions should have only one `return` statement. I’ve even seen it called a law: _the single return law_. It comes from a very old principle _single entry, single exit_ (SESE) that [comes from the days of FORTRAN and COBOL](https://softwareengineering.stackexchange.com/questions/118703/where-did-the-notion-of-one-return-only-come-from/118793#118793) and made sense back then. Now it’s unnecessary, and often limiting yourself to a single `return` statement reduces the readability.

However, as it often happens, we upgraded the technology, but kept using rules and best practices of the old tech.

### 100% code coverage

I often see that management demands a certain number of lines of code covered by automated tests: it could be anywhere from 70% to even 100%. This values is called _code coverage_.

I> I used to use _code coverage_ and _test coverage_ interchangeably. However, they are different terms: code coverage measures the proportion of lines of code executed during a test run, and test coverage measures how well tests cover the functionality requirements.

Automated tests are useful, however, testing every line of code isn’t achievable or useful. After reaching maybe 70% increasing code coverage gets harder and harder, it’s often impossible to go higher than a certain number by writing meaningful tests. Test quality is getting worse, developers waste lots of time writing and fixing tests… and at the same time the management is happy to see the coverage number growing higher.

High code coverage gives us a false sense of security: faking the coverage number, intentionally or now, isn’t that difficult. For example, we can write a test like this:

<!--
let MainPage = () => null
let test = (_, fn) => fn()
let render = () => {}
-->

```jsx
test('renders the landing page', () => {
  render(<MainPage />);
});
```

<!-- // This is an implicit assertion: let it be -->

This test alone can give us 60-70% code coverage without a single assertion, or actually testing any functionality, because code coverage measures numbers lines _executed_ from test, it doesn’t measure tests’ quality.

T> The test about isn’t entirely pointless and is better than no test at all. At least it makes sure that the page renders without exceptions. Artem Zakharchenko [wrote a great article](https://www.epicweb.dev/implicit-assertions) about such tests that are called implicit assertions.

Usually, if an organization uses a certain metric to measure performance, employees will optimize their work to increase this metric. Often, at the expense of the quality of their work.

In addition, not all kinds of tests are equally useful for all projects. For example, for frontend tests integration test are usually more useful than unit tests, so requiring a high unit code coverage would be unproductive.

I> I have a big series of articles on my blog on [best practices of React testing](https://sapegin.me/blog/react-testing-1-best-practices/).

### Never say never

Never listen when someone says you should never do that or always do this, without any exceptions. Answer to most software development questions is “it depends”, and such generalizations often do more harm than good.

## Debug code with emojis

Using `console.log()` is my favorite way of debugging JavaScript and TypeScript code. I’ve been trying to use more fancy techniques, like a debugger, but I always come back to console.log(), because it’s the simplest and it works for me.

The way I do it is by adding a separate log for each variable I want to track, like so:

<!--
let buffer = ''
let console = {log: (a, b) => buffer = `${a} ${b}` }
-->

```js
function bugMaybeHere(something) {
  console.log('🍕 something', something);
}
```

<!--
bugMaybeHere('tacocat')
expect(buffer).toBe('🍕 something tacocat')
-->

I always add a different emoji at the beginning, so it’s easy to differentiate logs in the browser console.

T> I created a Visual Studio Code extension to add such `console.log`s using a hotkey: [Emoji Console Log](https://marketplace.visualstudio.com/items?itemName=sapegin.emoji-console-log).

## Go for a walk or talk to a rubber duck

Not once this situation happened to me: I spend hours debugging an especially hairy issue; I stop working and switch to another task, go out for a walk, or go home (if I’m in the office); and suddenly the solution appears in my mind.

When we spend too much time on a single task, our brain get blurry and stops seeing what would be obvious to us after a break.

Another approach is called _rubberducking_, or [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging). The idea is to explain a problem in detail to someone else: a friend, colleague, or, to a rubber duck. The recipient isn’t important here and supposed to just listen. Often the act of explaining the issue helps us to see where the problem is and come up with a solution.

This is similar to how writing an article on a certain topic helps us to spot any gaps in our understanding of the topic and forces us to learn it much deeper. This is my favorite way of learning new things.
