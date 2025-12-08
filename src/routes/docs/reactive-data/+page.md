---
title: Reactive Data
description: Leverage Svelte's reactivity and react naturally to changes in the environment's URL and history state
---

All generated data is reactive, which simplifies the library considerably. For example, other routing solutions take the route of providing events for many things, like `beforeRouteMatch` and things like that.

By contrast, this library provides no events (well, none in **lite** mode anyway). So how does one satisfy the need to react to events like a navigation event? Well, Svelte has made that very simple: _Signals_.

## Reacting to Navigation

The global `location` object provided by the library has the `url`, `path` and `hashPaths` properties which are reactive Svelte signals. Additionally, it returns reactive state data via its `getState()` function. Simply write effects and derived calculations based on these.

In the following example, it is assumed that path navigation (`false` as hash value means path navigation) sets a state object with the title property, which is meant to be set as the document’s title:

```svelte
<script lang="ts">
    import { location } from '@svelte-router/core';
</script>

<svelte:head>
    <title>{location.getState(false)?.title ?? '(no title)'} - Awesome App</title>
</svelte:head>
```

This one keeps track of how many times navigation has occurred:

```svelte
<script lang="ts">
    import { location } from '@svelte-router/core';

    let navCount = $state(0); // Or -1 if you don't want to count the initial load.

    $effect.pre(() => {
        location.url.href;
        ++navCount;
    });
</script>
```

This one calculates a Boolean control flag to add an extra micro-frontend (using `single-spa`) based on the presence of a particular named path:

```svelte
<script lang="ts">
    import { location } from "@svelte-router/core";
    import { SspaParcel } from "@wjfe/single-spa-svelte";

    const mfePathName = "mfe";
    const showExtraMfe = $derived(
        Object.keys(location.hashPaths).includes(mfePathName)
    );

    function loadSspaMfe() { ... }
</script>

{#if showExtraMfe}
    <SspaParcel sspa={{ config: loadSspaMfe() }} hash={mfePathName} />
{/if}
```

## Reacting to Route Data

Router engines collect route information in their `RouterEngine.routes` property. This is a reactive dictionary where the property name is the route’s key, and the value is the route’s information. Effects and derived calculations can react whenever routes are added or removed as `Route` components come and go to and from the HTML document.

However, because router engines immediately calculate route status on changes made to this data, maybe it is just simpler and more informative to react to `RouterEngine.routeStatus`, which is a reactive dictionary object containing route matching information for all routes registered in the router.

The following example shows how to react to routes becoming active:

```svelte
<script lang="ts">
    import type { RouterEngine } from "@svelte-router/core/kernel";
    import { Router, Route, ... } from "@svelte-router/core";

    let router = $state<RouterEngine>();

    const activeRouteCount = $derived(
        Object.values(router?.routeStatus).reduce((acc, rs) => {
            acc += rs.match? 1 : 0;
            return acc;
        }, 0));
</script>

<Router bind:router>...</Router>
```

Related to route matching, router engines also provide the `fallback` reactive property. This property is the one that drives the rendering of fallback content:

```typescript
$inspect(router.fallback).with((t, v) => {
    console.log('(%s) Fallback content is %s.', t, v ? 'visible' : 'not visible');
});
```

This example shows how to reactively log a message that describes the visibility state of fallback content.

---

If you believe you have a strong case for something that cannot be done reactively, feel free to drop an issue at the project’s [Issues page](https://github.com/WJSoftware/svelte-router/issues).
