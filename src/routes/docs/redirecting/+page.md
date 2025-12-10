---
title: Redirecting
description: Implement URL redirections and backwards compatibility with automatic route migration for better UX
---

Redirecting is the act of moving a user out of a particular URL and into a different/new URL. This is normally done whenever, over the course of time, an application abandons one URL in favor of another for any reason. Most often, the addition of features and refinement process of an application drives URL changes.

## Why Redirect?

Users tend to share URLs in social media and other ways and can even store/save the URLs for future reference, for example, in their browser’s **Favorites** bar.

In order to improve the users’ experience, an application can gracefully detect access to a deprecated URL and automatically route the user to the new URL. Generally speaking, keeping URLs alive is _good business_.

## Redirecting

This is a relatively simple operation carried by the `Redirector` class. Below is a basic example:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";

  let redirector = new Redirector(); // Attaches to the default routing universe.
  redirector.redirections.push({
    path: '/users/:id',
    href: (rp) => `/admin/users/${rp?.id}`,
  });
  ...
</script>
```

In the example, we:

1. Create a redirector object.
2. Define one redirection with a `path` and an `href`.

`path` is used to match the current URL, just like routes do, and `href` is used to navigate whenever the path matches the current environment’s location URL.

More redirections can be defined but note that in the eventual case that more than one match, only the first one takes effect. The definitions are read and tested in the order they are defined in the array. Have this in mind.

:::tip[How Many Redirector Objects Do I Need?]
Usually, just one per routing universe, but nothing prevents the use of more redirectors per routing universe. Both ways should work fine.
:::

## Redirecting In Detail

Redirection uses the same route-matching algorithm used by routers on their routes. This enables redirection the ability to create paths with parameters, the `rest` parameter, or even custom regular expressions. Furthermore, the `and` property present in the `Route` component is also present and available in route redirections:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";

  let redirector = new Redirector(); // Attaches to the default routing universe.
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => `/admin/users/${rp?.id}`,
  });
  ...
</script>
```

This is the first example with the added `and` predicate that ensures the user is an administrator.

### Navigation Options

As you may have inferred already, the process of redirecting is a two-step process. We have already covered the first step: _Route matching_. The second step is _Navigation_.

This library provides `location.navigate()` and `location.goTo()` to navigate, each with their own set of options. Redirection navigates using either of these.

By default, navigation is done using `location.navigate()` and replacing the URL. Redirection definitions can specify their desire to navigate using `location.goTo()` by adding `goTo: true` to its definition.

The actual navigation options can be specified as well as part of the redirection definition using the `options` property. This option will accept `goTo()`’s options if `goTo: true` is present, or will accept `navigate()`’s options otherwise:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";

  let redirector = new Redirector(); // Attaches to the default routing universe.
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => `/admin/users/${rp?.id}`,
    options: {
      preserveQuery: true,
      preserveHash, // Assuming the default routing universe is path routing.
    },
  });
  ...
</script>
```

This is the same example, with options for the `navigate()` function. The example preserves any hash fragment. This is a common situation when using both path and hash routing: We want to preserve the hash (any hash routing universe).

## Cross-Universe Redirection

It is also possible to perform cross-universe redirection. It is very simple, actually. We only need to specify a destination hash value as part of the options:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";

  let redirector = new Redirector(false);
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => `/admin/users/${rp?.id}`,
    options: {
      preserveQuery: true,
      hash: true,
    },
  });
  ...
</script>
```

This version of our example has explicitly stated the redirector will be monitoring the path routing universe by specifying `false` as hash value in the class constructor. This is optional, by the way. One can still rely on the library’s default hash value, but this way feels safer when doing cross-universe redirection.

The destination hash goes in the `options` property, as seen in the example. The example has specified `hash: true`, meaning the destination routing universe is the single hash routing universe (which requires to have initialized the library in single hash mode).

There’s a catch, though! Let’s see it in the context of this example.

What are our expectations in this example? We want a URL like `https://example.com/users/123` to be redirected to `https://example.com/#/admin/users/123`. But does this happen? Not exactly, no.

The final URL after redirection will be `https://example.com/users/123#/admin/users/123`.

The gotcha is: There’s no cleanup of the source path in the path routing universe. Generally speaking, the source routing universe will keep the matching path.

:::caution[Source Universe URL Cleanup Is Not Automatic]
At present time, there is just no good way to provide automatic cleanup of the URL in the source routing universe.

Raise a discussion in GitHub about this topic if you feel this to be an important missing feature. I have some idea on how to achieve it, but others might have better ideas.
:::

So, what to do? How can we achieve the desired, final URL? The recommendation is to switch to `goTo` and calculate the final, **full HREF** ourselves:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";

  let redirector = new Redirector(false);
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => `/#/admin/users/${rp?.id}`,
    goTo: true,
  });
  ...
