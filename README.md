# <img src="src/lib/logo/logo-48.svg" alt="Svelte Router Logo" width="48" height="48" align="left">&nbsp;&nbsp;@svelte-router/core

> Next-level routing for Svelte and Sveltekit.

[REPL Demo](https://svelte.dev/playground/d273d356947e48c0822a65402fd06fac)

[Full Documentation @ Hashnode Space](https://wjfe-n-savant.hashnode.space)

> **🚧 IMPORTANT NOTICE**
> 
> We're in the process of re-branding the package as `@svelte-router/core`.  This document has been updated to reflect 
> this (future) new package name.  In the meantime, continue using the soon-to-be-deprecated package name,
> `@wjfe/n-savant` when installing or importing.
> 
> If you need to import stuff from `@svelte-router/core/kernel`, in the old package the path is `@wjfe/n-savant/core`.
> 
> The full online documentation has already been updated, but the URL's cannot be changed.  Alas, we'll have to deploy 
> our own docs and stop using Hashnode Space.

## Features

+ **Always-on path and hash routing**:  Simultaneous, independent and always-on routing modes.
+ **Multi hash routing**:  Doing micro-frontends?  Routing tabs or dialogs using the URL?  Have as many paths as needed.
+ **Sveltekit support**: Add hash routing on top of Sveltekit's path routing via 
[@svelte-router/kit](https://github.com/WJSoftware/svelte-router-kit)
+ **Electron support**:  Works with Electron (all routing modes)
+ **Reactivity-based**:  All data is reactive, reducing the need for events and imperative programming.
+ **⚡NEW! URL Redirection**:  Use `Redirector` instances to route users from deprecated URL's to new URL's, even across 
routing universes.

**Components**:

+ `<Router>`
+ `<Route>`
+ `<Fallback>`
+ `<Link>`
+ `<LinkContext>`
+ `<RouterTrace>`

**Reactive Data**:

+ `location.url`
+ `location.hashPaths`
+ `location.getState()`
+ `RouterEngine.routes`
+ `RouterEngine.routeStatus`

All data is a Svelte signal.  Add routes dynamically or reactively, change route conditions on the fly, add more pieces 
of user interface on-demand, etc.  All works reactively.

### Two Library Modes

Most people only need the normal or "lite" version.  Use the full version to battle/counter foreign routers
(micro-frontend scenarios, most likely).

#### In Full Mode...

+ **History API interception**:  Gain control over the history object to avoid external code/routers from 
de-synchronizing state.
+ **Cancellable `beforeNavigate` event**:  Get notified of navigation events, and cancel when appropriate.
+ **`navigationCancelled` event**:  Get notified whenever navigation is cancelled.

## Quickstart

1. Install the package.
2. Initialize the library.
3. Define the routes inside routers.
4. Modify/Add your navigation links.

### Install the package

```bash
npm i @svelte-router/core
```

### Initialize the Library

```typescript
// In your main.ts, or somewhere BEFORE any routers are created:
import { init } from "@svelte-router/core";

/*
Default:

- Lite mode
- Implicit path routing
- No router hierarchy tracing
- Single hash mode
- Log to console.
*/
init(); // Or use initFull() for full-mode.

// Common case:  "I just need good, old-fashioned hash routing."
init({ defaultHash: true });
```

#### Electron Variant

In Electron, we must immediately navigate to the homepage (or your preferred initial route) right after initializing 
if you use path routing:

```typescript
import { init, location } from "@svelte-router/core";

init();
location.goTo('/');
```

> **⚠️ Important:** Hash routing doesn't require this extra navigation step.

For applications that also run in the browser, condition the navigation to Electron only.  See the 
[Electron page](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/introduction/electron-support) online for more 
details.

### Define the Routes

`<Route>`s are added inside `<Router>`s.  `<Router>`s can be nested inside other `<Router>`s.  `<Route>`s can render 
`<Router>`s or other `<Route>`s, etc.  You get the idea:  You do as you wish.

```svelte
<script lang="ts">
  import { Router, Route } from "@svelte-router/core";
  import NavBar from "./lib/NavBar.svelte";
  import UserView from "./lib/UserView.svelte";
</script>

<Router>
  <NavBar />
  <div class="container">
    <!-- content outside routes is always rendered -->
    <h1>Routing Demo</h1>
    <Route key="users" path="/users">
      <!-- content here -->
    </Route>
    <Route key="user" path="/users/:userId">
      <!-- access parameters via the snippet parameter -->
      {#snippet children(params)}
        <UserView id={params.userId} /> <!-- Intellisense will work here!! -->
      {/snippet}
    </Route>
    ...
  </div>
</Router>
```

### Navigation Links

The previous step added the `<NavBar />` component inside the router.  This is the best practice for full `<Link>` 
functionality.  Still, this is not mandatory.

```svelte
<!-- NavBar.svelte -->
<script lang="ts">
  import { Link } from "@svelte-router/core";
</script>

<nav>
  <div class="nav-links">
    <ul>
      <li class="nav-link">
        <Link href="/users" activeFor="users" activeState={{ class: 'active' }}>
          All Users
        </Link>
      </li>
      ...
    </ul>
  </div>
</nav>
```

## Micro-Frontend Goodness

This router's implementation intends to cater for micro-frontends as best as possible.  The following are features and 
strategies that are possible with this router.

### Multi-Route Matching

Routers always evaluate all defined routes, so it is possible for more than one route to match.  This facilitates the 
layout of micro-frontends.  For example, a navigation micro-frontend could be inside a route that either always matches 
or matches most of the time, so navigation links are available the majority/all of the time.

### Simultaneous, Always-On Path and Hash Routing

Components (`Router`, `Route`, `Link`, `Fallback` and `RouterTrace`) with the same value of the `hash` property belong 
to the same "universe".  Components with different hash values belong to different universes, and these universes are 
parallel universes.  Components with hash value `false` use the URL's path name and will never interfere with routers 
that use hash routing (hash value `true` or a path's name).  The main micro-frontend(s) may route using the URL's path 
name, while specialty MFE's could route using the path in the hash part of the URL.

### Multi-Hash Routing

As of November 2025, no other router in the world can do this to the best of our knowledge.

Imagine a scenario where your MFE application would like to show side-by-side two micro-frontends that are 
router-enabled (meaning they use or need to work with a path).  With traditional routing, you could not have this setup 
because one MFE would take over the path, leaving the other MFE without one.

Multi-hash routing creates named paths in the hash value, giving routers the ability to share the hash value with other 
routers.  A hash value of the form `#path1=/path/1;path2=/path/2;...` could power side-by-side MFE's on, say, 4K 
layouts.

### EXPERIMENTAL - Replacing the `single-spa` Router

It is the author's intent to implement micro-frontends with only `single-spa` parcels and this router.  In other words, 
abandon the use of `registerApplication()` and `start()` and just mount parcels using this router.

[single-spa](https://single-spa.js.org)

## Unobtrusive Philosophy

This router library imposes minimal restrictions.  Here are some features provided by other much larger codebases that 
are not provided here because Svelte already has the capability.

### Transitions

Nothing prevents you to add transitions to anything.

```svelte
<Route key="users" path="/users/:userId">
  {#snippet children(params)}
    <div transition:fade>
      ...
    </div>
  {/snippet}
</Route>
```

### Guarded Routes

Guard routes however you wish.  Maybe with an `{#if}` block, or maybe using the route's `and` property that allows you 
to specify a predicate function.  There are probably many other ways.

### `Exact` Property on Routes

Not needed.  All matching is exact path matching, and if you want to opt out of the exact route matching, simply add 
the `rest` parameter specifier (`/*`):

```svelte
<Route key="admin" path="/admin/*">
  ...
</Route>
```

Now route matching for this route will behave as "starts with".  If you don't care about the value of the parameter, 
just ignore it.

### Lazy-Loading

Lazy-loading components is very simple:

```svelte
<script lang="ts">
  function loadUsersComponent() {
    return import('./lib/Users.svelte').then(m => m.default);
  }
</script>

<Route key="users" path="/users">
  {#await loadUsersComponent()}
    <span>Loading...</span>
  {:then Users}
    <Users />
  {:catch}
    <p>Oops!</p>
  {/await}
</Route>
```

### Navigation Events

There are no navigation events defined.  Simply write effects or derived computations based on the global `location` 
object's `url`, `state` or `hashPaths` properties, which are reactive.

```typescript
import { location } from "@svelte-router/core";

// Or $derived, whichever you need.
$effect(() => {
  // Read location.url to re-run on URL changes (navigation).
  location.url;
  // Read location.state to re-run on state changes.
  location.state;
  // Read location.hashPaths to re-run on hash changes (hash navigation).
  // The route named "single" is the one you want if doing hash routing.
  location.hashPaths.single;
});
```

### Parameter Types

There is no parameter type specification.  All parameter values go through type parsing:

+ If the value represents a number, then the parameter value will be a `number`.
+ If the value is the word `'true'` or `'false'`, then the parameter value will be a `boolean`.
+ If none of the above, the value will be a `string`.

If the demand for parameter value types grow, this might be reconsidered, but know that this is easily achievable with 
the `and` property on routes, or by specifying the path as a regular expression.

In the context of the following code, the path `'/users/summary'` would match both routes, so the one that needs a 
numeric parameter value uses the `and` property to type-check the value:

```svelte
<Route path="/users/:userId" and={(rp) => typeof rp.userId === 'number'}>
  {#snippet children(rp)}
    <UserDetails userId={rp.userId} />
  {/snippet}
</Route>
<Route path="/users/summary">
  <UsersSummary />
</Route>
```

This is the version using a regular expression for the `path` property:

```svelte
<Route path={/\/users\/(?<userId>\d+)/i}>
  {#snippet children(rp)}
    <UserDetails userId={rp.userId} />
  {/snippet}
</Route>
<Route path="/users/summary">
  <UsersSummary />
</Route>
```

### Reacting to Route Matching Events

If you're interested in reacting whenever (a) particular route(~~s~~) match(es), you can get a hold of the `routeStatus` 
property of router engines (which is reactive) by binding to a router's `router` property:

```svelte
<script lang="ts">
  import { RouterEngine } from "@svelte-router/core/kernel";

  let router: $state<RouterEngine>();

  $effect(() => {
    for (let [key, rs] of Object.entries(router.routeStatus)) {
      // key: Route's key
      // rs:  RouteStatus for the route.
      if (rs.match) {
        // Do stuff with rs.routeParams, for example.
      }
    }
  });
</script>

<Router bind:router>
  ...
</Router>
```

## Navigation

The recommended way of navigating is to create `<Link>` component instances to render links on the document(s).  If 
needed, however, there are 2 navigation functions in the `location` object:  `navigate()` and `goTo()`.

### `navigate(url, options)` - Routing Universe Aware

This is the preferred method for programmatic navigation as it understands routing universes and properly manages state:

```typescript
import { location } from "@svelte-router/core";

// Path routing navigation:
location.navigate('/new/path', { 
  replace: true, 
  state: { custom: 'Hi' },
  hash: false 
});

// Hash routing navigation:
location.navigate('/new/path', { 
  replace: true, 
  state: { custom: 'Hi' },
  hash: true 
});

// Multi-hash routing navigation:
location.navigate('/new/path', { 
  replace: true, 
  state: { custom: 'Hi' },
  hash: 'path1' 
});

// Preserve existing query parameters:
location.navigate('/new/path', { 
  preserveQuery: true,
  hash: false
});
```

The `navigate()` method automatically:
- Associates state with the correct routing universe based on the `hash` option
- Preserves other routing universe states (e.g., when navigating `path1`, other named paths remain intact)
- Handles URL construction using the robust `calculateHref()` logic

### `goTo(url, options)` - Direct URL Navigation  

This method provides direct URL navigation without routing universe awareness:

```typescript
import { location } from "@svelte-router/core";

// Direct URL navigation:
location.goTo('https://example.com/new/path', { 
  replace: true,
  state: { path: undefined, hash: {} }  // Must provide complete State object
});

// Shallow routing (navigate to current URL):
location.goTo('', { replace: true });

// Preserve query parameters:
location.goTo('/new/path', { 
  preserveQuery: ['param1', 'param2'] 
});
```

**⚠️ Important:** `goTo()` requires you to provide a complete `State` object and does not understand routing 
universes. Use `navigate()` unless you specifically need direct URL control.

### Options Reference

Both methods support these common options:

- **`replace?: boolean`** - Replace current URL instead of pushing new entry (default: `false`)
- **`preserveQuery?: PreserveQuery`** - Preserve current query parameters (default: `false`)
  - `true` - Preserve all query parameters
  - `string` - Preserve specific parameter by name  
  - `string[]` - Preserve multiple specific parameters

Additional `navigate()` options:
- **`hash?: Hash`** - Routing universe to associate with (`false`, `true`, or named hash)
- **`state?: any`** - State data to associate with the navigation

Additional `goTo()` options:
- **`state?: State`** - Complete state object conforming to library expectations

### Navigation Best Practices

1. **Use `<Link>` components** for user-triggered navigation
2. **Use `navigate()`** for programmatic navigation within routing universes
3. **Use `goTo()`** only for direct URL manipulation
4. **Try to specify `hash`** in `navigate()` instead of relying on the default hash whenever possible

Just in case you are wondering:  This navigation logic is already there in `<Link>` components:

```svelte
<!-- Path Routing => https://example.com/new/path -->
<Link hash="false" href="/new/path">Click Me!</Link>

<!-- Hash Routing => https://example.com/#/new/path -->
<Link hash="true" href="/new/path">Click Me!</Link>

<!-- Multi Hash Routing => https://example.com/#path1=/new/path -->
<!-- Will also preserve any other named paths -->
<Link hash="path1" href="/new/path">Click Me!</Link>
```

As seen, the value of the `href` property never changes.  It's always a path, regardless of the routing universe.

> **⚠️ Important:** Not setting the `hash` property is **not the same** as setting it to `false`.  When `hash` is 
> `undefined`, either because the property is not specified at all, or its value is set to `undefined` explicitly, the 
> value of the `defaultHash` library option, which is set when the library is initialized, will be used instead.
>
> This is true for all components that support the `hash` property.

## Playing with Fire

At your own risk, you could use exported API like `getRouterContext()` and `setRouterContext()` to perform unholy acts 
on the router layouts, again, **at your own risk**.

## URL Redirection

Create `Redirector` class instances to route users from deprecated URL's to new URL's.  The redirection can even cross 
the routing universe boundary.  In other words, URL's from one routing universe can be redirected to a different 
routing universe.

This is a same-universe example:

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";
  import { onMount } from "svelte";

  const redirector = new Redirector(/* hash value, or nothing for default universe */);
  redirector.redirections.push({
    pattern: `/orders/:id`,
    href: (rp) => `/profile/my-orders/${rp?.id}`
  });

  onMount(() => () => redirector.dispose());
  ...
</script>
```

The constructor of the class sets a Svelte `$effect` up, so instances of this class must be created in places where 
Svelte effects are acceptable, like the initialization code of a component (like in the example).

Redirections are almost identical to route definitions, and even use the same matching algorithm.  The `pattern` is 
used to match the current URL (it defines the deprecated URL), while `href` defines the new URL users will be 
redirected to.  As seen in the example, parameters can be defined, and `href`, when written as a function, receives 
the route parameters as the first argument.

### Cross-Universe Redirection

Crossing the universe boundary when redirecting is very simple, but there's a catch:  Cleaning up the old URL.

```svelte
<script lang="ts">
  import { Redirector } from "@svelte-router/core";

  const redirector = new Redirector(false);
  redirector.redirections.push({
    pattern: `/orders/:id`,
    href: (rp) => `/profile/my-orders/${rp?.id}`,
    options: { hash: true }
  });
  ...
</script>
```

The modifications in the example are:

1. Explicit hash value in the redirector's constructor.
2. Destination hash value specifications via options.

Now comes the aforementioned catch:  The "final" URL will be looking like this:  `https://example.com/orders/123#/profile/my-orders/123`.

There's no good way for this library to provide a safe way to "clean up" the path in the deprecated routing universe, 
so it is up to consumers of this library to clean up.  How?  The recommendation is to tell the redirector to use 
`location.goTo()` and provide a full HREF with all universes accounted for.

See the [Redirecting](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/navigating/redirecting) topic in the online 
documentation for full details, including helper functions available to you.

---

[Issues Here](https://github.com/WJSoftware/svelte-router-core/issues)

[Questions, Polls, Show & Tell, etc. Here](https://github.com/WJSoftware/svelte-router-core/discussions)
