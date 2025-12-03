# <img src="src/lib/logo/logo-48.svg" alt="Svelte Router Logo" width="48" height="48" align="left">&nbsp;Svelte Router

> Next-level routing for Svelte and Sveltekit.

[REPL Demo](https://svelte.dev/playground/d273d356947e48c0822a65402fd06fac)

[Full Documentation @ Hashnode Space](https://wjfe-n-savant.hashnode.space)

## Features

+ **Always-on path and hash routing**:  Simultaneous, independent and always-on routing modes.
+ **Multi hash routing**:  Doing micro-frontends?  Routing tabs or dialogs using the URL?  Have as many paths as needed.
+ **Sveltekit support**: Add hash routing on top of Sveltekit's path routing via 
[@svelte-router/kit](https://github.com/WJSoftware/svelte-router-kit)
+ **Electron support**:  Works with Electron (all routing modes)
+ **Reactivity-based**:  All data is reactive, reducing the need for events and imperative programming.
+ **URL Redirection**:  Use `Redirector` instances to route users from deprecated URL's to new URL's, even across 
routing universes.
+ **Dynamic Routes**:  Define routes in JavaScript from any dynamic source, even fetched data.
+ **Fully Typed**:  Built-in TypeScript, even for route parameters.

**Components**:

+ `<Router>`
+ `<Route>`
+ `<Fallback>`
+ `<Link>`
+ `<LinkContext>`
+ `<RouterTrace>`

**Reactive Data**:

+ `location.url`
+ `location.path`
+ `location.hashPaths`
+ `location.getState()`
+ `RouterEngine.routes`
+ `RouterEngine.routeStatus`
+ `RouterEngine.basePath`

All data is a Svelte signal.  Add routes dynamically or reactively, change route conditions on the fly, add more pieces 
of user interface on-demand, etc.  All works reactively.

### Two Library Modes

Most people only need the normal or "lite" version.  Use the full version to battle/counter foreign routers
(micro-frontend scenarios, most likely).

#### In Full Mode...

+ **History API interception**:  Gain control over the history object to avoid external code/routers from 
de-synchronizing state.
+ **Cancellable `beforeNavigate` event**:  Get notified of navigation events, and cancel when appropriate.
+ **`navigationCancelled` event**:  Get notified whenever navigation is cancelled.

## Quickstart

1. Install the package.
2. Initialize the library.
3. Define the routes inside routers.
4. Modify/Add your navigation links.

### Install the package

```bash
npm i @svelte-router/core
```

### Initialize the Library

```typescript
// In your main.ts, or somewhere BEFORE any routers are created:
import { init } from "@svelte-router/core";

/*
Default:

- Lite mode
- Implicit path routing
- No router hierarchy tracing
- Single hash mode
- Log to console.
*/
init(); // Or use initFull() for full-mode.

// Common case:  "I just need good, old-fashioned hash routing."
init({ defaultHash: true });
```

#### Electron Variant

In Electron, perform immediate navigation to clean the environment's path:

```typescript
import { init, location } from "@svelte-router/core";

init();
location.goTo('/');
```

> **⚠️ Important:** Hash routing doesn't require this extra navigation step.

For applications that also run in the browser, condition the navigation to Electron only.  See the 
[Electron page](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/introduction/electron-support) online for more 
details.

### Define the Routes

```svelte
<script lang="ts">
  import { Router, Route } from "@svelte-router/core";
  import NavBar from "./lib/NavBar.svelte";
  import UserView from "./lib/UserView.svelte";
</script>

<Router>
  <NavBar />
  <div class="container">
    <!-- content outside routes is always rendered -->
    <h1>Routing Demo</h1>
    <Route key="users" path="/users">
      <!-- content here -->
    </Route>
    <Route key="user" path="/users/:userId">
      <!-- access parameters via the snippet parameter -->
      {#snippet children({ rp })}
        <UserView id={rp?.userId} /> <!-- Intellisense will work here!! -->
      {/snippet}
    </Route>
    ...
  </div>
</Router>
```

### Navigation Links

The best practice is to render the links inside a router's hierarchy, but this is not mandatory.

```svelte
<!-- NavBar.svelte -->
<script lang="ts">
  import { Link } from "@svelte-router/core";
</script>

<nav>
  <div class="nav-links">
    <ul>
      <li class="nav-link">
        <Link href="/users" activeFor="users" activeState={{ class: 'active' }}>
          All Users
        </Link>
      </li>
      ...
    </ul>
  </div>
</nav>
```
---

[Issues Here](https://github.com/WJSoftware/svelte-router/issues)

[Questions, Polls, Show & Tell, etc. Here](https://github.com/WJSoftware/svelte-router/discussions)
