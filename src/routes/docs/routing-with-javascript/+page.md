---
title: Routing With JavaScript
---

While the recommended way is to use the components to enable routing, it is possible to use JavaScript to set up, react and monitor all routing functionality.

## The Core: `Location` and `RouterEngine`

The `location` object and the `RouterEngine` class are the core of the library. The `location` object provides a reactive clone of the current environment’s location URL and state objects, while the `RouterEngine` class produces objects that collect route definitions. With these definitions, reactive state information on each route is generated.

The `location.getState()` function provides access to a reactive version of the environment’s current state pushed via the **History API**. Use it however best fits your needs. Remember that `getState()` never returns the full state object (the one conformant to the `State` TypeScript type). If no hash argument is provided, it will return the piece of state associated to the default hash value set during initialization. See the [Routing Modes](/docs/routing-modes) page for details, if you haven’t done so already.

The `location.hashPaths` property is a derivation computed from the URL’s hash fragment and it depends on the type of hash routing the library was initialized in. In `'single'` routing mode, this is a dictionary object with just the `single` property. The value of this property is the entire hash value, minus the hashtag character. In `'multi'` routing mode, it will contain any number of properties, and each property will contain the corresponding path. Read all about this in the [Routing Modes](/docs/routing-modes) document of this guide.

### `RouterEngine`

This class can be imported and used to create, in code, the core engine that drives all `Router` components.

```typescript
import { RouterEngine } from '@svelte-router/core/kernel';

const myRouter = new RouterEngine(/* parent router or options */);
myRouter.routes['dynamic-route'] = {
    path: '/dynamic-route/with/:aParameter',
    and: (rp) => !Number.isNaN(rp.aParameter),
    caseSensitive: true // Definitely NOT recommended, but do as you wish
};
// Or a RegExp instead of a pattern:
myRouter.routes.admin = {
    path: /^\/admin\/(?<level>[^\/])\/(?<rest>.*)$/i,
    and: (rp) => userCanAccessLevel(rp.level)
};
```

The example creates a `RouterEngine` instance and then adds two routes to it keyed (or named) `"dynamic-route"` and `"admin"`. The routes are immediately matched by virtue of Svelte’s reactive system, and the results of `myRouter.routeStatus` and `myRouter.fallback` are immediately available:

```typescript
$inspect(myRouter.routeStatus).with((t, v) => {
    console.log('Route status (%s): %o', t, v);
});
$inspect(myRouter.fallback).with((t, v) => {
    console.log('No Matches (%s): %o', t, v);
});
```

Through `routeStatus` we can determine if a route is matching or not, and if it matches and it defined parameters, the parameter values are also available.

## When to Use

There’s no concrete case in which routing via JavaScript is a must. Everything should be possible via the components approach. This approach is probably useful if our application defines routes as data, or other means.

:::tip[Want Some Coding Entertainment?]
The ability to create router engines in code should enable a very cool project, if anyone desires: A bundler plug-in (ideally, an [Unplugin](https://unplugin.unjs.io/) plug-in) that can enable developers the definition of routes via the file system, similar to what `Sveltekit`, `sv-router` and `Routify` does.

Interested? If yes, visit this GitHub issue to discuss.
:::

There are a few things that you might want to do in code, though.

### Adding Routes

As seen, you might want to add routes programmatically. You can either create a new router engine as seen above, then give that object to a `Router` component via its `router` property, or you can also bypass creation of the router engine object and instead bind to a `Router` component’s `router` property:

```svelte
<script lang="ts">
    import { Router } from "@svelte-router/core";
    import { RouterEngine } from "@svelte-router/core/kernel";

    let router: $state<RouterEngine>();

    $effect.pre(() => {
        router.routes.newRoute = {
            path: 'dynamically/added/route/:someId',
            and: ({ someId }) => someId > 0,
            caseSensitive: true,
        };
    });
</script>

<Router bind:router>...</Router>
```

You can also add routes by creating a reactive array of type `ComponentProps<typeof Route>[]`, and then use an `{#each}` block to create `Route` components for each element in the array:

```svelte
<script lang="ts">
    import { Router, Route, type RouteInfo } from "@svelte-router/core";
    import type { ComponentProps } from "svelte";

    let routes: $state<ComponentProps<typeof Route>[]>([]);

    $effect.pre(() => {
        routes = calculateRoutesSomehow();
    });
</script>

<Router bind:router>
    {#each routes as routeProps (routeProps.key)}
        <Route {...routeProps} />
    {/each}
</Router>
```

Another use case could be to separate route data from the markup positions they need to be in using _DPUI_ (see the [Routing with Components](/docs/routing-with-components) page for details):

```typescript
// master-routes.ts
import { RouterEngine } from '@svelte-router/core/kernel';
import routeData from './route-data.json';

const router = new RouterEngine();
routeData.forEach((route) => (router.routes[route.name] = route));
export default router;
```

We create the master router as an exported module object, and then we consume in `App.svelte`:

```svelte
<script lang="ts">
    import { Route, Router } from '@svelte-router/core';
    import masterRouter from './master-router.js';
</script>

<Router router={masterRouter}>
    <!-- Because routes have already been defined, we just add pieces of UI -->
    <Route key="home">...</Route>
    <main>
        <Route key="home">...</Route>
        <Route key="user-profile">...</Route>
        ...
    </main>
</Router>
```

This would be a hybrid way of achieving things, which is a form of _DPUI_: Routes are defined in code, while the corresponding pieces of UI are defined using `Route` components in HTML markup.

### Reacting to Route Status Data and Location Changes

This has already been covered in the [Reactive Data](/docs/reactive-data) document. It is mentioned here as a way to redirect you, the user, to the right place.
