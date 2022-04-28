### Not invented here syndrome

Not invented here syndrome (NIH) represents fear or a ban of using third-party solutions. It could come from an internal developer’s need to prove themselves to the world, or from an employer, usually a huge one, that hired so many developers that there’s not enough actually useful work for everyone.

Like any extreme, discarding any third-party libraries in our work could be unhealthy. Many problems are generic enough and don’t need to be rewritten by every developer again and again. For many problems, there are popular open source libraries, that are well tested and documented.

In this chapter, I’ll focus on utility functions rather than on big frameworks, because I see developers reinventing utility functions far more often than big frameworks.

#### What’s wrong with in-house solutions

The worst case is inlining utility functions like so:

```js
if (object && Object.keys(object).length > 0) {
}
```

This code is checking that the object isn’t empty, meaning it has at least one property. It’s hard to see the code intention immediately and it’s hard to remember to do the existence check to avoid runtime exceptions when the variable is `undefined`.

Having a function with a meaningful name that encapsulates all the required checks (including the ones we’ll come up with in the future) makes the intention of the code more clear:

```js
if (!isEmpy(object)) {
}
```

This is already much better. Now, the question is whether we write this function ourselves or we use one that somebody has written already.

It might be tempting to quickly write our own function or copypaste the code from Stack Overflow — what’s here to write anyway? — but we should first consider potential problems of maintaining our own solution:

- Often poor tests and documentation, or none at all.
- Many bugs aren’t fixed because of a low number of users.
- No Google and Stack Overflow to help us when something isn’t working.
- Maintenance may take a lot of time.
- New developers, our company hires, need to learn its in-house artisanal libraries, which is often hard because of poor documentation and discoverability.

#### Why third-party libraries might be better

When using a good popular library:

- We have access to documentation, updates, and bugfixes.
- New developers, joining the company, may already have experience with the library.
- Fixing an obscure error message might be one Google search away.

#### What to keep in mind when using third-party libraries

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

#### My approach to using third-party libraries

I don’t have any strict rules on using third-party libraries versus in-house ones, and I believe the balance is important here, and both have their place in our work. For me, the choice depends on the complexity of the function I need, the type of the project (personal or not), my experience with a particular library that may do what I need, and so on.

I use [Lodash](https://lodash.com/) on most of my web apps: it’s a hugely popular utility library for JavaScript that has lots of useful functions, and many developers have experience with it, so they’ll spend less time reading and understanding the code that uses these functions.

I tend to use microlibraries on my personal projects but it’s more of a taste choice than a rational one, and my personal projects are pretty small and simple.

Microlibrary is a tiny, often a oneliner, library that does one small task, and nothing else. The good thing about microlibraries — they don’t increase the bundle size much, the bad thing about them — we need to choose, install and update each library separately. Also, different libraries may have very different APIs and the documentation is less accessible (because we need to look for each library separately).

I try to choose microlibraries from a few developers I trust: mainly [Luke Edwards](https://www.npmjs.com/~lukeed) and [Sindre Sorhus](https://www.npmjs.com/~sindresorhus).

Another consideration is how difficult it is to introduce a new dependency on the project. For a small personal project, adding a new dependency is only `npm install something` but a large project may require many steps like presenting a proposal to the team and security approval. The latter makes adding new dependencies less likely, which might be frustrating but has some benefits too. It’s harder to keep track of all dependencies on a large project, to make sure there are no vulnerabilities and no multiple dependencies that do the same thing but are added by different developers.

Probably the best approach to using third-party libraries should be this: the bigger the project and the more developers work on it, the more stable should be its dependencies, with a focus on popular and established libraries rather than on microlibraries.