</script>
```

We have learned that `location.goTo()` doesn’t care about routing universes. This plays to our advantage in this case. We are now returning an HREF value that contains both a path and a hash value. Since `location.goTo()` accepts this mix happily (`location.navigate()` does not), we get our desired, final URL.

### More Complex Solutions

In the previous example, it was easy for us to “clean” the URL telling the redirector to use `location.goTo()` plus returning a full HREF that contained both the URL’s pathname and hash fragment. But what about multi-hash routing? How about micro-frontend scenarios where there are foreign named hash universes lying around?

For these more complex cases, we can use some useful helper functions. The three most relevant are `calculateHref()`, `buildHref()` and `calculateMultiHashFragment()`.

The routing-universe-aware `calculateHref()` function takes any number of paths, joins them, and then outputs a full HREF that will contain the joined paths set in the appropriate place according to the desired routing universe (`hash` option), plus all other paths for any other routing universes, untouched. Use this function as best practice whenever possible. This function, however and by itself, doesn’t clean up the source routing universe path. If it did, it would not be fulfilling its primary job of creating URL’s that properly preserve other routing universe paths.

This is where `buildHref()` comes into play. This one is _routing-universe unaware_ and can piece an HREF together from 2 other HREF’s. Its primary use case is to give it 2 full HREF’s created with `calculateHref()`: One for the path routing universe, and one for the hash (or multi-hash) routing universe.

To illustrate, we could write the simple example as:

```svelte
<script lang="ts">
  import { Redirector, buildHref, calculateHref } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";
  import { untrack } from "svelte";

  let redirector = new Redirector(false);
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => {
      const href = untrack(() => buildHref(
        calculateHref({ hash: false }, "/"), // Path routing
        calculateHref({ hash: true }, '/admin/users', rp?.id.toString()), // Hash routing
      ));
      return href;
    },
    goTo: true,
  });
  ...
</script>
```

Both inputs to `buildHref()` are full HREF’s. The first one preserves all hash routing universes, but we need to touch one of those (in the example, we’re working in single hash routing mode, so only one hash universe exists). This by itself is not good enough.

The second HREF calculated is for the hash routing universe, so this one preserves the path routing universe’s path, which, just like the first HREF, is no good by itself. We want to clean the path routing universe’s path.

Calculating the two URL’s and asking `buildHref()` to take the relevant pieces from each calculation achieves our goal: Reset path routing to `/` while routing the hash universe to `/admin/users/123`.

:::info[Search Parameters Are Preserved by buildHref]
This function will automatically merge search parameters from the input HREF’s, and can even preserve the ones in the current environment’s location URL, just like other navigation functionality.
:::

Combining `buildHref()` with `calculateHref()` and `location.goTo()` is the most robust way to perform cross-universe redirection when the path routing universe is involved.

:::note[All Read Signals During HREF Calculations Are Untracked]
Search parameter preservation reads an artificial signal inside the Svelte-provided `SvelteURLSearchParams` class that is blindly updated even when search params don’t change. This causes an infinite loop of redirection effects. A [GitHub issue](https://github.com/sveltejs/svelte/issues/17218) has been raised about this. Please upvote it to draw attention to it.

Because of this problem, any signals read during the action of redirecting are being untracked at the library level.

This should not be a problem, though: The redirection effect shouldn’t be triggering again just because a reactive signal used to, for example, build an HREF, has changed. This kind of scenario seems highly unlikely in a real-world application.
:::

Now, the third function: `calculateMultiHashFragment()`. This function is our cleanup helper function whenever we’re routing from one named hash routing universe to another named hash routing universe. This function preserves any existing hash routing universes and can add new ones or remove existing ones by setting empty strings as paths.

Assuming the current environment’s URL is `https://example.com/some/where#p1=/deprecated/path`, and we want it redirected so the final URL becomes `http://example.com/some/where#p-new=/new/path`, we would do:

```svelte
<script lang="ts">
  import { Redirector, calculateMultiHashFragment } from "@svelte-router/core";
  import { currentUser } from "$lib/auth/current-user.js";

  let redirector = new Redirector('p1');
  redirector.redirections.push({
    path: '/users/:id',
    and: () => currentUser.isAdmin(),
    href: (rp) => {
      const fragment = () => calculateMultiHashFragment({
        p1: '', // Cleanup.  Empty strings remove the named path.
        'p-new': '/new/path', // Redirection path
      );
      return `#${fragment}`;
    },
    goTo: true,
    options: { hash: 'p-new' },
  });
  ...
</script>
```

Remember that using named hash paths require library initialization in **multi hash mode**.

The `calculateMultiHashFragment()` function, generally speaking, calculates a hash fragment that preserves all currently existing named hash routing universes, plus it modifies/adds/removes the ones specified in the POJO object we pass as only argument.

Once we have our desired hash fragment, we build an HREF (consisting only of the hash fragment) that is given internally to `location.goTo()` (since we specify `goTo: true`), achieving our desired final URL.

## Redirector Options

The `Redirector` class has 2 constructors, and both accept an options object. Currently, the `RedirectorOptions` type only defines one option: `replace`. If not specified, it will default to `true`. Yes, individual redirections can specify their own `replace` option that supersedes this default and any constructor-level option specified.

The options object can be passed as first argument if we don’t desire or need to specify a hash for the redirector object (therefore relying on the default hash specified during initialization) or can be passed as second argument if we do need or want to specify a hash, which is done as first argument to the constructor:

```typescript
const redirector = new Redirector({ replace: false }); // Uses defaultHash.
const redirector = new Redirector('p4', { replace: false }); // Explicit hash.
const redirector = new Redirector(); // Uses defaultHash, relies on default options.
```

When passing no arguments, we’re really using the 2-parameter constructor, whose parameters are all optional.
