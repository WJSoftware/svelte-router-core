---
title: KitFallback Component
description: API reference for KitFallback component optimized for SvelteKit server-side rendering without content flashes
---

:::info[Parent Requirement]
`Router` required.
:::

This is a Sveltekit-friendly version of `@svelte-router/core`'s `Fallback` component.  The stock component produces unwanted flashes of content because router engines don't get routes registered in the server.  This version ensures fallback content is never rendered in the server.

## Properties

Refer to the stock [Fallback](/api/core/fallback) component.
