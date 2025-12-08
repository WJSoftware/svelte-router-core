---
title: Route Component
description: API reference for the Route component that defines path matching conditions and renders content for active routes
---

:::info[Parent Requirement]
`Router` required.
:::

This component defines one route, which is defined by setting conditions that router engines evaluate to determine if there’s a match or not. The conditions that define a route can be set using the `path` and `and` properties.

The most common route definition is one where an expected path is defined:

```svelte
<Route key="sf" path="/some-feature">...</Route>
```

Whenever the environment’s location’s URL matches this path (in its path name if doing path routing, or in the hash if doing hash routing), the contents of the component’s children snippet are rendered.

:::tip[All Route Matching is Exact]
A path value of `/feature` will not match location’s URLs like `/feature/123`. To bail out of exact matching, add the `rest` parameter specifier, `/*`. In this example, define the route’s path as `/feature/*`. This will make `/feature/123` match with a parameter named `rest` whose value will be `/123`.
:::

As seen in the [Introduction](/docs/intro), paths may also be defined with regular expressions.

## Other Ways to Condition Routes

Route matching can be further constrained using a predicate function set in the `and` property.

`Route` (and `Router`) components also expose the route status information as a parameter of their children snippet, which can be used to conditionally show content based on the matching status of any route in the router.

### The `and` Property

Specify a predicate function in the `and` property to further constrain route matching:

```svelte
<Route key="sf" path="/some-feature" and={() => userIsAuthorized()}>...</Route>
```

This predicate adds much flexibility and can even use route parameter values in its decision-making process:

```svelte
<Route key="sf" path="/some-feature/:id" and={(rp) => rp?.id > 0}>...</Route>
```

:::tip[Use and for Guarded Routes]
This property is ideal to create what is known as “guarded routes” in other router implementations. Note, however, that this is not its only purpose, and it is not the only way to create a guarded route.

It is also **not** ideal if you want to show customized “not authorized” content. Instead, this can be easily achieved by **not** using `and`, and simply condition which content is shown using the children snippet’s route parameters (the `rp` property in the children context object).

As stated, there are many ways to skin the “guarded route” cat.
:::

### Using Route Status Data

Technically speaking, this is not a way to condition a route. Only the `path` and `and` properties participate in the route-matching algorithm. However, practically speaking, is one more way to achieve what routing libraries do: Dynamically control which user interface elements exist on a document according to the document’s path.

Route status information is made readily available to children of routes and routers. This information carries the matching status of all routes registered in the router. You may use this data any way you see fit, including conditioning the addition of pieces of user interface.

In this example, we conditionally register a new route based on the matching status of the home route:

```svelte
<Router>
    {#snippet children({ state, rs: routerRs })}
        {#if !routerRs.home.match}
            <Route key="abc" path="/abc/:someId?">
                {#snippet children({ rp, state, rs })}
                    ...
                {/snippet}
            </Route>
        {/if}
    {/snippet}
</Router>
```

The example code uses the route status from the router’s `children` snippet (`routerRs`) to conditionally render a new route: The new route will only be available if the `"home"` route is currently not matching. This is completely valid, and of course, reactive.

Also note the fact that the same information is available in the `children` snippet for the route. Both are the exact same information.

## Route Parameters

Route parameters collect pieces of information from the matching path. They are defined inside the `path` property. When the `path` property is a string value (a pattern), define parameters with the syntax `:name`, where name must start with a letter, and can contain letters, numbers or the underscore (`_`).

Parameters can be made optional by appending a question mark to their names (`?`). Example: `/users/:userId?`.

When the path property is defined as a regular expression, define parameters as named capturing groups. The [Introduction](/docs/intro) document already went through these restrictions, but here there are again. Regular expressions must:

- Match a single time (no /g modifier)
- Have zero or more named capturing groups that will be considered the route parameters

### Parameter Data Types

A parameter’s value is automatically type-coerced if possible. The algorithm is very simple:

- If the value is an empty string, the value `undefined` or `null`, it is left untouched.
- If the value represents a number, the parameter value is converted to `number`.
- If the value is the word `'true'` or `'false'`, the parameter value is converted to `boolean`.

If none of the above, the parameter value remains a `string`.

## Rendering Disconnected Pieces of UI

It might be desirable to produce UI at different places of a document whenever a route matches. This is easily accomplished by adding `Route` components where the UI pieces need to appear but only specifying its conditions in one of the places.

This topic is covered in the [Routing with Components](/docs/routing-with-components) document of this guide.

## Properties

### `key`

Type: `string`; Default: None; Bindable: **No**

_Required_. Names the route. This identifier is expected to be unique among all routes in the router, but note that this library will not enforce this, meaning there is no runtime check for uniqueness. The only allowed scenario for key repetition is to render disconnected pieces of UI (_DPUI_).

### `path`

Type: `string | RegExp`; Default: `undefined`; Bindable: **No**

Sets the route's path pattern, or a regular expression used to test and match the environment's URL. As explained earlier, it can define route parameters. If not specified, the route will match using the predicate function in the `and` property.

If there is no `path` and no `and`, the route behaves as an always-matching route.

:::info[There Will Be No Route Status Data]
The `Route` component will behave as if the router matched it, but in reality, the route never registered itself with the parent router. Therefore, expect no route status information on routes with no `path` or `and` properties.
:::

### `and`

Type: `(params: RouteParamsRecord<T> | undefined) => boolean`; Default: `undefined`; Bindable: **No**

Sets a function for additional matching conditions. This function does directly affect the value of the match property of its router’s route status object.

The function accepts one parameter: An object containing all defined route parameters, or it will be `undefined` if no parameters exist.

This function is only evaluated if there is no `path`, or if the `path` has matched.

If there is no `path` and no `and`, the route behaves as an always-matching route.

### `ignoreForFallback`

Type: `boolean`; Default: `false`; Bindable: **No**

This is an advanced feature that allows developers to tell routers that the route’s matching status must not be used to determine whether fallback content shows.

It is useful to, for example, ensure that an always- (or near-always-) matching route (i. e. a route with inexact matching like `<Route key="layout" path="/*">`) doesn’t influence the visibility of fallback content.

### `caseSensitive`

Type: `boolean`; Default: `false`; Bindable: **No**

Sets whether the route's path pattern should be matched case-sensitively. This only has an effect when the `path`’s property value is a string pattern. If `path` is a regular expression, this setting has no effect. It is up to you to make the regular expression match the way you want or need.

### `hash`

Type: `Hash`; Default: `undefined`; Bindable: **No**

This property controls the universe the `Route` component will be a part of. Read the `Router` component’s explanation on this property for detailed information.

:::warning[Reactivity Warning]
This value cannot be reactively mutated because it directly affects the search for its parent router, which is set in context, and context can only be read or set during component initialization.

If you need reactive hash values, destroy and re-create the component whenever the value changes using `{#key hash}` or an equivalent approach.
:::

### `params`

Type: `RouteParamsRecord<T>`; Default: `undefined`; Bindable: **Yes**

Provides a way to obtain the route's parameters through property binding. This property serves no other purpose and cannot be used to forcefully inject parameter values anywhere.

### `children`

Type: `Snippet<[RouteChildrenContext]>`; Default: `undefined`; Bindable: **No**

The component’s default snippet. Children rendering is conditioned to the route matching.

The snippet provides, via its parameters, the route parameters, the current state data and the router’s route status data in a single, destructurable context object:

```svelte
<Router>
    <Route path="/users/:userId">
        {#snippet children({ rp, state, rs })}
            ...
        {/snippet}
    </Route>
</Router>
```

There are no restrictions as to how or what is a child of a `Route` component.
