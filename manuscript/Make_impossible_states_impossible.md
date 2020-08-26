### Make impossible states impossible

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
