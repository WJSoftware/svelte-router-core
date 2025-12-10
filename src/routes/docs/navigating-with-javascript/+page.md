---
title: Navigating With JavaScript
description: Programmatic navigation with JavaScript functions for dynamic routing in Svelte applications
---

Navigation is also very possible in JavaScript. There are 4 helper functions that can be used to calculate both HREFs and state objects correctly, and the location global object contains 2 functions that actually push URLs to the environment’s navigation history.

To actually navigate, you can choose to use `navigate()` or `goTo()`:

```typescript
import { location } from '@svelte-router/core';

location.navigate('/some/new/path?page=1' /*, { options } */);
location.goTo('/some/new/path?page=1' /*, { options } */);
```

While both options ultimately perform a URL change via the **History API**, they work very differently.

The one function we should be using the most is `location.navigate()` because this one takes into account the existence of routing universes. Therefore, the final URL built internally by this function will ensure that other routing universes are not affected. Developers can specify the routing universe the final URL is for via the function’s `hash` option. If this option is not provided (or no options at all like in the example), it will infer the hash value according to the routing library’s `defaultHash` setting.

On the other hand, `location.goTo()` doesn’t care at all about routing universes. It just pushes via the **History API** whatever we give to it.

In the context of the previous example, let’s create a Results table that shows the end result of the functions:

| Function   | Routing Universe (hash) | Resulting URL                                         |
| ---------- | ----------------------- | ----------------------------------------------------- |
| `navigate` | `false`                 | `https://example.com/some/new/path?page=1`            |
| `navigate` | `true`                  | `https://example.com?page=1#/some/new/path`           |
| `navigate` | `'namedPath'`           | `https://example.com?page=1#namedPath=/some/new/path` |
| `goTo`     | `false`                 | `https://example.com/some/new/path?page=1`            |
| `goTo`     | `true`                  | `https://example.com/some/new/path?page=1`            |
| `goTo`     | `'namedPath'`           | `https://example.com/some/new/path?page=1`            |

As seen in the table, `goTo()` just doesn’t care! It doesn’t even define the `hash` option at all. However, its `navigate()` sibling is the smart one of the family, correctly moving the path to the appropriate location.

The only “intelligence” `goTo()` offers is query string preservation via the `preserveQuery` option.

The `options` parameter for both functions allows state data. The same story seen above is the story about state data: The smart `navigate()` function correctly places state data in a way that doesn’t destroy state data of other routing universes, while the dumb `goto()` function won’t care.

:::tip[TypeScript Will Help a Bit]
In the case of state data for `goTo()`, `options.state` is typed as `State`, so you at least get TypeScript errors if you attempt to pass state data that is not conformant to what this routing library expects.
:::

## Traversing History

If the user uses the environment’s _Back_ and _Forward_ buttons, the global `location` object will know about it and will stay in sync. In code, this is equivalent to calling `window.history.back()` and and `window.history.forward()`. This should be OK… **most of the time**.

There is a small chance that using these methods directly from the window’s `history` object might become the source of problems. As a best practice, always use the methods in the global `location` object provided by the library: `location.back()`, `location.forward()` and `location.go()`.

## HREF Precalculation

If we need to trigger navigation programmatically, perhaps because of the click of a button, we can use the techniques shown above. Most of the time this is all that we will ever need.

In more rare cases, though, we might want to know ahead of time the resulting URL (without actually triggering the navigation). This is the case of this library’s `Link` component: `Link` components render an HTML anchor element with the final, calculated URL. It means that when users hover their mouse over the anchor element, the browser shows the actual URL the user will be navigating to.

How can this be achieved in user code? With the use of the `calculateHref()` function.

### `calculateHref`

This function encapsulates the smarts of `location.navigate()`. It queries for the necessary information and spits out the built HREF, taking everything into account: Routing universe, potential hash preservation (only available for the path routing universe) and query string preservation.

:::note[This Function Reads Reactive Data!]
The `calculateHref()` function reads reactive data from the global location object. Therefore, as a best practice, any uses of this function should be inside `$derived` or `$effect` or directly in component templates.

If you do this, your “predicted” HREF will always be up to date.
:::

Once you have obtained your HREF, you can fear nothing and use `location.goTo()` instead of `location.navigate()`. Navigation should work perfectly while avoiding a double calculation of the HREF. This is one of the main use cases for `location.goTo()`: Pre-calculated HREFs.

### `calculateState`

This is a sibling to `calculateHref()` and it is used to calculate a state object that is conformant to the `State` TypeScript type. If we ever need to pass state while navigating using `location.goTo()`, we should definitely use this function to pre-calculate the correct state.

Usage of these functions is simple:

