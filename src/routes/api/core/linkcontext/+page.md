---
title: LinkContext Component
description: API reference for LinkContext component that provides default properties for nested Link components
---

:::info[Parent Requirement]
None.
:::

`Link` components have certain properties that affect how they calculate the URL that is pushed to the browser’s history. If the default value for one of these properties does not fit the need of the application, then every `Link` component will have to explicitly specify it.

While you might create `Link` components inside an `{#each}` block using an array that defines the link data, it might also happen that you specify each link separately. This will force you to repeat over and over the same property or properties on every link. This is not very maintainable and is prone to error. In cases like this, use a `LinkContext` component to set the properties only once.

## How To Use

Refer to the [Navigating with Components](/docs/navigating-with-components) document for a detailed explanation on how to use the `Link` and `LinkContext` components.

## Properties

The following is the list of properties this component supports:

+ `replace`
+ `prependBasePath`
+ `preserveQuery`
+ `activeState`
+ `children`

These properties propagate their values to any child Link components rendered inside its children snippet and they work as described in the [Link Component](/api/core/link) document.
