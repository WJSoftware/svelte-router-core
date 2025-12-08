---
title: Functions
description: API reference for functions in the SvelteKit extension for Svelte Router hash routing
---

## `init`

Import from: `@svelte-router/kit`

`(options?: KitInitOptions): () => void`

Initializes the library.  This is a must-do operation before any other functionality can be used.

## `kitCalculateHref`

Import from: `@svelte-router/kit`

`(options: KitCalculateHrefOptions, ...hrefs: string[]): string`

Helper function that combines multiple HREF's into a single HREF using `@svelte-router/core`'s `calculateHref` function **for the path routing universe**.

It is important to stress the importance of the highlighted phrase in the previous paragraph:  This is a function that works like the stock `calculateHref()` function, but only produces URLs for the path routing universe.  Its purpose is to assist in the creation of URLs that are coded into regular (or generally speaking, not in `Link` components) HTML anchor elements.

There is no overload that doesn't take options.  If no options are needed, it is because the function is most likely not needed.

### `KitCalculateHrefOptions`

Refer to [CalculateHrefOptions](/api/core/functions#CalculateHrefOptions).  All options except `hash` are valid options.
