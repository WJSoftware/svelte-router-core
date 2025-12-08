---
title: Library Initialization
description: Learn the various ways Svelte Router can be initialized
---

Before routers can work, the library must be initialized with the desired configuration.

The function used for this purpose is, most of the time, the `init()` function:

```typescript
import { init } from "@svelte-router/core";

const cleanup = init(/* options */);
```

:::info[Cleanup Is Not Mentioned Elsewhere]
It is not customary or necessary to re-initialize the library. However, this is possible. The `init()` function’s return value is a function that reverts library initialization. This is the only place in this guide where this cleanup function is ever mentioned.

The functionality’s primary objective is to support unit testing.
:::

There is a sibling `initFull()` function available as well. It works identically but initializes the library in **full mode**. To fully understand the difference between library modes, refer to the [Library Modes](/docs/library-modes) document in this guide.

The optional `options` object is used to tweak several important aspects of the library’s behavior. The rest of this document describes each option and where to read more about the topics that come up.

## The `hashMode` Option

Type: `'single' | 'multi'`; Default: `'single'`

The `@svelte-router/core` routing library is the first router library in the world to support an arbitrary number of paths in the environment’s URL’s hash value (environments such as browsers or web view shells like Tauri/Electron). All other router libraries support only one path in the hash value of the environment’s URL.

This option controls how the global location object interprets hash values. A value of `'single'` makes the `location` object interpret hash values as a single path; a value of `'multi'` makes the `location` object interpret hash values as a semicolon-separated list of key/value pairs.

To fully understand, read the [Routing Modes](/docs/routing-modes) document in this guide.

## The `defaultHash` Option

Type: `Hash`; Default: `false`

The `@svelte-router/core` routing library is the first library in the world to support simultaneously path and hash routing. It does this by allowing developers to signal which routing mode each Svelte component belongs to. This specification isolates the components, which ultimately allows for simultaneous support.

To fully understand, read the [Routing Modes](/docs/routing-modes) document in this guide.

As stated, developers must tell every `Router`, `Route`, `Link`, `Fallback` and `RouterTrace` Svelte component instance which routing mode to operate on. This can become tedious for common application scenarios that only need one routing mode. The `defaultHash` option relieves developers from this chore by allowing them to specify, during initialization, which routing mode will be used, or used the most. This way, developers only need to specify the routing mode on Svelte components that must not work on the specified default routing mode, if the project even has those.

## The `trace` Option
Type: `TraceOptions`; Default: `undefined`

This option accepts an object used to fine-tune the tracing abilities of the `RouterTrace` Svelte component. Currently, it only defines one option.

### The `trace.routerHierarchy` Option
Type: `boolean`; Default: `false`

`RouterTrace` components can traverse the hierarchy of routers, starting from an arbitrary router. For this to be possible, a separate object is kept in memory that tracks the relationships between the routers. This costs resources. This option exists to avoid paying this price, especially in production builds.

## The `logger` Option
Type: `boolean | Logger`; Default: `true`

This routing library tries to not soil the environment’s console output with messages. However, this is sometimes inevitable. Currently, there are 2 cases where console logging happens, and as time goes by and features come and go from the library, this count may increase.

It is the author’s opinion that libraries should not log to the console, but if they do, they should provide a way to suppress or re-route messages, especially these days when **Open Telemetry** is so popular.

This option allows logging to be turned on, turned off, or be routed to a custom logger object. Custom logger objects are really simple and easy to implement: They just need to implement `debug()`, `info()`, `warn()` and `error()`. The function signatures are identical to the corresponding functions in the global console object.

Custom loggers are free to perform any action with the logged data. The log entry may be suppressed/ignored, modified or posted to a central logging location. What happens with the logged data is entirely up to the custom logger implementation.
