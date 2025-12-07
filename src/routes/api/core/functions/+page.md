---
title: Functions
---

## `activeBehavior`

Import from: `@svelte-router/core`

`activeBehavior(rsOrRouter: Record<string, RouteStatus> | RouterEngine | null | undefined, activeState: ActiveState & { key: string }, baseStyle: string = '', ): Attachment<HTMLElement>`

Svelte attachment factory to create attachments that can automatically style and mark for screen readers an HTML element whenever a particular route becomes active.

This functionality is built-in in the `Link` component, but sometimes and depending on the styling library or framework of choice, this behavior is desirable in other HTML elements.

## `buildHref`

Import from: `@svelte-router/core`

`buildHref(pathPiece: string, hashPiece: string, options?: BuildHrefOptions): string`

This is a utility function whose primary objective is help in cross-universe redirection scenarios where one of the universes is the path routing universe.

It takes 2 arguments: 2 full HREF’s, which can be calculated using `calculateHref()`. The first one is parsed and its pathname part is conserved; the second one is parsed and its hash fragment is conserved. Both are parsed for search parameters, and if found, they are all conserved. With this data, a new HREF is returned.

It takes an optional third argument with options. Currently, only the `preserveQuery` option exists, and if specified, on top of merging any search parameters found in the HREFs given to it already, will also merge current search parameters from the current environment’s location URL.

## `calculateHref`

Import from: `@svelte-router/core/kernel`

`calculateHref(...hrefs: (string | undefined)[]): string`

`calculateHref(options: CalculateHrefOptions, ...hrefs: (string | undefined)[]): string`

Utility function used by the `Link` component and current implementations of `Location.navigate()` that can merge multiple HREF’s to produce one HREF that is compliant with the library’s multi-universe approach.

The produced HREF will correctly preserve paths from other routing universes, and this is the function to use whenever navigating with means other than the `Link` component or `location.navigate()`.

Usually, the result of this function is ultimately used as argument to `location.goTo()`, the “dumber” sibling to `location.navigate()`.

### `CalculateHrefOptions`

#### `preserveQuery`

Type: `PreserveQuery`

Enables query string preservation. What’s preserved depends on the value in this option.

#### `hash`

Type: `Hash`

The hash value that determines the routing universe the URL is for. This determines things like where the path goes in the final URL.

#### `preserveHash`

Type: boolean

Option to preserve the current hash by copying it from the location’s URL to the calculated result. This is only valid when the hash option is false, meaning path routing HREF’s.

## `calculateMultiHashFragment`
Import from: `@svelte-router/core/kernel`

`calculateMultiHashFragment(hashPaths: Record<string, string>): string`

Calculates a hash fragment that preserves all currently-existing named hash paths, plus it modifies/adds/removes the named hash paths enumerated in its only argument.

Specify new named hash paths or modify existing ones by passing a POJO object with the name as key and the new path as value. Delete an existing named hash path by specifying its name, but give it as value an empty string.

## `calculateState`

Import from: `@svelte-router/core/kernel`

`calculateState(state: any): State`

`calculateState(hash: Hash, state: any): State`

Calculates a well-formed state object by cloning the current state object and then modifying with the new state data, the one piece that belongs to the routing universe represented by the given hash value.

Use this function when not depending on the `Link` component or `location.navigate()`. This function guarantees that state is well-formed and that other routing universes don’t lose their state data.

## `getRouterContext`

Import from: `@svelte-router/core`

`getRouterContext(hash: boolean | string): RouterEngine | undefined`

Obtains the closest router context in the component hierarchy. The returned value will be for the specific universe the hash value represents.

## `init`

Import from: `@svelte-router/core`

`init(options?: InitOptions): () => void`

Initializes the library by creating the global `location` object with standard capabilities and setting the desired options.

### `InitOptions`

#### `hashMode`

Type: `'single' | 'multi'`

Sets the desired hash mode.

#### `implicitMode`

Type: `'path' | 'hash'`

Sets the desired implicit mode (when the hash property is not specified in components).

#### `trace.routerHierarchy`

Type: `boolean`

Turns router hierarchy tracking on.  Its default value is `false`, and `RouterTrace` components only show children information if this value is `true`.

## `initCore`

:::info[Usage]
Only used by extension packages. Read the [Creating an Extension Package](/docs/creating-an-extension-package) document in this guide for details.
:::

Import from: `@svelte-router/core/kernel`

`initCore(location: Location, options?: ExtendedInitOptions): () => void`

This function initializes the library, allowing the caller to pass a custom implementation of the `Location` interface.

## `initFull`

Import from: `@svelte-router/core`

`initFull(options?: InitOptions): () => void`

Initializes the library by creating the global location with full capabilities object and setting the desired options.

Refer to the [init](#init) function for details on the accepted properties.

## `IsConformantState`

Import from: `@svelte-router/core/kernel`

`function isConformantState(state: unknown): state is State`

Tests the given state data to see if it conforms to the expected `State` structure.

## `isRouteActive`

Import from: `@svelte-router/core`

`isRouteActive(rsOrRouter: RouterEngine | Record<string, RouteStatus> | null | undefined, key: string | null | undefined): boolean`

Returns a Boolean value that indicates if the route with the specified key is currently matching (is active) according to the provided router or route status data.

## `joinPaths`

Import from: `@svelte-router/core`

`joinPaths(...paths: string[]): string`

Joins any number of path segments into one, making sure slashes are not repeated.

## `preserveQueryInUrl`

Import from: `@svelte-router/core/kernel`

`preserveQueryInUrl(url: string, preserveQuery: PreserveQuery): string`

Function that can be used to preserve query string (search parameters) key/value pairs when building URL’s. While typically used by extension packages only, it could be used by users with very specific needs.

## `setRouterContext`

Import from: `@svelte-router/core/kernel`

`setRouterContext(router: RouterEngine, hash?: boolean | string): void`

Sets the router context for the specific universe the hash value represents.
