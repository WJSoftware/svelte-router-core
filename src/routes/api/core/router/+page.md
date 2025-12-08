---
title: Router Component
description: API reference for the Router component that creates routing contexts and manages route hierarchies in Svelte
---

:::info[Parent Requirement]
None.
:::

`Router` components are the components at the top of the hierarchy. They create router engine objects when not provided with one and register it as context for other components inside to pick up and collaborate.

Start with a `Router` component, usually at the top of the application hierarchy (in a Vite application, in `App.svelte`), then add navigation such as hyperlinks to “pages” and `Route` components that define said “pages”.

`Router` components can contain other `Router` components to create a nested hierarchy. Every time a new `Router` component is added, it inherits the parent router’s `basePath` property, which is prepended to its own `basePath` value.

## Properties

### `router`

Type: `RouterEngine`; Default: `undefined`; Bindable: **Yes**

Despite its apparent importance, it is probably the least needed property. This allows you to set or get the underlying router engine object. This, however, is a seldom-needed feature. Use only if you wish to manipulate the router using JavaScript instead of writing markup, or to react to route-matching events via `$derived` or any `$effect`.

Because `Router` components set the router engine they use as context, this property cannot change reactively like Svelte developers are used to with property values because context can only be set during component initialization. If for any reason you need to reactively set this property, you’ll have to force destruction and recreation of the `Router` component. For example:

```svelte
{#key router}
    <Router {router} />
{/key>
```

### `basePath`

Type: `string`; Default: `'/'`; Bindable: **No**

Use it to add a fixed number of path segments to the route-matching regular expressions. The base path is added as if it had been typed in the route paths.

This is particularly useful in micro-frontend scenarios because your Svelte micro-frontend can be told at which path it is being mounted at, so all route matching takes into account where the MFE is mounted.

`Router` components, by virtue of their router engine objects, accumulate base paths as more routers are added.

This is a reactive property, and can be changed at any point in time, and will reactively trigger recalculations.

:::note[Only Router Components Add to basePath]
Other routing libraries have their `Route` components collaborate their matched path to the base path of nested `Route` components. This library does not do this.

`Route` components inside `Route` components do not inherit any matched path from any parent `Route` component, only from `Router` components. If needed, nest a `Router` component.

_This might change in v2.0_.
:::

### `id`

Type: `string`; Default: `undefined`; Bindable: **No**

This is a tracing-only property, and it provides a human-readable identifier for the router. This identifier is visible in the `RouterTrace` component.

### `hash`

Type: `Hash`; Default: `undefined`; Bindable: **No**

This property controls whether the router matches routes against the current location’s pathname, or against the hash fragment of the current location, or a named path in said hash fragment.

In short: The `hash` property determines the universe the router will belong to.

Just like the `router` property, `hash` has a fundamental role in getting and setting the context, so this property cannot be reactive in the normal Svelte sense, and if you find yourself in the need to reactively change its value, you are forced to destroy and recreate the router component with the newly desired property value.

### `children`

Type: `Snippet<[RouterChildrenContext]>`; Default: `undefined`; Bindable: **No**

The component’s default snippet. The children are always rendered, meaning that any non-routing component/markup renders as per usual.

The snippet provides, via its parameters, the current state data and the router’s route status data in a single, destructurable context object:

```svelte
<Router>
    {#snippet children({ state, rs })}
        ...
    {/snippet}
</Router>
```

There are no restrictions as to how or what is a child of a `Router` component.