```typescript
// Inside a component, for example:
import {
    calculateHref,
    calculateState,
    location,
    type Hash
} from '@svelte-router/core';

type Props = {
    keyProp: string;
    hash: Hash;
};

let { keyProp, hash }: Props = $props();

// Use href in, say, the component template.  It will be reactive.
let href = $derived(calculateHref({ hash, preserveQuery: 'debug' }, inferPath(keyProp)));

function handleClick() {
    const finalState = calculateState(hash, someStateData);
    location.goTo(href, { state: finalState });
}
```

More or less, this example looks similar to what the `Link` component does: Pre-calculate the URL in a `$derived` for component template purposes, then use the dumb `location.goTo()` to perform the action without incurring in the extra cost of calculating the HREF, which has already happened.

The one “catch” here is to know the routing universe we’re supposed to use. This example assumes the routing universe is set elsewhere and communicated via a property: `hash`. Carrying this information is best if we’re creating a reusable component that could be mounted multiple times in different routing universes, which includes the case of micro-frontends.

However, if we’re just creating a component, and we are relying entirely on the library’s implicit mode (path routing by default), then we can rely on the overloads that don’t take options and let the functions discover the implicit routing universe they should use for calculations.

### Rules Around the Value of HREFs

Not every HREF that a normal HTML anchor link accepts is accepted by `calculateHref()` (and the functionality that use it like the `Link` component and `location.navigate()`). The following rules should keep us out of trouble:

1. **Never add protocol, host or scheme**. If we needed this, we would be creating an HREF to an external resource. Don’t use `calculateHref()` (or `Link` components) for external resource links.
2. **Hash routing doesn’t allow HREFs with hashes**. Counter-intuitive as this may sound, we must not specify hash values for hash routing. Specify the hash value as if it were a path value (i. e. `/this/is/the/path/in/hash`).
3. **In all instances, query strings are allowed**. If we specify query strings, they will replace the current query string values (and if we don’t, the current query string is lost), unless the `preserveQuery` option holds a value to actively preserve query string values. In this case, the preserved query string values merge with the query string values found in the provided HREF’s.

:::warning[Rule 2 Throws!]
If for any reason we incur in a violation of the second rule above, an exception will be thrown and the component will not render. We should be able to counter this using `<svelte:boundary>`.
:::

Interestingly enough, rule #2 has an exception, as odd-looking as its rule: Hashes are allowed for HREF’s in the path routing universe. This exception exists so we can create links that jump-start hash-powered routing universes. We can also destroy hash-powered routing universes if we do this incorrectly (or on purpose), so we must be mindful when building HREFs.

### The Algorithm behind `calculateHref`

In case developers need to fully understand what happens inside this crucial function, here it is.

The first thing that happens: All given HREFs are allowed to carry path, query string and hashes, at least in principle. Each one of these is dissected with an internal function and each of the mentioned pieces are collected separately.

Now comes the enforcement of an important rule: If a hash was specified in any of the HREF’s and the routing universe is not the path routing universe, then the function will throw: One cannot specify hashes unless the HREF being constructed is for the path routing universe.

Then comes the joining of search parameters (query string): All search parameters from all dissected HREFs are joined together. This merged result is then processed further according to the value of the `preserveQuery` option given to the function. Since the option can be a Boolean, a string, or an array of strings, the merging logic does the needful to locate the appropriate data to merge.

The next step is to calculate the path, whose actual position in the final HREF has yet to be decided. The “final path” is the result of joining all paths from all provided HREF’s, and then the hash option is checked for its type: If it is for multi hash routing, then the path is built preserving the routes of other routing universes, but if not, then the path becomes the joined paths, without extra calculations or additions.

The final piece is calculating a hash for the case of path routing: If any of the provided HREFs carried a hash fragment, then that hash is used. If not, the current environment’s URL’s hash fragment is used so long the `preserveHash` option is `true`. For the cases of hash routing (single or multi), the calculated path becomes the hash content.

:::note[Only the First Hash from the HREF’s Is Used]
Only the first hash of all hashes provided in the HREF’s is used. The algorithm doesn’t make the assumption that a hash value is a path, and therefore no concatenating or joining operation on input hashes is made. The first hash stays, and all others (if any) are discarded.
:::

Now everything has been computed, and it is time to assemble the final HREF: For path routing (`hash === false`), the HREF’s path will be set with the calculated joined path, and for all other cases, empty; then the search params are added (if any), and finally the hash, if the previous calculations produced one.

## Other Helper Functions

With the introduction of the URL redirection feature, two new helper functions became available: `buildHref()` and `calculateMultiHashFragement()`. The former is very specific to redirection, but the latter can be used to calculate HREFs for HTML anchor elements that only contain a hash fragment in their href property.

These two functions are explained in detail in the [Redirecting](/docs/redirecting) topic.
