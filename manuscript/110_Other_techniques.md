{#otter}

# Other techniques

<!-- description: Everything else that didn’t fit into other chapters -->
<!-- show-sections: true -->

{#impossible-states}

## Make impossible states impossible

It’s common in user interface (UI) programming to use boolean flags to represent the current state of the UI or its parts: _is data loading?_, _is submit button disabled?_, _has action failed?_, and so on.

Consider this typical implementation of data fetching in a React component:

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
    return (
      <button onClick={handleLoadTweets}>Load tweets</button>
    );
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

We have two booleans here: _is loading_ and _has errors_. If we look closer at how the code uses them, we’ll notice that only one boolean is `true` at any time in a component’s lifecycle. It’s hard to see now, making it difficult to correctly handle all possible state changes, so our component may end up in an _impossible state_ like _is loading_ and _has errors_ at the same time. The only way to fix this would be to reload the page. This is exactly why turning electronic devices off and on often fixes weird issues.

We can replace several _exclusive_ boolean flags — where only one is `true` at a time — with a single enum:

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
    return (
      <button onClick={handleLoadTweets}>Load tweets</button>
    );
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

For more complex cases, I’d go one step further and use the `useReducer()` hook to manage all component state instead of separate `useState()` hooks:

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
          return {
            status: Status.Ready,
            tweets: action.tweets
          };
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
    return (
      <button onClick={handleLoadTweets}>Load tweets</button>
    );
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

We’ve created a basic _finite-state machine_.

![State machine diagram](images/tweets-state-machine.svg)

I> State machines can have many useful features, like events that handle transitions between states, guards that define which transitions are allowed, and side effects. Here’s a good introduction to [state machines in React](https://mastery.games/post/state-machines-in-react/).

Reducers and state machines are even more powerful with TypeScript, allowing us to define more precise types for each status. For example, we can define that the `tweets` array only exists in the `Ready` status:

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
    return (
      <button onClick={handleLoadTweets}>Load tweets</button>
    );
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

It’s about the same amount of code as the plain JavaScript implementation, but it’s much more bulletproof. We also got rid of the enums and simplified the code, since TypeScript can check if the status and action types are correct. This method even helped me find several bugs in my initial JavaScript implementation of this example.

I> The pattern we used for `State` and `Action` types is called _discriminated unions_, read more about it in [Alejandro Dustet’s article](https://thoughtbot.com/blog/the-case-for-discriminated-union-types-with-typescript).

UI components can have similar issues caused by multiple conflicting styles. Consider a button component that supports primary and secondary styles. We can change the style using component props: `<Button primary>` or `<Button secondary>`.

But what if we try to use it as `<Button primary secondary>`? Probably something ugly will appear on the screen that will give hiccups to our designer.

We can fix it the same way we fixed the previous example: by replacing two boolean props with a single enumeration, let’s call it `variant`: `<Button variant="primary">` or `<Button variant="secondary">`. Now, it’s clear that we can only use one variant of a button at a time.

{#no-future}

## Don’t try to predict the future

Requirements are always changing, and the businesses are always trying to make more money. Sometimes, they do this by improving user experience and making the app better, other times, by exploiting human psychology and making the app worse. In both cases, we need to change the code all the time. Smart folks have invented [agile software development](https://agilemanifesto.org) to deal with the changing requirements: it’s better to develop software in small iterations than to spend months on writing detailed specs that become obsolete by the time we start implementation begins.

Developers often try to think too far ahead: “_they_ will want to add pagination to the list of pizza toppings on our pizzeria site, let’s add support now to save time later.” But then _they_ want infinite scrolling or decide to stop selling pizzas altogether, and we end up removing most of our pagination code.

It’s called _premature abstraction_, [premature generalization](https://www.codewithjason.com/premature-generalization/), or [speculative generality](https://refactoring.guru/smells/speculative-generality). It may seem like we’re saving time for our future selves by making our code more generic, but this very code often prevents us from easily implementing actual future requirements. We end up writing and maintaining code that will never be used, or code that we’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. This makes it easier to review and test now and to adapt to new requirements in the future.

I> This approach is often called [Yagni](https://martinfowler.com/bliki/Yagni.html) (You aren’t gonna need it) or [KISS](https://en.wikipedia.org/wiki/KISS_principle) (Keep it simple, <!-- textlint-disable alex -->stupid<!-- textlint-enable -->!).

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make the UI easy to change and move around.

{#campsite-rule}

## Become a code scout

The _campsite rule_ (previously known as the _boy scout rule_) advises that we should leave the campsite cleaner than we found it. For example, if someone else has left garbage, we should take it with us.

Same in programming. For example, after finishing a task, we run the linter before committing the changes and notice some warnings but not in the lines we’ve written or even changed. If it’s not too much work and won’t make the diff too large, we should fix these warnings to leave the code cleaner for the next person who works with it.

I don’t fully agree with the idea that a particular code change (pull request) should exclude all refactorings, bugfixes, and improvements. If the fix is tiny, why not do it right away instead of postponing it to a separate pull request, which likely will never happen. While they may make code review slightly harder, refactorings are often easier to understand in the context of the change that requires them. Isolated refactorings can feel like refactorings for its own sake, which isn’t a good thing to do and definitely not a good thing to spend our colleagues’ time during code reviews.

Often, there’s no easy way to split things into several pull requests, and often, refactoring is actually easier than trying to hack a task into existing code without it. This approach also avoids issues with management, who may view refactoring as a waste of time (though if you work with someone like that, it might be time to update your résumé). To me, it’s an inevitable part of feature development.

I’ve never been good at splitting refactorings into many tiny pull requests, atomic commits, and such. It requires a level of discipline that I don’t have. Also, I disagree that we shouldn’t fix bugs during refactoring. It seems weird to spend time recreating incorrect behavior in refactored code just to keep the refactoring “pure”.

However, if the refactoring is huge, it’s better to postpone it or extract it to a separate pull request once we realize it makes the initial pull request too large. If there’s no time to do it now, creating a ticket that explains the improvement is a good idea.

Avoid rewriting everything at once, and instead, look for signs: an area of code with too many bugs or growing code spagettiness caused by frequent changes in the same place. These are the areas worth improving.

Having a good test suite makes any refactoring safer, especially when the tests focus on the integration of higher-level modules rather than low-level implementation details.

I> We talk a bit about testing in the [Write testable code](#testability) section later in this chapter.

The opposite of the campsite rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory), which states that an environment with visible signs of crime or disorder, such as an unfixed broken window, encourages further crime and disorder. And “fixing” these minor issues creates an environment that prevents more serious crimes.

Same in programming. Minor “crimes” could include leaving linting warnings unfixed, leaving debug code, unused or commented-out code, or writing sloppy and cluttered code. This creates an environment where nobody cares because one more linting warning won’t make code, that already has 1473 warnings, significantly worse. It feels different when we introduce a new linting warning into a project that has none.

I> We talk about linting in the [Lint your code](#linting) chapter.

It’s also worth mentioning David Allen’s [2-minute rule](https://www.skillpacks.com/2-minute-rule/), which states that if an action takes less than two minutes, it should be done when it’s defined.

Same in programming. If fixing something takes less than two minutes, we should fix it right away rather than postponing it. And if it only takes two minutes to fix, it likely won’t make the pull request diff much larger.

Some may argue that doing all these improvements could introduce bugs, and it’s true. However, with a good test suite, static typing, and modern tooling, the benefits outweigh the risks.

I often make small improvements, like renaming variables, moving things around, or adding comments, when I read the code. If something confuses me, I try to make it clearer for my colleagues or future me.

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

Here, it took me some time to notice that the only difference between the two branches is the `rightContent` and `onPress` props. This isn’t obvious because shared props are repeated, so I had to compare each line to be sure that they are exactly the same.

T> I like to select a part of the code to check whether it’s the same as another part nearby. If my editor highlights both parts, they are exactly the same.

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

Now, there’s no question about which props are different and which are the same.

I’m a big fan of parallel code, and, even though the original code was already parallel, thanks to the two branches of a ternary operator, it’s now easier to see the differences between branches that were previously buried in duplicate code.

I> We talk more about parallel coding in [Don’t make me think](#no-thinking) chapter.

Some people [even believe](https://www.reddit.com/r/programming/comments/2tjoc8/the_boy_scout_rule_of_coding/?rdt=48062) that we shouldn’t touch what’s working and refactoring has no business value for the product, but I fiercely disagree. Our job is not only do what we’re told to do by the business people, but also to keep the software easy to change, so we can quickly react to new business requirements. This is only possible if we care about maintainability, and don’t let the tech debt pile up.

{#testability}

## Write testable code

Generally, I prefer _integration or end-to-end tests_ over unit tests for testing functionality because they are more resilient to code changes. They don’t need to know much about the app’s internal organization, and as long as the functionality and UX remain the same, they will continue to work, even if the code is completely rewritten. End-to-end tests also better resemble user behavior and make sure an app works as a whole, not just its individual modules.

_Unit tests_ require more care because they are closely tied to the code they test, so most code changes would require updating the tests. Moving or renaming functions would require moving tests or updating imports. However, unit tests are better for testing utility functions, where it could be hard to test all edge cases by testing the whole app. Unit tests are also much faster than end-to-end tests, and we can run them in watch mode to receive an immediate feedback for every code change.

I> I wrote a big series of articles on the [best practices of frontend testing](https://sapegin.me/blog/react-testing-1-best-practices/).

Here are the qualities that make a function testable:

- **Deterministic**: given a certain input, a function should always return the same result. This makes such a function predictable, allowing us to write test cases for various inputs and be confident that the results will always be the same.
- **No side effects:** a function doesn’t change anything outside its scope; the only way it may affect its outer scope is through its return value.
- **Single responsibility:** it’s easier to test all possible scenarios and edge cases of a function when it doesn’t do too much.
- **Logic and presentation are separated:** it’s easier to test raw data, such as numbers, arrays, or objects, than its presentation, such as HTML. Also, presentation usually changes more often than logic, meaning we’d have to update our tests more often if they were testing the presentation.

In summary, it’s easier to test small, pure functions. I don’t always follow these principles because I write unit tests only when I need to test some complex logic. In such cases, these principles simplify testing and make tests more resilient to future code changes.

I> A _pure function_ is a function that always returns the same value when given the same arguments (meaning it doesn’t depend on any non-deterministic value like dates or random numbers, any non-constant value outside the function, or the function’s internal state) and has no side effects (meaning it doesn’t change any external variables, update the database, send network requests, and so on).

Let’s look at an example:

<!--
class UAParser {
  getOS() {
    return {name: 'Windows'}
  }
}
let isTouchDevice = () => false
let DeviceType = {
  Desktop: 'Desktop',
  iOS: 'iOS',
  Android: 'Android',
  Tablet: 'Tablet',
  Other: 'Other',
}
-->

```js
function getDeviceType() {
  const parser = new UAParser();
  const os = parser.getOS();
  const hasTouch = isTouchDevice();
  switch (os.name) {
    case 'Windows': {
      return DeviceType.Desktop;
    }
    case 'Mac OS': {
      // iPadOS returns MacOS instead when in desktop mode
      return hasTouch ? DeviceType.iOS : DeviceType.Desktop;
    }
    case 'iOS': {
      return DeviceType.iOS;
    }
    case 'Android': {
      return DeviceType.Android;
    }
    case 'Linux': {
      // Sometimes Samsung Internet on Galaxy Tab returns Linux
      return parser.getBrowser().name === 'Samsung Internet'
        ? DeviceType.Android
        : DeviceType.Desktop;
    }
    default: {
      return DeviceType.Other;
    }
  }
}
```

<!-- expect(getDeviceType()).toBe('Desktop') -->

This function retrieves a browser’s user agent and returns a device name based on the user’s operating system, with some corrections.

Let’s apply the guidelines for testable functions we’ve defined above to this function:

- Is it deterministic? No, it doesn’t take any parameters, but the result depends on the user’s environment, which we cannot control when calling the function.
- Does it have no side effects? Yes, it doesn’t change anything outside the function, and only returns a value to the caller.
- Is it responsible only for one thing? Yes, it determines the user’s device name based on their environment.
- Does it control only logic, not presentation? Yes, it returns an enum value of the device type that has no opinion on how it should be displayed.

It doesn’t sound so bad, but how do we test it?

A conventional way to test such a function is by mocking its dependencies: the `UAParser` class (or the actual user agent string — `navigator.userAgent`) and the `isTouchDevice` function:

<!--
let vi = {
  mock: (name, fn) => fn(),
  spyOn: (obj, prop, action) => ({mockReturnValue: (val) => val})
}
let DeviceType = { iOS: 'iOS' }
let test = (name, fn) => fn()
let getDeviceType = () => DeviceType.iOS
-->

```js
// Mock the isTouchDevice() function
let hasTouch = false;
vi.mock('deviceInfo', () => {
  return {
    isTouchDevice: () => hasTouch
  };
});

test('Safari on iPad in desktop mode', () => {
  // Tell isTouchDevice() mock to return true
  hasTouch = true;
  // Mock the browser user agent string
  vi.spyOn(
    window.navigator,
    'userAgent',
    'get'
  ).mockReturnValue(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1'
  );
  expect(getDeviceType()).toBe(DeviceType.iOS);
});
```

<!-- // Run the code and hope it works... -->

This test is very convoluted and requires a lot of boilerplate code. Also, it has a bug: once we set `hasTouch` to `true`, all following test cases will also get it as `true`. We need to reset the mock value after each test case:

<!-- let afterEach = fn => fn() -->

```js
afterEach(() => {
  hasTouch = false;
});
```

This adds even more complexity, making the approach error-prone.

A better solution is to use _dependency injection_: passing function dependencies as parameters so we can redefine them in tests. Additionally, we use default function parameters to keep existing function calls unchanged.

<!--
import { UAParser } from 'ua-parser-js'
let DeviceType = {
  Desktop: 'Desktop',
  iOS: 'iOS',
  Android: 'Android',
  Tablet: 'Tablet',
  Other: 'Other',
}
-->

```js
function getDeviceType({
  uaParser = new UAParser(),
  hasTouch = isTouchDevice()
} = {}) {
  const os = uaParser.getOS();
  switch (os.name) {
    case 'Windows': {
      return DeviceType.Desktop;
    }
    case 'Mac OS': {
      // iPadOS returns MacOS instead when in desktop mode
      return hasTouch ? DeviceType.iOS : DeviceType.Desktop;
    }
    case 'iOS': {
      return DeviceType.iOS;
    }
    case 'Android': {
      return DeviceType.Android;
    }
    case 'Linux': {
      // Sometimes Samsung Internet on Galaxy Tab returns Linux
      return uaParser.getBrowser().name === 'Samsung Internet'
        ? DeviceType.Android
        : DeviceType.Desktop;
    }
    default: {
      return DeviceType.Other;
    }
  }
}
```

<!-- expect(getDeviceType({uaParser: new UAParser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1'), hasTouch: false})).toBe('Desktop') -->

Testing now becomes straightforward:

<!--
import { UAParser } from 'ua-parser-js'
let test = (name, fn) => fn()
let DeviceType = { iOS: 'iOS' }
let getDeviceType = () => DeviceType.iOS
-->

```js
test('Safari on iPad in desktop mode', () => {
  const uaParser = new UAParser(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1'
  );
  const hasTouch = true;
  expect(getDeviceType({ uaParser, hasTouch })).toBe(
    DeviceType.iOS
  );
});
```

<!-- // Run the code and hope it works... -->

With dependency injection, we can test any combination of the user agent string and touch support by passing these values directly in test cases. No need for mocks, resetting the state after each test, and so on. Each test is independent and doesn’t require any changes in the environment to run.

To improve the readability of the tests themselves, we can use the [Arrange-Act-Assert](https://wiki.c2.com/?ArrangeActAssert) pattern, where each test case consists of three sections separated by an empty line:

- **Arrange**: prepare the data and the environment.
- **Act**: run the code we’re testing with the test data.
- **Assert**: check that the result is correct.

Here’s a test written using the Arrange-Act-Assert pattern:

<!--
let test = (_, fn) => fn(), render = () => {}
let expect = () => ({ toHaveLength: () => {}, not: { toBeCalled: () => {} } })
let Group = () => null
let vi = { fn: () => {} }
let screen = { findAllByRole: () => {} }
-->

```jsx
test('renders three buttons separated by <br/> elements', async () => {
  console.error = vi.fn();

  render(
    <Group separator={<hr />}>
      <button>One</button>
      <button>Two</button>
      <button>Three</button>
    </Group>
  );

  expect(await screen.findAllByRole('button')).toHaveLength(
    3
  );
  expect(
    await screen.findAllByRole('separator')
  ).toHaveLength(2);
  expect(console.error).not.toBeCalled();
});
```

<!-- // Only running the code, no actual tets -->

The Arrange-Act-Assert pattern can be overkill for simple test cases like this one:

<!--
let test = (_, fn) => fn(), asList = () => {}
let expect = () => ({ toBe: () => {} })
-->

```js
test('converts an array to a string', () => {
  const list = ['long noodles', 'round pizza', 'wet ramen'];
  expect(asList(list)).toBe(
    'long noodles, round pizza and wet ramen'
  );
});
```

<!-- // Only running the code, no actual tets -->

However, it often improves the readability of longer test cases.

{#greppability}

## Write greppable code

Consider this example:

```jsx
function BookCover({
  title,
  type,
  width = 150,
  height = 194
}) {
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
const {getByRole} = RTL.render(<BookCover title="Tacos" type="taco-recipes" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/cover-taco-recipes.jpg')
-->

The problem here is the dynamic generation of the image filename.

Imagine we’re looking at the `/images/cover-washing-code.jpg` file, and we want to know where this file is used in the code. We try to search `cover-washing-code.jpg` or `cover-washing-code` and don’t find anything. We may assume that this file is unused and delete it. Naturally, this breaks our app.

Similar issues can happen in other cases: filenames, translation keys, CSS class names, function names, and module names, and so on.

There are two possible solutions to this.

When we know all possible values in advance, we can map them:

```jsx
const COVERS = {
  'washing-code': 'cover-washing-code.jpg',
  'taco-recipes': 'cover-taco-recipes.jpg'
};
function BookCover({
  title,
  type,
  width = 150,
  height = 194
}) {
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
const {getByRole} = RTL.render(<BookCover title="Tacos" type="taco-recipes" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/cover-taco-recipes.jpg')
-->

The `COVERS` map contains all possible filenames, so searching by a filename (`cover-washing-code.jpg` or `cover-taco-recipes`), will lead us to this component.

However, we don’t always know all the values in advance. In this example, we can put the files to a separate folder and use full filenames without extensions as identifiers:

```jsx
function BookCover({
  title,
  type,
  width = 150,
  height = 194
}) {
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
const {getByRole} = RTL.render(<BookCover title="Tacos" type="taco-recipes" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/covers/taco-recipes.jpg')
-->

Here, we can search either by a folder name (`/images/covers`) and find this component or by a filename (`washing-code`) and find all usages of this component.

I call such identifiers _greppable_, meaning we can search for them and find all places in the code where they are used. The name comes from the `grep` Unix command that finds a substring in a file.

I> This idea is also known as _the grep test_ and is greatly described in [Jamie Wong’s article with the same title](https://jamie-wong.com/2013/07/12/grep-test/).

We can also create a map using types:

```tsx
type Cover = 'washing-code' | 'taco-recipes';
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
const {getByRole} = RTL.render(<BookCover title="Tacos" type="taco-recipes" />);
expect(getByRole('img').src).toBe('http://localhost:3000/images/covers/taco-recipes.jpg')
-->

The benefit of this approach compared to a plain JavaScript object is that types won’t increase our bundle size and won’t be shipped to the client. This isn’t an issue for backend code, though.

Here are a few tips to improve _code greppability_:

- **Avoid concatenating identifiers**, write them out fully instead.
- **Avoid generic and ambiguous names** (like `processData()`) for things used in more than one module. Generic names are harder to find in the codebase because we’ll get many false positives — other things that have the same name but are unrelated to the thing we’re looking for.
- **Consider using a map**, with fully written names if they depend on a parameter.

TypeScript is especially helpful here: for example, we can find all places where a certain function or a constant is used, even if it’s imported under a different name. However, for many other cases, it’s still important to keep identifiers greppable: filenames, translation keys, CSS class names, and so on.

{#no-nih}

## Avoid not invented here syndrome

[Not invented here](https://en.wikipedia.org/wiki/Not_invented_here) syndrome (NIH) represents fear or a ban on using third-party solutions. It could stem from an internal developer’s need to prove themselves to the world or from an employer, typically a huge one, that has hired so many developers that there isn’t enough useful work for everyone.

Like any extreme, discarding all third-party libraries in our work is unhealthy. Many problems are generic enough that they don’t need to be rewritten by every developer on the planet. For many problems, there are popular open source libraries that are well tested and documented.

In this section, we focus on utility functions rather than on big frameworks because I see developers reinventing utility functions far more often than big frameworks.

### What’s wrong with in-house solutions

It’s common to see code like this:

<!-- let object = { o: 0 } -->

```js
if (object && Object.keys(object).length > 0) {
  // Object is not empty
}
```

<!-- expect($1).toBe(true) -->

This code is checking that the object isn’t empty, meaning it has at least one property. The code’s intention isn’t immediately clear, and it’s easy to forget the existence check, resulting in a runtime exception when the variable is `undefined`.

Having a function with a meaningful name that encapsulates all the required checks (including the ones we’ll come up with in the future) makes the intention of the code clearer:

<!--
let object = { o: 0 }
let isEmpty = _.isEmpty
-->

```js
if (isEmpty(object) === false) {
  // Object is not empty
}
```

<!-- expect($1).toBe(true) -->

This is a bit more readable. Now, the question is whether we should write this function ourselves or use one that someone else has already written.

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

However, we should first consider the potential problems of maintaining our own solution:

- **Poor tests and documentation,** or no documentation at all.
- **Not generic** enough and built to cover only one or a few use cases.
- **Many bugs** aren’t fixed because of a few users and a lack of tests.
- **No Google and Stack Overflow** to help us when something isn’t working.
- **Maintenance** takes time that we could otherwise spend adding new features or improving the product.
- **Difficult onboarding:** new developers our company hires need to learn how to use its in-house artisanal libraries, which is often hard because of poor documentation and discoverability.

Let’s compare our function with one from a popular library: [`isEmpty()` from Lodash](https://lodash.com/docs#isEmpty). It looks quite similar, but it supports objects, arrays, maps, and sets; it’s documented with examples and thoroughly tested. I wouldn’t want to deal with all these myself if an alternative already exists.

This example is a bit simplistic, and there are more benefits to using third-party libraries for more complex problems.

Here, I’d make sure that the `object` is always an object (never `undefined` or `null`, TypeScript can help with this), and then either use Lodash’s `isEmpty()` method if available, or inline the `Object.keys(object).length > 0` condition where I need it, since we don’t need to check object existence anymore.

<!-- let object = { o: 0 } -->

```js
if (Object.keys(object).length > 0) {
  // Object is not empty
}
```

<!-- expect($1).toBe(true) -->

### Why third-party libraries might be better

Some benefits of using a popular, well-established library:

- **Lots of information:** documentation, articles, books, Stack Overflow answers, and conference talks (even whole conferences dedicated to a single library).
- **Large community:** many plugins and additional libraries to use with it, and more.
- **Easier hiring and onboarding:** many developers will already be familiar with a library and have experience working with it.
- **Few bugs:** most bugs have already been found and fixed.
- **Regular updates** and bugfixes.

### What to keep in mind when using third-party libraries

Some things we need to keep in mind when using third-party libraries:

- **Hard to choose** a good library: there are too many, and often none are great.
- **May be abandoned:** open source libraries die every day for many reasons, for example, [maintainers’ burnout](https://sapegin.me/blog/open-source-no-more/).
- **Bundle size:** they may significantly increase the bundle size.
- **Interoperability:** some libraries may require specific versions of some other libraries, or have incompatibilities that are hard to track and fix.
- **Upgrade and maintenance:** we need to update dependencies regularly, and sometimes new versions have breaking changes. Some updates require days or months of work to coordinate and complete.
- **Security risks:** popular npm packages can be compromised, or popular frameworks can become targets of cyberattacks, and we may end up with a vulnerability in our app.

T> Use [Bundlephobia](https://bundlephobia.com/) to check the size of any npm package.

Another problem is when a library isn’t doing exactly what we want. In this case, we have several options:

- Submit a pull request to the library, which may take a lot of time to be reviewed, approved, merged, and released; or it may never be merged or even looked at.
- Fork the library or copy the code to our codebase and make the changes there; essentially converting a third-party library into an in-house one with most of the problems of the artisanal libraries mentioned above.
- Switch to another library that does what we want better, which may take a lot of time and won’t really improve the situation long-term.

### My approach to using third-party libraries

I don’t have any strict rules on whether to use third-party or in-house libraries, and the balance is important: both have their place in our work. For me, the choice depends on the complexity of the function I need, the type of the project (personal or not), my experience with a particular library that may do what I need, and so on.

I use [Lodash](https://lodash.com/) on most of my projects: it’s a hugely popular utility library for JavaScript that has lots of useful functions, and many developers have experience with it, so they’ll spend less time reading and understanding the code that uses these functions.

I tend to use _microlibraries_ on my personal projects, but it’s more of a personal preference than a rational choice, and my personal projects are usually small and simple.

A microlibrary is a tiny library, often a one-liner, that does one small thing and nothing else.

Some examples of microlibraries are:

- [clsx](https://github.com/lukeed/clsx): constructing `className` strings conditionally.
- [dlv](https://github.com/developit/dlv): safely get a dot-notated path within a nested object.
- [pretty-bytes](https://github.com/sindresorhus/pretty-bytes): convert bytes to a human-readable string.
- [rgb-hex](https://github.com/sindresorhus/rgb-hex): convert colors from RGB to HEX.
- [uid](https://github.com/lukeed/uid): generation of random IDs.

The benefits of microlibraries are:

- **Small size:** don’t increase the bundle size much.
- **Zero or few dependencies:** often don’t have dependencies.
- **Understandable:** one can read and understand the code in a few minutes.

The drawbacks of microlibraries are:

- **Hard to choose:** we need to choose, install and update each library separately.
- **Inconsistent:** Different libraries may have very different APIs.
- **Lack of documentation:** it’s less accessible because we need to look for each library separately.

It would likely take me less time to write many of these microlibraries myself than to choose a decent one on npm, but then I’d need to write tests, types, comments… and the idea of writing my own utility function doesn’t seem so attractive anymore.

I try to use microlibraries from a few developers I trust: mainly [Luke Edwards](https://www.npmjs.com/~lukeed) and [Sindre Sorhus](https://www.npmjs.com/~sindresorhus).

Another consideration is how difficult it is to introduce a new dependency on the project. For a small personal project, adding a new dependency is only an `npm install` away, but a large project may require many steps, like presenting a proposal to the team and obtaining security approval. The latter makes adding new dependencies less likely, which can be frustrating but also has benefits. It’s harder to keep track of all dependencies on a large project to make sure there are no vulnerabilities and no duplicated dependencies that do the same thing but are added by different developers.

For larger projects, it makes a lot of sense to use popular, well-established libraries, like React, styled-components, or Tailwind.

The best approach to using third-party libraries is probably this: the bigger the project and the more developers work on it, the more stable its dependencies should be, with a focus on popular and established libraries rather than microlibraries.

{#no-cargo}

## Avoid cargo cult programming

[Cargo cult programming](https://en.wikipedia.org/wiki/Cargo_cult_programming) happens when developers use a certain technique because they’ve seen it work somewhere else or have been told it’s the right way to do things. For example, it could be:

- A developer copies a decade-old answer from Stack Overflow with fallbacks for old browsers which they don’t need to support anymore.
- A team applies old “best practices” even if the initial problem they were solving is no longer relevant.
- A developer applies a team “standard” to a case that should be an exception, and inadvertently makes the code worse, not better.

Code isn’t black and white: nothing is always bad (except global variables) or always good (except autoformatting). We’re not working on an assembly line; we should understand why we write each line of code.

I> Steve McConnell has [a good article on an organizational side of cargo cult programming](https://stevemcconnell.com/articles/cargo-cult-software-engineering/).

Below are a few examples of cargo cult programming:

### Never write functions longer than…

Googling “how long should be my functions” reveals all kinds of random numbers, such as [one or two screenfuls](https://www.kernel.org/doc/html/v4.10/process/coding-style.html#functions) on an 80×24 characters terminal, [half-a-dozen lines](https://martinfowler.com/bliki/FunctionLength.html), 10 lines, 20 lines, 60 lines, and so on, and so forth.

I> We talk about measuring code dimensions in the [Lint your code](#linting) chapter.

Some programmers brag that all their functions are only one or two lines long. Some programmers say that you must create a new function every time you want to write a comment or add an empty line.

I think it’s the wrong problem to solve, and the size itself is rarely a problem. However, long functions often hide real issues, such as multiple responsibilities or deep nesting.

I> We talk about splitting code into functions in the [Divide and conquer, or merge and relax](#divide) chapter.

### Always comment your code

Programmers who believe that they must comment each (or at least most) line of their code are having a dangerous lifestyle, and not much better than those who _never_ write any comments.

I> We talk about commenting code in the [Avoid comments](#no-comments) chapter.

### Always use constants for magic numbers

Using constants instead of magic numbers is a great practice, but not all numbers are magic. Often, programmers make code less readable by following this principle without thinking and converting all literal values, numbers, and strings, into constants.

I> We talk more about constants and magic numbers in the [Naming is hard](#naming) chapter.

### Never repeat yourself

Don’t repeat yourself (DRY) principle is probably the most overrated idea in software development. Some programmers take it to an extreme, treating any code duplication as a cardinal sin.

I> We talk about the DRY principle and organizing code in the [Divide and conquer, or merge and relax](#divide) chapter.

### Always use only one return statement in a function

There’s this idea that functions should have only one `return` statement. I’ve even seen it called a law: _the single return law_. It comes from a very old principle _single entry, single exit_ (SESE) that [comes from the days of FORTRAN and COBOL](https://softwareengineering.stackexchange.com/questions/118703/where-did-the-notion-of-one-return-only-come-from/118793#118793) and made sense back then. Now it’s unnecessary, and often limiting yourself to a single `return` statement reduces the readability.

However, as it often happens, we upgraded the technology, but kept using rules and best practices of the old tech.

I> We talk about early returns, an alternative to single return, in the [Early returns](#early-returns) section of the _Avoid conditions_ chapter.

### 100% code coverage

Managers often demand a certain number of lines of code covered by automated tests: it could be anywhere from 70% to even 100%. This value is called _code coverage_.

I> I used to use _code coverage_ and _test coverage_ interchangeably. However, they are different terms: code coverage measures the proportion of lines of code executed during a test run, while test coverage measures how well tests cover the functionality requirements.

Automated tests are essential for any serious project; however, testing every line of code isn’t practical or useful. After reaching maybe 70%, increasing code coverage gets harder and harder, it’s often impossible to go higher than a certain number by writing meaningful tests. Test quality is getting worse, and developers waste lots of time writing and fixing tests…

High code coverage gives people, especially managers, a false sense of security; faking the coverage number, intentionally or not, isn’t that difficult. For example, we can write a test like this:

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

This test alone can give us 60-70% code coverage without a single assertion or actually testing any functionality, because code coverage measures the number of lines _executed_ from tests but doesn’t measure the quality of the tests.

T> This test case isn’t entirely pointless and is better than no tests at all. At least it makes sure that the page renders without exceptions. Artem Zakharchenko [wrote a great article](https://www.epicweb.dev/implicit-assertions) about such tests that are called _implicit assertions_.

Usually, if an organization uses a certain metric to measure performance, employees will optimize their work to increase this metric, often at the expense of the quality of their work.

Additionally, not all types of tests are equally useful for every project. For example, for frontend, integration tests are usually more useful than unit tests, so requiring high unit code coverage would be unproductive.

I> I have a big series of articles on my blog on [frontend testing best practices](https://sapegin.me/blog/react-testing-1-best-practices/).

### Never say never

Never listen when someone says you should never do that or always do this, without any exceptions. The answer to most software development questions is “it depends”, and such generalizations often do more harm than good.

## Debug code with emojis

Using `console.log()` is my favorite way of debugging JavaScript and TypeScript code. I’ve tried using fancier techniques, like a debugger, but I always come back to `console.log()` because it’s the simplest, and it works for me.

I do this by adding a separate log for each variable I want to track, like so:

<!--
let buffer = ''
let console = {log: (a, b) => buffer = `${a} ${b}` }
-->

```js
function thereBeBugs(something) {
  console.log('🍕 something', something);
}
```

<!--
thereBeBugs('tacocat')
expect(buffer).toBe('🍕 something tacocat')
-->

I usually add a different emoji at the beginning, making it easier to differentiate logs in the browser console.

T> I created a Visual Studio Code extension to add such `console.log`s using a hotkey: [Emoji Console Log](https://marketplace.visualstudio.com/items?itemName=sapegin.emoji-console-log).

I always thought of console-logging as a lazy way of debugging, frowned upon by old-school programmers. However, Brian Kernighan and Rob Pike recommend the same approach in their book, _The Practice of Programming_, published in 1999:

> As a personal choice, we tend not to use debuggers beyond getting a stack trace or the value of a variable or two. One reason is that it is easy to get lost in details of complicated data structures and control flow; we find stepping through a program less productive than thinking harder and adding output statements and self-checking code at critical places. Clicking over statements takes longer than scanning the output of judiciously-placed displays. It takes less time to decide where to put print statements than to single-step to the critical section of code, even assuming we know where that is. More important, debugging statements stay with the program; debugger sessions are transient.

{#rubberducking}

## Go for a walk or talk to a rubber duck

A similar situation has happened to me many times: I spend hours debugging an especially hairy issue; I stop working, switch to another task, go for a walk, or head home (if I’m in the office) — and suddenly the solution appears in my mind.

When we spend too much time on a single task, our brains get fuzzy and stop seeing what would be obvious after a break.

_Rubberducking_, or [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging) is another approach. The idea is to explain a problem in detail to someone else: a friend, a colleague, or even a rubber duck. The recipient isn’t important and is only supposed to listen. Often, the act of explaining the issue helps us to see where the problem is and come up with a solution.

![Rubberducking](images/rubberducking.jpg)

This is similar to how writing an article on a certain topic helps us to spot any gaps in our understanding of this topic and forces us to learn it more deeply. This is my favorite way of learning new things.
