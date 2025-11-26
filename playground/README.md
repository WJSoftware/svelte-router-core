# @svelte-router/core Playground

This folder contains the tester project the author uses while developing the library.  It is a **Vite + Svelte + TS** project created with `npm create vite@latest`.

## How to Use

Install dependencies:

```bash
npm ci
```

Then, you can do one of 2 options:

1. Install the routing library:  `npm i @svelte-router/core`
2. Build the package and link it with NPM.

The first option simply pulls the latest version from `npmjs.org`.  Not good for library development as it doesn't allow testing whatever code changes were done.

For the second option, move your terminal's current directory to the repository's root folder, then:

```bash
npm pack
```

Once packed:

```bash
npm link
```

Now move to the `/playground` folder and complete the link:

```bash
npm link @svelte-router/core
```

You are ready to run the development server:

```bash
npm run dev
```

Use the second option when developing/manipulating the library's code to see the effects in the playground project.  It does require you to run `npm pack` after every change made, though.  The link established by the `npm` CLI tool is based on the created `dist/` folder, not the `src/` folder.

### Gotcha's

+ NPM can only handle **one** linked library.
+ A project using a linked library (the playground project in this case), will require re-linking if you perform any action on the installed packages, such as `npm up`, `npm i`, or `npm remove`.  Basically, any command that alters the contents of `node_modules/` will break the link.  Re-establish the link after meddling with `node_modules/`.
+ Potentially a bug in Vite:  HMR will work the first time you repackage, but will not work on subsequent repackage operations.  Use the `r` command on the running Vite dev server to restart it.
+ Depending on the change you make in the library, even with HMR you'll need to restart the Vite server or refresh the playground page because global state that is set during the call to `init()` might be lost.
