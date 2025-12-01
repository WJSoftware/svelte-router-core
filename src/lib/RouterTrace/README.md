# RouterTrace

The `RouterTrace` component renders an HTML table with route status data of its parent router.

The table contains the following information:

| Column | Description |
| - | - |
| **Route** | Shows the route's key. |
| **Path** | Shows the route's path. |
| **RegEx** | Shows the generated regular expression for paths specified as string patterns. |
| **Matches?** | Shows ✔ or ✘ to signal whether the route is currently matching or not. |
| **Route Params** | Lists all of the route parameters and their inferred values.  This only happens if the path’s regular expression was able to match. |

Furthermore, in the table's caption you'll find the router's assigned ID, its base path, its children count if any, 
its parent router, the routing universe the router belongs to, the test path used when testing routes for matches and 
the value of the `fallback` property, which is used by `Fallback` components to know when to render content.

While it's common to rely on the presence of a parent router, a parent router is not actually mandatory.  Instead, one 
can trace any router that is provided through the `router` property.

## Traversing the Router Hierarchy

The table's caption will present 2 buttons.  Use these buttons to go up or down the hierarchy of routers within the 
same routing universe.

## Props

| Property | Type | Default | Bindable | Description |
| - | - | - | - | - |
| `hash` | `Hash` | `undefined` | | Sets the hash mode of the component. |
| `router` | `RouterEngine` | `undefined` | Yes | Sets the router engine to trace. |
| `childrenMenuPosition` | `'top' \| 'bottom'` | `'top'` | | Sets the position of the router engine's children menu. |
| `darkTheme` | `boolean` | `false` | | Enables or disables the dark theme for the component. |
| `themeBtn` | `boolean` | `false` | | Shows or hides a button capable of toggling the component's theme between light and dark themes. |
| `buttonClass` | `ClassValue` | `undefined` | | Overrides the default CSS class of all buttons in the component. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/routertrace)
