# Link

The `Link` component renders HTML anchor elements that behave in accordance to its `hash` property, allowing 
SPA-friendly navigation (navigation without reloading).

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `hash` | `boolean \| string` | `undefined` | | Sets the hash mode of the component. |
| `href` | `string` | (none) | | Sets the URL to navigate to. |
| `replace` | `boolean` | `false` | | Configures the link so it replaces the current URL as opposed to pushing the URL as a new entry in the browser's History API. |
| `state` | `any` | `undefined` | | Sets the state object to pass to the browser's History API when pushing or replacing the URL. |
| `activeFor` | `string` | `undefined` | | Sets the route key that the link will use to determine if it should render as active. |
| `activeState` | `ActiveState` | `undefined` | | Sets the various options that are used to automatically style the anchor tag whenever a particular route becomes active. |
| `prependBasePath` | `boolean` | `false` | | Configures the component to prepend the parent router's base path to the `href` property. |
| `preserveQuery` | `PreserveQuery` | `false` | | Configures the component to preserve the query string whenever it triggers navigation. |
| `children` | `Snippet<[LinkChildrenContext]>` | `undefined` | | Renders the children of the component. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/link)

## Examples

### Basic Usage

These don't require a parent router:

```svelte
<Link hash="false" href="/new/path">Path Routing => https://example.com/new/path</Link>

<Link hash="true" href="/new/path">Hash Routing => https://example.com/#/new/path</Link>

<Link hash="path1" href="/new/path">
  Multi Hash Routing => https://example.com/#path1=/new/path
  Will also preserve any other named paths
</Link>
```

### Usage Within a Parent Router

In this example, the `Link` component will take advantage of the parent router to inherit its base path and to 
automatically trigger its active appearance based on a specific route becoming active.

```svelte
<Router basePath="/some/base">
  <Link
    hash="path1"
    href="/admin/users"
    prependBasePath
    activeFor="adminUsers"
    activeState={{ class: 'active', aria: { current: 'page' } }}
  >
    Click Me!
  </Link>
  <Route key="adminUsers" path="/admin/users">
    ...
  </Route>
</Router>
```
