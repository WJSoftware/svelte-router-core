# Fallback

The `Fallback` component can be thought about as a `Route` component that only render its children if there are no 
other routes in the parent router engine that match.

Internally, it checks the parent router engine's `fallback` value, which is a reactive value calculated when all other 
route status data is calculated.

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `hash` | `Hash` | `undefined` | | Sets the hash mode of the component. |
| `when` | `WhenPredicate` | `undefined` | | Overrides the default activation conditions for the fallback content inside the component. |
| `children` | `Snippet<[RouterChildrenContext]>` | `undefined` | | Renders the children of the component. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/fallback)

## Examples

See the examples for the `Router` component.
