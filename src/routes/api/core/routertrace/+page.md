---
title: RouterTrace Component
description: API reference for RouterTrace debugging component that displays route status information during development
---

:::info[Parent Requirement]
`Router` optional.
:::

This component is not meant for production deployments. It renders a table that displays the route status information of its parent router, or the router set in its `router` property. The existence of the `router` property is what makes its parent requirement optional. In other words: Either make sure it has a parent router or provide one via the `router` property.

The columns in the table display the following information about the registered routes in the router:

| Column           | Description                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Route**        | Shows the route’s key property.                                                                                                    |
| **Path**         | Shows the route’s path.                                                                                                            |
| **RegEx**        | Shows the generated regular expression for paths specified as string patterns.                                                     |
| **Matches?**     | Shows ✔ or ✘ to signal whether the route is currently matching or not.                                                             |
| **Route Params** | Lists all of the route parameters and their inferred values. This only happens if the path’s regular expression was able to match. |

Besides the above information, information about the router itself is presented in the table's `<caption>` element:

- The developer-provided **router's ID**.
- The **universe** the router belongs to.
- The **parent router** using the parent router’s ID and base path.
- The **children count**, which is the total number of direct child routers the router has.
- The **base path**, which includes any base path inherited from its parent router.
- The **test path** ultimately used to determine a route’s match.
- The **fallback** value used by `Fallback` components to know when to render content.

## Traversing the Router Hierarchy

Routers show the parent and children information inside clickable buttons. These buttons reassign the `RouterTrace`’s `router` property to either the parent router, or one of its children (via a pop-up menu that appears). By using these buttons, we can traverse with a single `RouterTrace` component the entire router hierarchy of any routing universe.

## Styling the RouterTrace Component

This is a non-production component. In other words: This component is not meant to be a part of the final bundled product that your application becomes when deploying to your production environment. You can add it, though, and then hide it behind a developer-only condition like checking on the value of a session variable whose name is only known to the developer team, so developers can activate it for troubleshooting in the deployed environment.

In light of this expectation, this component doesn’t offer first-class support for styling.

Having said that, you may pass the `style` or `class` properties, and those properties will be applied to the `<table>` HTML element, thus allowing styling.

The component comes by default with a “stock theme” that gets immediately disabled if the `class` property carries any value. This is quite useful since some (perhaps even most or even all) styling libraries define a `table` CSS class that styles the whole table in one go. Bootstrap and Bulma, for instance, define this class, and by using it, the `RouterTrace` component even inherits dark mode abilities.

### Styling Other Parts of the Table

The `RouterTrace` component renders an HTML table, and this table carries a `<caption>` sub-element. This sub-element is used to display the router properties like ID and test path. The CSS that supports its structure (where things are placed and how the value of router properties are highlighted) is not readily/easily customizable.

What can be customized here is the buttons. The `RouterTrace` component supports the `buttonClass` property, and pretty much works the same as applying a class to the table part: If `buttonClass` carries a value then the default button styling turns off, and the button is entirely styled using the CSS classes that were provided.

For example, Bootstrap projects can make the buttons look like any of the Bootstrap variants:

```svelte
<RouterTrace class="table table-striped" buttonClass="btn btn-sm btn-info" />
```

This is what Bootstrap developers would do to get the component fully styled as a Bootstrap table with actionable buttons of type “information” and small size.

### Dark Mode

Different styling frameworks have different ways of enabling light and dark themes. In order to preserve independence, the `RouterTrace` component offers the `darkTheme` property. Set it to `true` to enable its dark mode. Link it to your application’s theme selector to obtain synchronization with the rest of the application.

The component also offers the `themeBtn` property. When set to `true`, a simple button to toggle between dark and light mode is revealed. Use it if you don’t want to synchronize the `darkTheme` property with your application’s theme selector.

### CSS Variables

The following are CSS variables set at the table HTML element level:

| Variable                  | Description                                                                                                      | Value (light) | Value (dark) |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- | ------------ |
| `--rt-grid-color`         | Table’s grid lines color.                                                                                        | `#ddd`        | `#353535`    |
| `--rt-header-bg-color`    | Table header’s background color. Also used as the children menu’s background color.                              | `#f2f2f2`     | `#202020`    |
| `--rt-bg-color`           | Table’s primary background color.                                                                                | `#fafafa`     | `#303030`    |
| `--rt-alternate-bg-color` | Alternate color used to stripe the table.                                                                        | `#f5f5f5`     | `#404040`    |
| `--rt-hover-bg-color`     | Color used as background color of the row under the mouse cursor and the child menu item under the mouse cursor. | `#e2e2e2`     | `#505050`    |

The following are CSS variables set at the table’s caption HTML element level:

| Variable                         | Description                                                     | Value (light)      | Value (dark)      |
| -------------------------------- | --------------------------------------------------------------- | ------------------ | ----------------- |
| `--rtc-button-bg-color`          | Background color of buttons.                                    | `firebrick`        | `darkred`         |
| `--rtc-button-hover-bg-color`    | Background color of buttons when hovered with the mouse cursor. | `rgb(201, 38, 38)` | `rgb(113, 2, 2)`  |
| `--rtc-button-disabled-bg-color` | Background color of disabled buttons.                           | `#ffb8b8`          | `rgb(66, 37, 37)` |
| `--rtc-button-text-color`        | Buttons’ foreground color.                                      | `#fafafa`          | `#fafafa`         |
| `--rtc-prop-bg-color`            | Background color for router property values.                    | `0, 0, 0`          | `255, 255, 255`   |
| `--rtc-prop-bg-opacity`          | Background color’s opacity for router property values.          | `0.15`             | `0.15`            |
| `--rtc-prop-border-color`        | Border color for router property values.                        | `0, 0, 0`          | `255, 255, 255`   |
| `--rtc-prop-border-opacity`      | Border opacity for router property values.                      | `0.5`              | `0.5`             |

Redefine any of these properties to further customize the look of the `RouterTrace` component.

## Properties

### `hash`

Type: `Hash`; Default: `undefined`; Bindable: **No**

This property controls the universe the `RouterTrace` component will be a part of. Read the `Router` component’s explanation on this property for detailed information.

:::warning[Reactivity Warning]
This value cannot be reactively mutated because it directly affects the search for its parent router, which is set in context, and context can only be read or set during component initialization.

If you need reactive hash values, destroy and re-create the component whenever the value changes using `{#key hash}` or an equivalent approach.
:::

### `router`

Type: `RouterEngine`; Default: `undefined`; Bindable: **Yes**

Sets the router engine to trace. It has a higher priority than the component’s context, so use it to explicitly trace a router of interest.

### `childrenMenuPosition`

Type: `'top' | 'bottom'`; Default: `'top'`; Bindable: **No**

Controls the position of the child routers’ menu relative to the button that triggers it. The component doesn’t have a robust floating menu placement algorithm, so this property allows some relief in cases where the menu might pop up off-screen.

### `darkTheme`

Type: `boolean`; Default: `false`; Bindable: **No**

Enables dark mode on the component.

### `themeBtn`

Type: `boolean`; Default: `false`; Bindable: **No**

Adds a simple theme switcher button in the bottom right hand side of the table’s caption.

### `buttonClass`

Type: `ClassValue`; Default: `undefined`; Bindable: **No**

Used to override default button styling. This affects all buttons, namely the parent router button, the children button and the theme button.
