---
title: Fallback Component
description: API reference for the Fallback component that renders content when no routes match in your Svelte application
---

:::info[Parent Requirement]
`Router` required.
:::

This is a very simple component: It renders content whenever its parent router has no matching routes. It is that simple.

You are free to add as many of these as required to fulfill your user interface requirements.

## Properties

### `hash`

Type: `Hash`; Default: `undefined`; Bindable: **No**

This property controls the universe the `Fallback` component will be a part of. Read the `Router` component’s explanation on this property for detailed information.

:::warning[Reactivity Warning]
This value cannot be reactively mutated because it directly affects the search for its parent router, which is set in context, and context can only be read or set during component initialization.

If you need reactive hash values, destroy and re-create the component whenever the value changes using `{#key hash}` or an equivalent approach.
:::

### `when`
Type: `WhenPredicate`; Default: `undefined`; Bindable: **No**

This property overrides the default activation logic for the component instance it is applied to. For the record, `Fallback` components render their children whenever the parent router engine’s `fallback` property is `true`. This is the default activation logic.

However, because this library is a multi-route-matching routing library, this could diminish and even completely shut down the ability to present fallback content. Maybe there are always-on (or almost always-on) routes in the router for layout or navigation purposes, and simply adding the `ignoreForFallback` property to them doesn’t work.

For cases like this, provide your own fallback condition(s) in the form of a predicate function. This is an (incomplete) example:

```svelte
<Fallback when={(rs, fallback) => onlyLayoutRoutesRemain(rs)}>
  ...
</Fallback>
```

In this example, complex route-matching testing is deferred to the `onlyLayoutRoutesRemain()` function. If the function returns `true`, then fallback content is shown.

The predicate function receives 2 arguments: The router’s route status information that provides matching status for all routes, and the calculated `fallback` value that represents the original ruling made by the router for fallback content.

Unlike the `Route` component’s `path` and `and` properties, this property only applies to the instance of the `Fallback` component that got it defined. There’s no “propagation” of the property to other `Fallback` component instances.

### `children`
Type: `Snippet<[RouterChildrenContext]>`; Default: `undefined`; Bindable: **No**

The component’s default snippet. Children rendering is conditioned to the value of the parent router engine’s `fallback` property, or the ruling of the predicate function specified in the `when` property.

The snippet provides, via its parameters, the current state data and the router’s route status data in a single, destructurable context object:

```svelte
<Router>
    <Fallback>
        {#snippet children({ state, rs })}
            ...
        {/snippet}
    </Fallback>
</Router>
```

There are no restrictions as to how or what is a child of a `Fallback` component.
