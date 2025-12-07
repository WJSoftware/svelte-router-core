---
title: Creating an Extension Package
---

The desire to support **Sveltekit** projects for hash routing led to a refactor of the internals of `@svelte-router/core`. Now it’s a more modular project that allows external consumption of certain core objects that used to be unavailable.

By using or replacing these core pieces of code, it is possible to extend the capabilities of `@svelte-router/core`, ideally (and if worth it) in the form of a new NPM package. Since this package will depend on `@svelte-router/core`, we call it an **extension package**.

In order to understand how to extend this routing library, let’s talk about how it works.

## Architecture of `@svelte-router/core`

All routing calculations are done by instances of the `RouterEngine` class. This class, when constructed, is given its parent and is told which routing universe it will work in. The parent establishes path inheritance; the routing universe establishes which parts of the URL and state must be used in calculations or make available to consumers. For example, the value of `RouterEngine.state` is only the piece of state that belongs to the routing universe the router engine instance belongs to.

`Route` components are mere markup helpers that locate the appropriate router in the hierarchy of routers and then register route data in the router engine’s `routes` property. Once this is done, they simply condition the rendering of the `children` snippet according to what the router has mandated. All calculations are immediate as they are powered by Svelte’s reactivity system.

In a nutshell, this is how it works.

There’s, however, a piece of information missing: Where do router engines obtain their URL and state data? Because all this is nice and good, but they react to changes in the environment’s URL and state. Where is this data coming from? The answer is: The global `location` object, which implements the `Location` interface.

This is the `Location` interface, in TypeScript:

```typescript
export interface Location {
    readonly url: URL;
    readonly hashPaths: Record<string, string>;
    getState(hash?: Hash | undefined): any;
    goTo(url: string, options?: GoToOptions): void;
    navigate(url: string, options?: NavigateOptions): void;
    back(): void;
    forward(): void;
    go(delta: number): void;
    dispose(): void;
    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void;
}
```

Since this is just an interface, there must be at least one concrete implementation out there. Actually, `@svelte-router/core` ships with two implementations: `LocationLite` and `LocationFull`. These two classes can fulfill the role, and which one is used as the global location object we import for operations depends on which initialization function you use.

:::info[More Information]
Read the [Library Modes](/docs/library-modes) and [Library Initialization](/docs/library-initialization) documents in this guide to know more about library modes and how to initialize the routing library.
:::

These implementations, in turn, have been refactored to demand another object: A `HistoryApi` or `FullModeHistoryApi` object that takes care of reading and writing the environment’s URL and navigation history data.

For completeness, here are the definitions of the interfaces:

```typescript
export interface HistoryApi extends History {
    readonly url: URL;
    dispose(): void;
}

export interface FullModeHistoryApi extends HistoryApi {
    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void;
}
```

:::info[The History Interface]
The interface named `History` above, is the standard environment’s `History` interface. The one that defines the popular `go()`, `back()`, `forward()`, `state`, etc. functions and properties.
:::

These 2 objects (`Location` and its corresponding `HistoryApi` object) are the ones that sit at the very top of `@svelte-router/core`’s architecture diagram.

So, to summarize: Either a `HistoryApi` or `FullModeHistoryApi` object sits king at the top and is responsible for ensuring that its url and state properties are reactive and are kept synchronized with the environment’s URL and the current state reported by the environment’s `History.state` property.

The `Location` object is a middle object and comes next in the hierarchy. This middle object is the highest consumers of this library can aspire to work with. Consumers of the library can never directly speak with the king. At most, they can speak with `Location`.

`Location` objects, to isolate kings, forward the reactive data from their kings down for consumption, along with useful navigation methods like `go()`.

Then router engines consume the data in `Location` when calculating route matching, and these calculations are done reactively inside `$derived` contexts, making the calculations also reactive. Finally, routes and fallbacks, which are standard Svelte components, by virtue of their nature, react instantly to changes on any of the signals involved in this very simple tree of objects.

Now we all know what must be known to start creating extension NPM packages.

## Creating an Extension NPM Package

Extension packages can provide any number of custom `FullModeHistoryApi`, `HistoryApi` and `Location` implementations. It all depends on the package’s objectives, desired reach, and I suppose a little bit of developer ability.

Once the developer has decided which route or routes to go, another decision has to be made: How many initialization functions will be exported?

That’s right. Just like `@svelte-router/core` exports 2 initialization functions, namely `init()` and `initFull()`, extension packages are free to export initialization functions of their own and are not limited in quantity. The extension package can export as many as needed.

:::note[Keep It Focused and Simple]
Even though there are no restrictions, the best package is a focused package that is simple to learn and use.
:::

The exported initialization functions may be implemented in any way the developer wishes to. There are no restrictions. For example, an initialization function may perfectly well not allow any options.

:::caution[Avoid Asynchronous Initializations]
Even though this is not a formal restriction, try to keep initialization synchronous. If the global `location` object is not available by the time the first router is rendered, the application will fail.

If your initialization routine requires asynchronous behavior, document a way to avoid the problem described above. For example, condition rendering to the existence of the global `location` object (not a reactive object reference, by the way), or condition rendering using `{#await initPromise}`, where `initPromise` is the resulting promise of your initialization routine.
:::

### To Actually Initialize the Library

The `@svelte-router/core` package exports the `initCore()` function. This function accepts all library options, plus an instance object that implements the `Location` interface. This instance will become the library’s global `location` object.

If you created a customized `Location` implementation, then simply instantiate it and give it to the `initCore()` function. If you, however, only created a `HistoryApi` customized implementation, then you can pass an instance of it to the constructor of the `LocationLite` class, exported by this library, which is one of the stock implementations for the `Location` interface. If you created a customized implementation of `FullModeHistoryApi`, then you can also opt to create a `LocationFull` instance with it.

In short:

- If you created custom `Location` implementations, use those.
- If you created custom `HistoryApi` implementations, your package will only work in "normal" or "lite" mode.
- If you created custom `FullModeHistoryApi` implementations, your extension library can work in both "lite" and "full" modes.

Once the developer has completed writing and testing all `Location`, `HistoryApi` and `FullModeHistoryApi` implementations, and the corresponding initialization functions, the extension library is ready. Document it and ship it.

The steps, in list form:

1. Start a new project (*Sveltekit library project recommended*).
2. Add `@svelte-router/core` as a peer dependency.
3. Create the implementations you need.
4. Create the initialization functions you want users to use, which in turn use the implementations from the previous step.
5. **Make sure you do unit testing!** 😏
6. Document your library.
7. Publish your library.
8. Show and tell about your library in [GitHub Discussions](https://github.com/WJSoftware/svelte-router/discussions/categories/show-and-tell).
