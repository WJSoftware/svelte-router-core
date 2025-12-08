---
title: Electron Support
description: Learn the specifics of Svelte Router for Electron applications.
---

The `@svelte-router/core` router works in **Electron**. Both path and hash routing works. However, path routing requires one extra step, which is very simple:

```typescript
import { init, location } from '@svelte-router/core';

init(/* options */);
location.goTo('/'); // <----- HERE.  Just perform navigation.
```

By navigating immediately after initializing, path routing will work just fine.

Again: **This is only needed for path routing mode**. Hash routing (_single_ or _multi_) works without this.

## Applications That Also Run in Browser

If your application also runs in browser, condition this navigation trick to Electron only. One way of doing this is by simply checking if an Electron-only object exists in the global `window` object.

For example, Electron applications commonly register a global electronAPI object via a `preload.js|ts|cjs|cts` script. If this is your case, you can simply do:

```typescript
import { init, location } from '@svelte-router/core';

const isElectron = !!window.electronAPI;

init(/* options */);
if (isElectron) {
    location.goTo('/');
}
```

Now your code works on Electron by immediately navigating to your homepage, while also working in the browser without forcing the homepage to users.

:::caution[Only Tested on Windows]
I only have a Windows PC available and have therefore not actually tested Electron on MacOS or Linux. If you encounter issues in either of these operating systems, please open an issue in GitHub.

**COMMUNITY HELP**: To remove this notice from this document and to document compatibility with other environments like **Tauri** or **Neutralino**, please visit [this GitHub discussion](https://github.com/WJSoftware/svelte-router/discussions/57) and provide the necessary information.
:::
