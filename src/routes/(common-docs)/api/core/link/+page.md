---
title: Link Component
description: API reference for the Link component providing navigation with automatic active styling and HREF generation
---

:::info[Parent Requirement]
`Router` optional.
:::

This is the component to use whenever we need to provide a hyperlink for navigation. It renders an HTML anchor element, and its properties are fully compatible with those of anchor elements, making it a drop-in replacement whenever you are migrating from no router, or routers that use anchor elements, to this router.

:::caution[Beware of a Special Case]
If your `<a>`’s href starts with the pound (hash) sign `#` and you mean to make it a `Link` component for hash routing (single or multiple), you need to remove the pound sign.

Example: If your element is `<a href="#/some/path">Click Me</a>`, then after conversion you should have `<Link href="/some/path">Click Me</Link>` or `<Link hash href="/some/path">Click Me</Link>`. The former assumes the default hash value `true` when the library was initialized, while the latter explicitly sets the `hash` property to `true` so the component doesn’t depend on the library’s default hash value.
:::

## How To Use

Refer to the [Navigating with Components](/docs/navigating-with-components) document for a detailed explanation on how to use the `Link` and `LinkContext` components.

## Shallow Routing

The `Link` component can do shallow routing by simply specifying an empty string as `href`.

For a detailed explanation of what this is, refer to this [Sveltekit page](https://svelte.dev/docs/kit/shallow-routing).

## Properties

### `hash`
Type: `Hash`; Default: `undefined`; Bindable: **No**

This property controls the universe the `Link` component will be a part of. Read the `Router` component’s explanation on this property for detailed information.

:::warning[Reactivity Warning]
This value cannot be reactively mutated because it directly affects the search for its parent router, which is set in context, and context can only be read or set during component initialization.

If you need reactive hash values, destroy and re-create the component whenever the value changes using `{#key hash}` or an equivalent approach.
:::

### `href`
Type: `string`; Default: None; Bindable: `No`

*Required*. Sets the HTML anchor element’s href attribute. Never set a full URL with this property.

:::tip[Also read Navigating with JavaScript]
The [Navigating with JavaScript](/docs/navigating-with-javascript) topic covers in detail what is considered a good HREF value, because this routing library doesn’t support just any valid HREF. What’s valid for a regular HTML anchor element might very well not be supported by this library.
:::

### `replace`

Type: `boolean`; Default: `false`; Bindable: **No**

As you probably know, the **History API** used to create the SPA experience in web applications offers two methods for altering the current URL: `pushState` and `replaceState`. By default, `Link` components will push new URL entries to the browser’s history of URL’s. If you would like to instead replace the current URL without creating a new historic entry, set this property to `true`.

### `state`

Type: `any`; Default: `undefined`; Bindable: **No**

Use it to provide the `Link` component with a data object to be pushed as state whenever the HTML anchor element is clicked.

If the provided value is a function, then the function is evaluated, and its return value is the state object that gets pushed.

:::caution[State Must Be Serializable]
Most environment implementations (perhaps all) store state data serialized. This means that we can only use state that is serializable by the implementation found in the environment.
:::

### `activeState`

Type: `ActiveState`; Default: `undefined`; Bindable: **No**

:::note[Parent Router Required]
This feature requires the collaboration of a parent router.
:::

This is a property that allows consumers to set up to 3 different properties:

+ `class: ClassValue`. Class or list of classes, or dictionary of classes to be applied to the HTML anchor element whenever the route of interest has been matched by the parent router.
+ `style: string | Record<string, string>`. Use it to directly apply HTML style settings to the HTML anchor element whenever it is considered to be active.
+ `aria: ActiveStateAriaAttributes`. Defines the `aria-` attributes applied to the HTML anchor element whenever the route specified by the `activeFor` property is active. If this property is left undefined, then `{ current: 'page' }` is applied by default.

### `activeFor`

Type: `string`; Default: `undefined`; Bindable: **No**

:::note[Parent Router Required]
This feature requires the collaboration of a parent router.
:::

Specifies the route’s key that, upon activation, applies the styling and `aria-` attributes defined in the `activeState` property to the HTML anchor element.

### `prependBasePath`

Type: `boolean`; Default: `false`; Bindable: **No**

:::note[Parent Router Required]
This feature requires the collaboration of a parent router.
:::

Whenever a parent router is available and this property is set to `true`, the `Link` component will prepend the router’s `basePath` property value to the value of the `href` property.

### `preserveQuery`

Type: `PreserveQuery`; Default: `false`; Bindable: **No**

Controls whether or not the URL pushed to the browser’s history preserves its current query string or not.

Whenever the value is true, all query string key/value pairs are preserved; whenever the value is `false`, then no query string key/value pairs are preserved.

If the value is a string or an array of strings, then each string is assumed to be the key to a key/value pair in the query string. If present, the specified key/value pairs are preserved.

### `children`

Type: `Snippet<[LinkChildrenContext]>`; Default: `undefined`; Bindable: **No**

The component’s default snippet.

The snippet provides, via its parameters, the current state data and the router’s route status data —assuming the component is being rendered within the context of a parent router engine— in a single, destructurable context object:

```svelte
<Link href="/admin/users">
    {#snippet children({ state, rs })}
        ...
    {/snippet}
</Link>
```

There are no restrictions as to how or what is a child of a `Link` component.
