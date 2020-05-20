## Don’t try to predict the future

Requirements are constantly changing, the business is constantly trying to make more money. Sometimes by improving user experience and making the app better, sometimes by exploiting _human psychology?_ and making app worse. In both cases we need to change the code. People have invented agile software development to deal with that: it’s better to develop software in small iterations than to spend month on writing detailed specs and then implementing them.

But developers often try to think too far in the future: “_they_ will want to add pagination to product list, let’s add support now to save time later.” But then _they_ want infinite scrolling and you end up removing most of your pagination code.

It’s called Premature abstraction or premature generalisation (speculative generality?). It feels like you’re saving time for future self by making your code more generic, but that’s what will often prevent you from implementing real future requirements easily. You end up writing and maintaining code that will never be used or code that you’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. It will be easier to review and test now, and to adapt to new requirements in the future.

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make UI easy to change and move around.

TODO: YAGNI and KISS
