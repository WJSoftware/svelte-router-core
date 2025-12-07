---
title: Routing With Components
---

This is the preferred way because it is the more natural and descriptive one to us, humans. What we do is add `Router` and `Route` components throughout our own component hierarchy in order to achieve the “pages” effect we desire.

The following is a basic routing example. This exact same code works in the path or hash routing universes. It will be path routing if you initialized the library with `defaultHash: false` (which is the library’s default value), or single hash routing if you used `defaultHash: true`, or it will be whatever named hash path you set if you set a string value (say, `defaultHash: 'somePath'`). This way of writing code is convenient to humans because we don’t have to keep specifying the value of the `hash` property on every component we write (`Router`, `Route`, `Link`, `Fallback` or `RouterTrace`), but it makes the code dependent on the default hash value we set when we initialize the library:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { Fallback, Route, Router } from "@svelte-router/core";
  import Navbar from "./lib/Navbar.svelte";
  import Footer from "./lib/Footer.svelte";
  import HomeView from "./lib/views/HomeView.svelte";
  import UserProfile from "./lib/views/UserProfile.svelte";
  import RouteNotDefined from "./lib/views/RouteNotDefined.svelte";
</script>

<Router>
  <header>
    <Navbar />
  </header>
  <main>
    <Route key="home" path="/">
      <HomeView />
    </Route>
    <Route key="profile" path="/profile">
      <UserProfile />
    </Route>
    <Fallback>
      <RouteNotDefined />
    </Fallback>
  </main>
  <footer>
    <Footer />
  </footer>
