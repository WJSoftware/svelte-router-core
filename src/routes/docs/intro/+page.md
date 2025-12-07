---
title: Introduction
description: Meet the most unique and advanced router for Svelte
---

**webJose's Svelte Router** is the most unique router in existence, even considering routers for other libraries and frameworks.  Among many commonly-known features, it introduces **3 no other router in the world has**.  This router library:

1. Matches multiple routes
2. Can do path routing using the **History API**, or it can do hash routing using the URL’s hashtag
3. Can do path routing and hash routing simultaneously 🥇
4. Can handle multiple routing paths in **multi hash routing mode** 🥇
5. Can intercept **History API** for full control in micro-frontend environments where other client-side routers might get loaded (React, Vue, Angular, etc.)
6. Can render disconnected pieces of user interface 🥇
7. Provides a Link component that can use route information to set its active appearance automatically upon route matching
8. Accepts path matching via a template string or regular expression
9. Supports route parameters
10. And the list goes on…

## Quickstart

Install the package:

```bash
npm i @svelte-router/core
```

:::info[Library Requirements]
+ Svelte **v5.31.0** or newer
:::

Initialize the library before attempting to create any routers. The project’s `main.ts` file is usually the ideal place:

```typescript
import { init } from "@svelte-router/core";

init(/* options */);

// Or if all you care about is doing good ol' hashtag routing:
init({ defaultHash: true });
```

Create routers and routes however you need. Routers and routes may contain anything. Routes require a unique key identifier, and `Route` components with the same key share the same activation conditions. Use this to render disconnected pieces of user interface across your application:

```svelte
<script lang="ts">
  import {
    Router,
    Route,
    Fallback,
    RouterTrace,
    location
  } from "@svelte-router/core";
  import NavBar from "./components/NavBar.svelte";
  import Home from ...; // Etc.  Component views for the routes.

  const showTracer = $derived(location.url.searchParams.has('debug'));
</script>

<Router id="root-router">
  <div class="app">
    <NavBar />
    <main class="container">
      <Route key="home" path="/">
        <Home />
      </Route>
      <Route key="register" path="/register">
        <Register />
      </Route>
      <Fallback>
        <NotFound />
      </Fallback>
    </main>
    <Footer>
      <Route key="home">
        <HomeFooter />
      </Route>
      <Route key="non-home" path="/*" and={(rp) => rp.rest !== '/'}>
        <NonHomeFooter />
      </Route>
    </Footer>
  </div>
  {#if showTracer}
    <RouterTrace />
  {/if}
</Router>
```

This example demonstrates a few things:

- How to instantiate a `Router` component and assign and identifier, which shows up in the `RouterTrace` component
- How to embed content for page layout
- How to use routes
- How to use routes with repeated keys and no conditions to render disconnected pieces of user interface
- How to use the route’s `and` predicate function to condition a route, which receives an object with all defined route parameters
- How to define the "rest" parameter (`/*`)
- How to add fallback content when no routes match
- How to conditionally add the `RouterTrace` component based on the URL's query string contents
- How to access the reactive URL in the library's global `location` object

All that remains now is see about the navigation links in the `NavBar` component, which has been added inside the router on purpose to take advantage of the **active** feature of the `Link` component.

```svelte
<script lang="ts">
    import { Link, LinkContext } from "@svelte-router/core";
</script>

<nav class="navbar navbar-collapse-lg">
  <div class="container-fluid">
    <h3 class="navbar-brand">Svelte Router</h3>
    <ul class="navbar-nav">
      <LinkContext
        activeState={{
          class: 'active',
          aria: { current: 'page' }
        }}
      >
        <li>
          <Link href="/" activeFor="home">
            Home
          </Link>
        </li>
        <li>
          <Link href="/register" activeFor="register">
            Register
          </Link>
        </li>
      </LinkContext>
    </ul>
  </div>
</nav>
```

This contrived (maybe possibly incomplete) Bootstrap-powered navbar demonstrates:

- How to use the `Link` component
- How to use the `LinkContext` component to configure the active state of links
- How to tell `Link` components which route they activate, so their appearance can be automatically updated when said route becomes active

## Selecting Routing Mode

By default, this library will initialize in path routing mode, meaning that the URL’s pathname is the one that drives route matching. However, you may also (and simultaneously if you wish) use hash routing. To allow simultaneous hash and path routing, the `Router`, `Route`, `Link`, `Fallback` and `RouterTrace` components accept the `hash` property.

Combine path-routing components with hash-routing components any way you want. They won’t interfere with each other.

But maybe this simultaneous feature is overkill for your case, and it is inconvenient to keep adding the `hash` property when all you want to do is one type of routing. If this is your case, you can change the default hash value during initialization (as the quickstart example showed to default to classic hash routing)[^defaultHash]:

```typescript
import { init } from "@svelte-router/core";

init({ defaultHash: true }); // Classic (single path) hash routing
init({ defaultHash: 'named' }); // A named hash routing path
```

Generally speaking, components that don’t get their `hash` property set to a value belong to the routing “universe” specified by the value of `defaultHash`. Therefore, by doing one of the above, developers can omit specifying the `hash` property on components that are meant to work in said routing universe.

Still, both hash and path routing modes continue to be available. Set a component’s `hash` property to `false` to force path routing when the default hash value has been set to `true` or a named hash path (read [Routing Modes](/docs/routing-modes) to understand this).

## Paths and Route Parameters

Paths in `Route` components can be string templates or can be regular expressions. Furthermore, route parameters can be specified in either.

The following example produces a route with the `userId` parameter and the special reserved `rest` parameter:

```svelte
<Route path="users/:userId/*">...</Route>
```

These parameters are available in two places, and TypeScript will have inferred them:

```svelte
<Route
  path="users/:userId/*"
  and={(rp) => typeof rp?.userId === 'number' && (rp?.rest as string).length > 0}
>
  {#snippet children({ rp })}
    <dl>
      <dt>userId</dt>
      <dd>{rp?.userId}</dd>
      <dt>rest</dt>
      <dd>{rp?.rest}</dd>
    </dl>
  {/snippet}
</Route>
```

The `and` property accepts a function that receives the parameters object and is meant to return a Boolean value. This value must be `true` for the route to be declared a match, so it is used to further control route matching.

The children snippet also takes the same parameters object, and it can be used in any way you see fit inside.

### Optional Parameters

Declaring a parameter optional is very simple: Add a question mark at the end of its name, as in `/users/:userId?`. That’s all.

### Paths as Regular Expressions

The `path` property may also be set using a regular expression. In this case, there is no reserved `rest` parameter, and you are in full control/have total responsibility to detect and name all route parameters.

It is expected that the provided regular expression:

- Matches a single time (no /g modifier)
- Has zero or more named capturing groups that will be considered the route parameters

Other than this, feel free to match with the best of your regular expressions’ ability.

[^defaultHash]:
    When not specified, `defaultHash` acquires the value `false`, meaning path routing.
