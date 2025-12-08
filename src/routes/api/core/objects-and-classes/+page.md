---
title: Objects & Classes
description: API reference for core objects, classes, and interfaces in Svelte Router including RouterEngine and Location
---

## `InterceptedHistoryApi`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Type: **Class**; Import from: `@svelte-router/core/kernel`

This is the stock implementation of the `FullModeHistoryApi` interface, and the history manager used whenever the library runs in **full** mode.

It can also serve as a base class per the standard rules of the JavaScript language.

## `location`

Type: `Location`; Import from: `@svelte-router/core`, `@svelte-router/core/kernel`

This is the global object that provides URL reactivity to all other library assets. This object is created by the library’s `init()` function, based on the options given to it.

### `location.url`

Type: `SvelteURL`

Gets a reactive URL object that is synchronized with the browser’s URL.

### `location.getState`

`(hash?: Hash | undefined): any`

Returns the reactive state value for the specified routing universe (hash).

### `location.hashPaths`

Type: `Record<string, string>`

Gets a reactive dictionary of hash paths.

### `location.navigate`

`(href: string, options?: NavigateOptions): void`

Calculates the appropriate HREF according to the specified value of the `hash` option and then navigates to it using the browser’s History API.

#### `NavigateOptions`

These options inherit the `replace` and `preserveQuery` from [GoToOptions](#GoToOptions), plus:

| Property | Type | Default | Description |
| - | - | - | - |
| `state` | `any` | `undefined` | The state data to associate with the new URL and hash value. |
| `hash` | `Hash` | `undefined` | The hash value that determines the routing universe in which navigation will take place. |
| `preserveHash` | `boolean` | `false` | Determines whether the current hash value should be preserved when navigating.  Only available when navigating the path routing universe. |

### `location.goTo`

`(url: string, options?: GoToOptions): void`

Navigates to the specified URL by using the browser’s History API.

#### `GoToOptions`

| Property | Type | Default | Description |
| - | - | - | - |
| `replace` | `boolean` | `false` | Whether to replace the current URL in the history stack. |
| `state` | `State` | `undefined` | The state object to associate with the new URL that is conformant with what this router library expects. |
| `preserveQuery` | `PreserveQuery` | `undefined` | Whether to preserve the current query string in the new URL. |

### `location.on`

`(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void`

`(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void`

Only available in full library mode, allows subscription to the `beforeNavigate` and `navigationCancelled` events.

## `LocationLite`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Type: **Class**; Import from: `@svelte-router/core/kernel`

This is the main stock implementation of the `Location` interface. Extension packages may use it when all the extension does is provide a custom implementation of the `HistoryApi` or `FullModeHistoryApi` interfaces. Using this class locks the library in **lite** mode.

It can also serve as a base class per the standard rules of the JavaScript language. This actually is the base class for `LocationFull`.

## `LocationFull`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Type: **Class**; Import from: `@svelte-router/core/kernel`

This is the stock implementation of the `Location` interface used when the library is initialized in **full** mode. Its constructor only accepts **FullModeHistoryApi** implementations. Use it in extension packages that don’t create custom **Location** implementations, but desire to provide a custom full mode experience by customizing the behavior of the backing environment History manager.

It can also serve as a base class per the standard rules of the JavaScript language.

## `LocationState`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Type: **Class**; Import from: `@svelte-router/core/kernel`

This is a very simple class that merely initializes 2 public fields: The `url` field is initialized with a `SvelteURL` instance; the `state` field initializes with a state object that is conformant with the `State` data type.

Its primary purpose is to serve as the base class for classes that implement the `HistoryApi` or `FullModeHistoryApi` interfaces. Just by inheriting from this class, two interface requirements are immediately met.

The class’ constructor currently accepts two optional parameters. The first one is the desired initial URL; the second one, the desired initial state object. When not provided, the initial URL comes from the environment’s location object, and the initial state, if conformant with the `State` data type, comes from the environment’s history object, `state` property. If the state object found in the environment’s history object is not conformant with the `State` data type, the initial state will be an empty, conformant `State` object.

## `Redirector`

Type: **Class**; Import from: `@svelte-router/core`

Use this class inside components to enable automatic URL redirection. It is used to keep deprecated URL’s out of sight but still functional. It allows routing in the same routing universe as well as routing from one routing universe to another.

### `Redirector.redirections`

Type: `RedirectedRouteInfo[]`

Array used to register redirections. Redirections are objects that define the shape of a deprecated URL (or set of URLs) and its new URL.

## `RouterEngine`

Type: **Class**; Import from: `@svelte-router/core/kernel`

This class powers all `Router` components and can be used directly. Note, however, that when directly used you’re the responsible for creating proper parent-child relationships between `RouterEngine` instances.

This class is responsible for collecting route data in its `routes` property and outputting route status data in its `routeStatus` property. In other words, data gets in via `routes`, and then data comes out via `routeStatus`.

### `RouterEngine.id`

Type: `string`

Gets or sets the router engine’s identifier, displayed by the `RouterTrace` component.

### `RouterEngine.routeStatus`

Type: `RouteStatusRecord`

Gets the reactive route-matching data for all registered routes.

### `RouterEngine.fallback`

Type: `boolean`

Gets a Boolean value that indicates whether or not any registered route has matched.

### `RouterEngine.url`

Type: `SvelteURL`

Shortcut for `location.url`.

### `RouterEngine.state`

Type: `any`

Shortcut for `location.getState(hash)`.

### `RouterEngine.basePath`

Type: `string`

Gets the router’s base path taking into account its parent router engine’s base path.

### `RouterEngine.routes`

Type: `Record<string, RouteInfo>`

Gets a reactive dictionary that collects all route definitions.

### `RouterEngine.parent`

Type: `RouterEngine | undefined`

Gets the router engine’s parent router engine, if any.

### `RouterEngine.dispose`

`(): void`

Disposes the router engine. `Router` components do this when unmounted. Make sure to dispose any instances manually created **that were not handed to a `Router` component**.  Instances that were given to a `Router` component are disposed of by the `Router` component when it unmounts from the DOM.

### `RouterEngine.resolvedHash`

Type: `Hash`

Gets the router’s resolved hash value that indicates which routing universe it belongs to.

### `RouterEngine.testPath`

Type: `string`

Gets the path used by the router when testing routes for matches.

:::caution[RouterEngine Is Disposable]
Instances of `RouterEngine` need to be disposed by calling its `dispose()` method.

You don’t need to dispose a `RouterEngine` instance that has been given to or created by a `Router` component. The `Router` component will dispose of it when unmounting from the DOM.
:::

## `StockHistoryApi`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Type: **Class**; Import from: `@svelte-router/core/kernel`

This is the stock implementation of the `HistoryApi` interface. It is the default class used by the `LocationLite` class whenever the library runs in **lite** mode.

It can also serve as a base class per the standard rules of the JavaScript language.
