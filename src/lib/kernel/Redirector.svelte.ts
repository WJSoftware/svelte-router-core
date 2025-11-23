import type { Hash, ParameterValue, RedirectedRouteInfo } from "$lib/types.js";
import { RouteHelper } from "./RouteHelper.svelte.js";
import { location } from "./Location.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { untrack } from "svelte";

/**
 * Options for the Redirector class.
 */
export type RedirectorOptions = {
    replace?: boolean;
}

/**
 * Default redirector options.
 */
const defaultRedirectorOptions: RedirectorOptions = {
    replace: true
};

/**
 * Class capable of performing URL redirections according to the defined redirection data provided.
 * 
 * Both the redirection list and the current URL are reactive, so redirections are automatically performed
 * when either changes.
 * 
 * **IMPORTANT**:  Since this is a reactivity-based redirector that registers an effect during construction, it must be 
 * initialized within a reactive context (e.g., inside the initialization script of a component or anywhere where 
 * `$effect.tracking()` returns `true`).
 * 
 * ### Sveltekit Developers
 * 
 * It is best to condition the creation of the class instance to only run on the client side, as Sveltekit's 
 * server-side rendering doesn't run effects, and an effect is what drives redirection.  Save some CPU cycles by
 * only creating the instance on the client side, for example:
 * 
 * ```svelte
 * <script lang="ts">
 *   import { browser } from '$app/environment';
 *   import { Redirector } from '@svelte-router/core';
 * 
 *   let redirector: Redirector | null = null;
 *   if (browser) {
 *     redirector = new Redirector();
 *     redirector.redirections.push({ path: '/old-path', href: '/new-path' });
 *   }
 * </script>
 * ```
 */
export class Redirector {
    /**
     * Redirector options.
     */
    #options;
    /**
     * List of redirections to perform.  Add or remove items from this array.  The array is reactive, and adding or 
     * removing items can trigger immediate redirections.
     * 
     * ### How It Works
     * 
     * Redirection definitions are almost identical to route definitions, and are "matched" with the exact same 
     * algorithm used for routes.  The `path` property specifies the old path to match, and the `href` property 
     * specifies the new URL to navigate to when a match is found.
     * 
     * Redirection definitions even support the `and` predicate property, which allows more complex redirection 
     * scenarios, and works identically to the `and` property in route definitions.  It even extracts "route 
     * parameters" when the path matches, and those are available to both the `and` predicate and the `href` property 
     * when defined as a function.
     * 
     * @example
     * ```svelte
     * <script lang="ts">
     *   import { Redirector } from '@svelte-router/core';
     * 
     *   const redirector = new Redirector();
     *   redirector.redirections.push({
     *     path: '/old-path/:id',
     *     href: (rp) => `/new-path/${rp?.id}`,
     *   });
     * </script>
     * ```
     */
    readonly redirections;
    /**
     * Route helper used to parse and test routes.
     */
    #routeHelper;
    /**
     * The resolved hash value used for this redirector.
     */
    #hash: Hash;
    /**
     * The route patterns derived from the redirection list.
     */
    #routePatterns = $derived.by(() => this.redirections.map((url) => this.#routeHelper.parseRoutePattern(url)));
    /**
     * Initializes a new instance of this class.
     * @param hash Resolved hash value that will be used for route testing and navigation if no navigation-specific 
     * hash value is provided via the redirection options.
     * @param options Redirector options.
     */
    constructor(hash?: Hash | undefined, options?: RedirectorOptions) {
        this.#options = { ...defaultRedirectorOptions, ...options };
        this.#hash = resolveHashValue(hash);
        this.redirections = $state<RedirectedRouteInfo[]>([]);
        this.#routeHelper = new RouteHelper(this.#hash);

        $effect(() => {
            for (let i = 0; i < this.redirections.length; ++i) {
                const [match, routeParams] = this.#routeHelper.testRoute(this.#routePatterns[i]);
                if (match) {
                    untrack(() => this.#navigate(this.redirections[i], routeParams));
                    break;
                }
            }
        });
    }
    /**
     * Performs the navigation according to the provided redirection information.
     * @param redirection Redirection information to use for navigation.
     * @param routeParams Route parameters obtained during route matching.
     */
    #navigate(redirection: RedirectedRouteInfo, routeParams: Record<string, ParameterValue> | undefined) {
        const url = typeof redirection.href === 'function' ?
            redirection.href(routeParams) :
            redirection.href;
        location[(redirection.goTo ? 'goTo' : 'navigate')](url, {
            hash: this.#hash,
            replace: this.#options.replace,
            ...redirection.options,
        });
    }
}
