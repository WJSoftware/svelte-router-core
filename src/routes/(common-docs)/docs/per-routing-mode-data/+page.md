---
title: Per-Routing Mode Data
description: Learn how Svelte Router manipulates global data to segregate and protect it between the various routing universes
---

The concept of multiple parallel universes is convenient to explain how simultaneous and independent routing occurs within the `@svelte-router/core` routing library. However, something critical hasn’t been brought to light: Which data is associated to each universe?

## Hash Fragment

The obvious one: The URL’s hash fragment is handled in a special way as to ensure that `location.navigate()` or the `Link` component’s click action don’t destroy paths that are not meant to be destroyed. Therefore, the value of the environment’s URL’s fragment (a. k. a. the hash) is one piece of data that is carefully split among routing universes.

## State Data

This is the trickiest one: The state data set in the window’s **History API**. This library takes measures to ensure that the saved state data complies with the following data type:

```typescript
export type State = {
    /**
     * Holds the state data associated to path routing.
     */
    path: any;
    /**
     * Holds the state data associated to hash routing.
     * 
     * For single (or traditional) hash routing, the value is stored using the `single` key.  For multi-hash routing, 
     * the value is stored using the hash identifier as the key.
     */
    hash: Record<string, any>;
}
```

This is the actual type definition exported by the library. If you must meddle with state data outside the confines of this library, always make sure you respect this data structure.

Just as with the hash data, `location.navigate()` and the `Link` component will respect this data structure automatically, and you don’t have to specify any part of this data structure when using either.
