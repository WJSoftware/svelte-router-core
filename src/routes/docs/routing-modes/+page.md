---
title: Routing Modes (Universes)
---

This routing library supports path and hash routing and does so simultaneously. This means that we can have components that work on the pathname part of the location’s URL while simultaneously having components that work on the hash part of the location’s URL.

An example:

```svelte
<Router>
    <Route key="hf1" path="/hash-feature/*">
        <Router hash>
            <Route hash key="home" path="/">
                <RouteHashHome />
            </Route>
            <Route key="nhr" path="/non-hash-route">
                <NonHashContentForSomeReason />
            </Route>
        </Router>
    </Route>
</Router>
```

The markup defines a `Router` component that works with pathname (path routing) at the top, and then a `Route` component that matches any path that starts with `/hash-feature`. At this point a new `Router` component that uses hash routing is added, along with two routes: One route will work with the nested (hash-routing) `Router` component, but the other will effectively work with the root router, not the nested router, even when inside the hash-routing `Router` component.

This allows total freedom on how and where you add things and to which “routing universe” they belong. These “universes” are parallel and never collide with each other. In fact, there are not just 2 universes: There can be many universes. Continue reading to understand.

## All Routing Universes

A location’s URL only has one pathname, but the hash value can be freely defined and can coexist with the URL’s pathname.

The `@svelte-router/core` routing library can handle 2 hash routing modes: Single routing and multi routing. In single mode, the hash fragment is expected to resemble a pathname, as in `#/a/path/to/somewhere`; in multi mode, the hash fragment is expected to be semi-colon-separated key/value pairs, as in `#p1=/first/path;p2=/second/path`. Both `p1` and `p2` define separate named universes.

This enables you to have, for example, micro-frontends that can route with independent parts of the hash value. Now you can, if desired, create a user interface that can simultaneously mount 2 copies of the same micro-frontend or component on the same page, and one routes in the `p1` universe while the other routes in the `p2` universe.

:::info[Live Example]
The live demo for `@svelte-router/kit` showcases this.

[Multi Hash Routing Live Example](https://wjsoftware.github.io/svelte-router-kit/demo?multi=true)
:::

## Universes Defined

Hoping that the concept of routing universes stuck, let’s see about how all this is defined with TypeScript.

### Formal Explanation of the hash Property

Almost every component in this library supports a property named `hash` of type `Hash`, which is defined as `boolean | string`, and in all these components, the property is optional, meaning they also support the `undefined` value.

The following table describes exactly which universe is selected on all possible scenarios:

| Value of hash | Universe |
| - | - |
| `false` | Path Routing |
| `true` | Hash Routing |
| A string value | A named hash routing universe |
| `undefined` | Path Routing if `defaultHash` is `false`; Hash Routing if `defaultHash` is `true`; or whatever named hash routing universe was set in `defaultHash`. |

What is this `defaultHash` value? It is a routing option, and consumers of this library have the opportunity to set its value when initializing the library. The [Introduction](/docs/intro) document explains its use, and its purpose is to save developers the hassle of typing/adding the `hash` property to every routing component everywhere for the case where every component (or at least a majority of the components) are meant to belong to the same routing universe.

:::info[There Is No Off Switch for Routing Modes]
Even if you don’t need it, the ability to do path routing is always on, always present. It cannot be turned off.

Conversely, hash routing cannot be turned off, but one cannot have traditional (one path) hash routing with multi hash routing. In this sense, one can turn off one form of hash routing, but only in favor of turning the other hash routing mode on.

Don’t worry, there are no performance penalties for any of this.
:::