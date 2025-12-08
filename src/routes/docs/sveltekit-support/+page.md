---
title: Sveltekit Support
description: Learn how Svelte Router can be used with Sveltekit.
---

[GitHub: @svelte-router/kit](https://github.com/WJSoftware/svelte-router-kit)

This routing library, with the assistance of the `@svelte-router/kit` package, supports **Sveltekit** projects, but only does so for hash routing. It supports both single and multi hash routing.

To use it, install it:

```bash
npm install @svelte-router/kit
```

Then use its `init()` function instead of the stock `init()` from the core package. In **Sveltekit** projects, the best place would be the top layout component:

```svelte
<script lang="ts">
    import { init } from '@svelte-router/kit';

    init();
</script>

// +layout.svelte
```

:::tip[This Function Auto-Cleans Up]
In **Sveltekit**, there’s a NodeJS/Deno/Bun server pre-calculating pages and does so without remembering previous renders. This means that layout is calculated every time the server serves a page. This means that, on every SSR render operation, `init()` is run. If we initialize without cleaning up, an error is thrown.

To simplify things for end users, the `init()` function of `@svelte-router/kit` auto-cleans up the previous initialization, so end users don’t have to remember this. This comes with a tiny price on performance.
:::

Since path routing is disallowed, never use the value `false` for the `hash` property on any component. If you do it, a runtime error will be thrown telling you about it.

The default hash value applied during this initialization is `true`. This means that components that don’t explicitly set a value of the `hash` property will route in single hash mode. If you specified a `hashMode` option of `'multi'`, then you must specify a string as default hash, or make sure all Svelte components get their `hash` property specified. Otherwise, an error will occur.

If all of this sounds like nonsense to you, no worries. Forget for now that you read this, continue learning about the library, and once you know about _library modes_, _routing modes_ (a. k. a. routing universes) and a couple other concepts, come back. This will make sense.

## History State Details

When `@svelte-router/kit` initializes, the current value of the history state is read. If it is non-conformant (doesn’t satisfy the `State` TypeScript type defined by base `@svelte-router/core` package), it will replace it. How? It will take whatever value it found as state and assign it to the path routing universe, even though path routing is disallowed.

In other words, after the router initializes, any state value that may have been saved will now be available as `page.state.path`.

:::caution[Navigation Event!]
This state operation is done by executing a call to **Sveltekit**’s `goto()` function, which triggers a navigation event! Therefore, make sure to account for this “extra” event, just in case.
:::

## Router Navigation and Sveltekit

The `@svelte-router/kit` package uses `goto()` from the `$app/navigation` **Sveltekit** module. Routes will trigger its use, and therefore you should be able to use things like the `beforeNavigate()` function from `$app/navigation` to detect route activation.

The extension package also expands the base package’s `Location` interface to add two new navigation methods. These new methods will use **Sveltekit**’s `goto()` function, and therefore allows you to pass any of the function’s options:

```typescript
import { location } from "@svelte-router/core";

location.kitNavigate('/some/path', {
  replaceState: true,
  noScroll: true,
  keepFocus: true,
  invalidateAll: false,
  invalidate: (url) => { ... },
  state: { my: 'state' },
  preserveQuery: 'debug',
  hash: 'my-path',
});

location.kitGoTo('/some/path', {
  replaceState: true,
  noScroll: true,
  keepFocus: true,
  invalidateAll: false,
  invalidate: (url) => { ... },
  state: { hash: { single: { my: 'state' } } },
  preserveQuery: 'debug',
});
```

Just like their counterparts in the base `@svelte-router/core` package, the `kitNavigate()` function is the smart one that uses the value of the `hash` option to determine where in the hash the HREF goes and where in the state object the provided `state` value goes, while `kitGoTo()` is the dumb one that doesn’t bother at all and assumes the developer knows what will happen.

Just like `Location.goTo()`, `Location.kitGoTo()`’s only perk is the ability to preserve query string values. If you don’t need this perk, you might as well use **Sveltekit**’s `goto()` function directly.

### The Link Component

The base `@svelte-router/core` package comes with a `Link` component. This is really needed for path routing only, as regular HTML anchor elements can be used for hash routing. This is also true for `@svelte-router/kit`: Use HTML anchor elements if you wish.

The advantage the `Link` component has over HTML anchor elements is history state handling. `Link` components can push state along with URL’s; HTML anchor elements cannot.

The `Link` component also encapsulates smart HREF calculations for all routing universes. It will be one less thing to think about, if you use it.

However, this `Link` component cannot take advantage of the extra navigation options that `goto()` offers. It is just unaware that they exist. If you need this extra functionality, there are 2 options:

1. Use regular HTML anchor elements and pass data-sveltekit- attributes (as per documentation)
2. Create a Sveltekit-specific `Link` component

:::important[Contribute a Link Component]
Hey, if you were cornered to create a `Link` component with `goto()` capabilities, consider sharing it with the world! Open an issue in GitHub, and when given the green light, open a pull request.
:::

### The `LinkContext` Component

Similar story: Works just fine but cannot configure any of **Sveltekit**’s `goto()` extra capabilities.

## Fallback Content

In SSR, `Route` components don’t register themselves with the parent router because registration is done inside an `$effect.pre` context, and effects don’t run on the server. This means that any fallback content specified with the `Fallback` component from the base `@svelte-router/core` library will automatically be server-rendered! This is not a good thing as they will cause flashes of unwanted content.

The `@svelte-router/kit` extension library provides the `KitFallback` component that guards against this behavior. Always use `KitFallback` for fallback content in **Sveltekit** projects.
