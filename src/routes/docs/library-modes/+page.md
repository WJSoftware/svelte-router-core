---
title: Library Modes
---

This routing library can operate in 2 different modes: **Lite** mode, and **Full** mode. The lite mode is the recommended and most popular mode and is enforced when the call to `init()` is made. Full mode can be turned on by calling the `initFull()` function instead, like this:

```typescript
import { initFull } from "@svelte-router/core";

initFull(/* { options } */);
```

Library modes exist to reduce the code imported and bundled into applications.

The following table lists all features of the library, denoting the modes in which it is available.

| Feature | Lite Mode | Full Mode |
| - | - | - |
| Always-on path and hash routing | ✔ | ✔ |
| Multi hash routing | ✔ | ✔ |
| Multiple route matching | ✔ | ✔ |
| Router base paths | ✔ | ✔ |
| Nesting routers | ✔ | ✔ |
| Exact path matching | ✔ | ✔ |
| Path specification via regular expression | ✔ | ✔ |
| Route parameters | ✔ | ✔ |
| Rest parameter | ✔ | ✔ |
| Optional parameters | ✔ | ✔ |
| Additional route-matching logic | ✔ | ✔ |
| Disconnected pieces of UI for routes and fallback | ✔ | ✔ |
| Automatic active state in Link components | ✔ | ✔ |
| Active behavior Svelte attachment | ✔ | ✔ |
| Fallback content | ✔ | ✔ |
| Additional fallback matching logic | ✔ | ✔ |
| Router tracing | ✔ | ✔ |
| Reactive URL | ✔ | ✔ |
| Reactive state | ✔ | ✔ |
| Reactive hash paths | ✔ | ✔ |
| Programmatic navigation | ✔ | ✔ |
| Dynamic Routes | ✔ | ✔ |
| Electron Support | ✔ | ✔ |
| Extension packages | ✔ | ✔ |
| URL Redirection | ✔ | ✔ |
| Cancellable `beforeNavigate` event | ✘ | ✔ |
| `navigationCancelled` event | ✘ | ✔ |
| History API interception | ✘ | ✔ |

Most of the features are the subject of this online guide, so the next section will explain the full mode features only, which are most likely only needed in micro-frontend scenarios to battle/counter the presence of other client-side router libraries.

## History API Interception

The standard `popstate` event that signals the window’s URL has changed only fires when the browser history moves back and forth and doesn’t account for programmatic pushing or replacing of new URL’s. This is a potential issue: Foreign code could push/replace URL’s and since no event is fired, `@svelte-router/core`’s global `location` object will become out of sync.

This issue can be eliminated by making sure consumers of the library only navigate through “approved” means. For this routing library, the approved means are the use of the `Link` component and programmatically calling `location.navigate()` or `location.goTo()`. The internals of these make sure the library’s internal state remains consistent with the environment’s URL without needing the environment’s intervention.

:::caution[Be Careful with location.goTo()]
By virtue of its very nature, this function will happily navigate to the given URL as-is and will as happily set the given state data as-is. It is your responsibility to ensure you’re not incurring in state data or hash/multi-hash paths loss.

Other than that, `location.goTo()` will correctly trigger changes in the reactive `location.url` and the state data accessible via `location.getState()`.
:::

But the problem is not resolved. Especially in micro-frontend scenarios, a foreign routing library (like `react-router-dom`), can still push or replace URL’s, incurring in de-synchronization as explained above.

Full mode attempts to mitigate this problem by intercepting all calls to the History API’s `pushState()` and `replaceState()` functions. This way, whenever external code calls these functions, the library’s internal state can stay in sync.

## Navigation Events

Intercepting the use of the **History API** allows the library to offer 2 events:

- `beforeNavigate`: An event that fires whenever the URL or state is about to be pushed via `pushState()` or `replaceState()`. This action can be cancelled.
- `navigationCancelled`: This fires if navigation is cancelled by a listener of the `beforeNavigate` event.

The global location object offers these events:

```typescript
import { location } from "@svelte-router/core";

const off1 = location.on('beforeNavigate', (event) => { ... });
const off2 = location.on('navigationCancelled', (event) => { ... });
```

The data available in the events differ, but have the following common properties:

| Property | Type | Description |
| - | - | - |
| `url` | `string` | The URL about to be pushed, or that was about to be pushed, to the environment’s history. |
| `state` | `unknown` | The state object about to be pushed, or that was about to be pushed, along with the URL to the environment’s history. |
| `method` | `'push' \| 'replace'` | Indicates which **History API** method was used. |

:::important[Verify State!]
The state data needs verification. If you read [Per-Routing Mode Data](docs/per-routing-mode-data), then you know that state data must conform to the `State` data type. When handling `beforeNavigate`, it is highly recommended that you validate state using the `isConformantState()` function.

If you can modify the state to make it conformant, you may do so by reassigning `event.state`. This value will be ultimately used, assuming navigation is not cancelled.
:::

### `beforeNavigate`

Event Type: `BeforeNavigateEvent`

Fires whenever the **History API** is invoked to push or replace the environment’s URL. Code listening for this event has the ability to cancel navigation:

```typescript
import { location } from "@svelte-router/core";

const off = location.on('beforeNavigate', (event) => {
    const cancelReason = cancelEventForSomeReason(event);
    if (cancelReason) {
        event.cancel(cancelReason);
    }
});
```

Once a listener cancels navigation, it cannot be reversed, and navigation won’t happen. However, this doesn’t stop other listeners of the event to be invoked. You can account for a previous listener cancelling the event using the event’s `wasCancelled` property. The next code snippet is the previous one, amended with this new information:

```typescript
import { location } from "@svelte-router/core";

const off = location.on('beforeNavigate', (event) => {
    if (!event.wasCancelled) {
        const cancelReason = cancelEventForSomeReason(event);
        if (cancelReason) {
            event.cancel(cancelReason);
        }
    }
});
```

Cancellation can’t happen twice, so the code above only attempts cancellation if the event hasn’t been cancelled yet in order to save CPU cycles.

Event listeners can access the cancellation reason given by the cancelling event listener via the event’s `cancelReason` property.

As stated above, this is the event to use if you would like the opportunity to ensure that state data coming from an external router/routing code is conformant to what this library expects:

```typescript
import { location, type BeforeNavigateEvent } from "@svelte-router/core";
import { isConformantState } from '@svelte-router/core/kernel';

function cancelEventForSomeReason(event: BeforeNavigateEvent) {
    if (!isConformantState(event.state)) {
        return "State is malformed.";
    }
    // ETC.  Other checks.
}

const off = location.on('beforeNavigate', (event) => {
    if (!event.wasCancelled) {
        const cancelReason = cancelEventForSomeReason(event);
        if (cancelReason) {
            event.cancel(cancelReason);
        }
    }
});
```

### `navigationCancelled`

Event Type: `NavigationCancelledEvent`

This event fires after all `beforeNavigate` event listeners have been executed, and only if one of those listeners cancelled navigation.

The event comes with one extra property: `cause`. This property will contain the cause set when cancelling the event.