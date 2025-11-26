# Route

The `Route` component is used to define a route within a `Router` component. It matches the current URL against its 
path and renders its children if the path matches.

`Route` components do not require any special placement.  They can be immediate children of `Router` components, or 
they can be embedded anywhere down the hierarchy, including being children of other `Route` components.

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `key` | `string` | (none) | | Sets the route's unique key. |
| `path` | `string \| RegExp` | (none) | | Sets the route's path pattern, or a regular expression used to test and match the browser's URL. |
| `and` | `(params: RouteParamsRecord<T> \| undefined) => boolean` | `undefined` | | Sets a function for additional matching conditions. |
| `ignoreForFallback` | `boolean` | `false` | | Controls whether the matching status of this route affects the visibility of fallback content. |
| `caseSensitive` | `boolean` | `false` | | Sets whether the route's path pattern should be matched case-sensitively. |
| `hash` | `Hash` | `undefined` | | Sets the hash mode of the route. |
| `params` | `RouteParamsRecord<T>` | `undefined` | Yes | Provides a way to obtain a route's parameters through property binding. |
| `children` | `Snippet<[RouteChildrenContext<T>]>` | `undefined` | | Renders the children of the route. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/route)

## Examples

See the examples for the `Router` component.
