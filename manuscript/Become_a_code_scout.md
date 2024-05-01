# Become a code scout

The _campsite rule_ (previously known as _boy scout rule_) states that we should leave the campground cleaner than we found it. For example, if someone else has left garbage, we should take it with us.

Same in programming. For example, we’re done with a task, running the linter before committing the changes, and notice that there are some warnings but not in the lines we’ve written or even changed. If it’s not a lot of work and won’t make the diff too big, we should fix these warnings, and make code cleaner for the next person who’s going to work with it.

I don’t fully agree with the idea that a particular code change (pull request) shouldn’t have any refactorings or improvements. If the fix is tiny, why not do it right away instead of postponing it for a separate pull request which likely will never happen. It does make code review slightly harder but often refactorings are easier to understand in the context of a change that caused them. Isolated refactorings often feel like refactorings for the sake of refactoring, which isn’t a good thing to do, and definitely not a good thing to spend our colleagues’ time in code reviews.

However, if the refactoring is really big, it’s better to postpone it or extract to a separate pull request if once we see that it makes the initial pull request too large (which I often do). If there’s no time to do it now, making a ticket explaining the improvement is a good idea.

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

(We talk more about parallel code in [Don’t make me think](#dont-make-me-think) chapter.)

Some people [even believe](https://www.reddit.com/r/programming/comments/2tjoc8/the_boy_scout_rule_of_coding/) that we shouldn’t touch what’s working and refactoring has no business value for the product but I fiercely disagree. Our job is not only do what we’re told to do by the businessfolks but also to keep our software easy to change so we can quickly react to new business requirements. This is only possible if we care about maintanability, don’t let the tech debt pile up.