</Router>
```

The `key` property in routes uniquely name routes. The given key must be unique inside the parent router. As an exception to this rule, “other” routes can specify the same key without any other properties to render *disconnected pieces of user interface* (*DPUI*). These “other” routes, under the *DPUI* condition, are not really separate routes.

Let’s add some extra things we commonly need:

```svelte
<Router>
  <Route key="order-details" path="/orders/:id" and={rp => userOwnsOrder(rp.id)}>
    {#snippet children({ rp })}
      <OrderDetails id={rp?.id as number} />
    {/snippet}
  </Route>
</Router>
```

The path specified for the route defines the `id` route parameter. Parameters are required, unless you append a question mark to their definition, as in `:id?`.


## About the Rest Parameter

The special ending `/*` in route paths define the `rest` parameter. This parameter collects “the rest of the path”, hence its name.

Since all route path matching is exact, define the `rest` parameter in routes that need inexact, “starts with” matching.

The `and` property accepts a predicate function that receives in its only parameter an object with the values of the defined route parameters, or `undefined` if the route didn’t define parameters. Use it to further constrain route matching. Depending on how you lay your application out, this can serve to create what other router implementations call “guarded routes”.

For finer-grained control of content, both `Router` and `Route` components offer the history state object and routing status information via their `children` snippet’s parameters:

```svelte
<Router>
  {#snippet children({ state: routerState, rs: routerRs })}
    <Route key="home" path="/">
      {#snippet children({ rp, state, rs })}
        ...
      {/snippet}
    </Route>
    ...
    <footer>
      {#if routerRs.home.match}
        <HomeFooter />
      {:else}
        <NonHomeFooter />
      {/if}
    </footer>
  {/snippet}
</Router>
```

This example demonstrates that route status from all routes can be used inside the `children` snippets of `Router` and `Route` components to do anything needed. The example uses it to switch the footer content depending on whether the user is at the home page or not.

:::tip[Route components share the exact same information]
In the example above, `routerRs === rs`. This is to allow convenience of access. It doesn’t matter which one you use. The same goes for `state`: `routerState === state`.

The extra `rp` parameter for the `Route` component’s `children` snippet provides access to any route parameters that may have been defined.
:::

## Disconnected Pieces of User Interface (DPUI)

All other router libraries are only capable of showing or hiding user interface in one place in the HTML markup, mostly because their route component implementations/definitions are designed to accept a component to render via a property. This is very inconvenient: We cannot use the standard way of writing markup; we cannot use snippets; we’re forced to always group things inside a single component whether we want to or not; etc. Just to name some issues.

This router implementation is ground-breaking: `Route`’s don’t work with component specifications. They just conditionally render the contents of their children snippet. *DPUI* is the ability to make content appear and disappear from more than one place in the HTML markup for a given route.

*DPUI* is achieved by adding `Route` components in the places we want UI pieces for a given route, and then only specifying the full definition in one of the places (`path`, `and`, etc.). The other places must only specify the `key` property.

This example shows how there’s a piece of the "admin" route inside the `Navbar` component:

```svelte
<!-- Navbar.svelte -->
<nav>
  <Link href="/">Home</Link>
  <Route key="admin">
    <AdminNavMenu />
  </Route>
</nav>

<!-- App.svelte -->
<Router>
  <header>
    <Navbar />
  </header>
  <main>
    <Route key="admin" path="/admin" and={() => loggedInUserIsAdmin()}>
      <AdminHomeView />
    </Route>
  </main>
</Router>
```

With *DPUI*, you don’t need extra calculations inside the `Navbar` component just to determine if we’re currently viewing the **Admin** homepage. The piece inside `Navbar` is automatically and simultaneously controlled by the same router as if they were just one route, because they are just one route. It’s just 2 pieces of the same route.

## Fallback Content

As seen in the first example, there’s a special `Fallback` component that is used to show content whenever its parent router determines that no defined routes match.

You can do *DPUI* with the `Fallback` component, except that you don’t need to specify a `key` property. Just add `Fallback` components anywhere you want within the router’s `children` snippet.

### Fallback Fine-Tuning

Because this routing library is a multi-route-matching library, the more we use/abuse this feature, the less opportunity there is for fallback content to actually appear. This can be deemed as good or as bad. It depends entirely on your project’s needs.

To assist developers into obtaining a simpler, more consistent/predictable fallback behavior, this library provides 2 mechanisms:

- The ignoreForFallback property in `Route` components
- The `when` property in `Fallback` components

The first one tells the containing router to ignore the route for fallback content matching. Use this in routes that may either be on all the time, or nearly all the time. A good example would be a micro-frontend application, where layout micro-frontends are rendered by always-matching or nearly-always-matching routes, like routes with inexact matching (their path pattern specifies the `rest` parameter).

The second one allows developers to specify a predicate function. If the function returns true, then that component instance’s fallback content shows. The predicate signature is `(rs: RouteStatusRecord, fallback: boolean) => boolean;`, where `rs` is the parent router’s route-matching status data (which is reactive), and the estimated `fallback` value (also reactive).

:::important[Using when Disconnects Fallback From Its Router]
Effectively speaking, the `when` property brings the `Fallback` component total liberty. It will no longer depend on the router, except for being provided with the router’s route-matching status information to the predicate function.
:::

Note that the value of `fallback` will have been affected by the routes’ `ignoreForFallback` property setting, if any had it set, by the time the predicate function is evaluated.

```svelte
<Fallback when={(rs) => onlyLayoutRoutesRemain(rs)}>
  ...
</Fallback>
```

As the example shows, we are in complete liberty of executing arbitrary code in the predicate.

## Less Common Features

`Router` components have a bindable `router` property. This property can be used to pass a previously-created `RouterEngine` instance, or it can be bound to in order to retrieve the `RouterEngine` instance that the component creates:

```svelte
<!-- Creating and passing a RouterEngine instance -->
<script lang="ts">
  import { Router } from "@svelte-router/core";
  import { RouterEngine } from "@svelte-router/core/kernel";

  const router = new RouterEngine();
</script>

<Router {router}>
  ...
</Router>

<!-- Obtaining the automatically-created RouterEngine instance -->
<script lang="ts">
  import { Router, RouterEngine } from "@svelte-router/core";

  let router = $state<RouterEngine>();
  $effect(() => {
    // You may now access the router instance.
  });
</script>

<Router bind:router>
  ...
</Router>
```

`Router` components can have the `basePath` property specified. The value of this property is assumed to be one or more path segments that are assumed to always exist in the environment’s URL. It is both a convenience for not having to write many path segments everywhere, as well as a feature that allows us to account for deployment scenarios where the application is not served at the root of its path.

`Route` components may define their path using regular expressions instead of string patterns. Regular expressions must:

- Match a single time (no /g modifier)
- Have zero or more named capturing groups that will be considered the route parameters

It is the responsibility of the developer to decide on things like case sensitivity and `rest` parameter definition on their own.

`Route` components that specify the path using a string pattern may request case-sensitive path matching with the `caseSensitive` property. Highly not recommended, but to each its own.
