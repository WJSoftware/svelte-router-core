import type { AndUntyped, Hash, RouteInfo, RouteStatus } from "../types.js";
import { traceOptions, registerRouter, unregisterRouter } from "./trace.svelte.js";
import { location } from "./Location.js";
import { routingOptions } from "./options.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { assertAllowedRoutingMode } from "$lib/utils.js";
import { RouteHelper } from "./RouteHelper.svelte.js";
import { joinPaths } from "$lib/public-utils.js";

/**
 * RouterEngine's options.
 */
export type RouterEngineOptions = {
    /**
     * The engine's parent router.
     */
    parent?: RouterEngine;
    /**
     * A value that controls hash routing behavior.
     * 
     * If a Boolean is specified, it indicates whether the router uses the URL's hash or pathname 
     * when matching routes; if a string is specified, it indicates the hash routing (same as the 
     * Boolean value `true`), and sets the path ID.
     * 
     * Setting a hash path ID requires that the library had been initialized with the `multi` value 
     * for the `hashMode` option in the `init` function.
     */
    hash?: boolean | string;
}

function isRouterEngine(obj: unknown): obj is RouterEngine {
    return obj instanceof RouterEngine;
}

/**
 * Internal key used to access the route patterns of a router engine.
 */
export const routePatternsKey = Symbol();

/**
 * Router class that fuels the `Router` component.  It is used to define routes and monitor the current URL.
 * 
 * This class can be used in JavaScript code if you prefer routing in JavaScript over routing using the `Router` and 
 * `Route` components.
 */
export class RouterEngine {
    #routeHelper;
    #cleanup = false;
    #parent: RouterEngine | undefined;
    resolvedHash: Hash;
    /**
     * Gets or sets the router's identifier.  This is displayed by the `RouterTracer` component.
     */
    id = $state<string>();
    /**
     * Gets or sets a reactive object that contains the route definitions.  The keys are the route names, and the values 
     * are the route definitions.
     * 
     * @default {}
     */
    #routes = $state<Record<string, RouteInfo>>({});
    /**
     * Gets or sets the base path of the router.  This is the part of the URL that is ignored when matching routes.
     * 
     * @default '/'
     */
    #basePath = $state<string>('/');
    #calcBasePath = $derived.by(() => joinPaths(this.#parent?.basePath || '/', this.#basePath));
    /**
     * Calculates the route patterns to be used for matching the current URL.
     * 
     * This is done separately so it is memoized based on the route definitions and the base path only.
     */
    #routePatterns = $derived(Object.entries(this.routes).reduce((map, [key, route]) => {
        return map.set(key, this.#routeHelper.parseRoutePattern(route, this.basePath));
    }, new Map<string, { regex?: RegExp; and?: AndUntyped; ignoreForFallback: boolean; }>()));

    [routePatternsKey]() {
        return this.#routePatterns;
    }

    /**
     * Gets the test path this router engine uses to test route paths.  Its value depends on the router's routing mode 
     * (universe).
     */
    readonly testPath = $derived.by(() => this.#routeHelper.testPath);

    #routeStatusData = $derived.by(() => {
        const routeStatus = {} as Record<string, RouteStatus>;
        let fallback = true;
        for (let routeKey of Object.keys(this.routes)) {
            const pattern = this.#routePatterns.get(routeKey)!;
            const [match, routeParams] = this.#routeHelper.testRoute(pattern);
            fallback = fallback && (pattern.ignoreForFallback ? true : !match);
            routeStatus[routeKey] = {
                match,
                routeParams,
            };
        }
        return [routeStatus, fallback] as const;
    });
    /**
     * Gets a a record of route statuses where the keys are the route keys, and the values are 
     * objects that contain a `match` property and a `routeParams` property.
     */
    routeStatus = $derived(this.#routeStatusData[0]);
    /**
     * Gets a boolean value that indicates whether the current URL matches none of the route 
     * patterns, therefore enabling fallback behavior.
     */
    fallback = $derived(this.#routeStatusData[1]);
    /**
     * Initializes a new instance of this class with the specified options.
     */
    constructor(options?: RouterEngineOptions);
    /**
     * Initializes a new instance of this class with the specified parent router.
    */
    constructor(parent: RouterEngine);
    constructor(parentOrOpts?: RouterEngine | RouterEngineOptions) {
        if (!location) {
            throw new Error("The routing library hasn't been initialized.  Execute init() before creating routers.");
        }
        if (isRouterEngine(parentOrOpts)) {
            this.resolvedHash = parentOrOpts.resolvedHash;
            this.#parent = parentOrOpts;
        }
        else {
            this.#parent = parentOrOpts?.parent;
            this.resolvedHash = this.#parent && parentOrOpts?.hash === undefined ? this.#parent.resolvedHash : resolveHashValue(parentOrOpts?.hash);
            if (this.#parent && this.resolvedHash !== this.#parent.resolvedHash) {
                throw new Error("The parent router's hash mode must match the child router's hash mode.");
            }
            if (routingOptions.hashMode === 'multi' && this.resolvedHash && typeof this.resolvedHash !== 'string') {
                throw new Error("The specified hash value is not valid for the 'multi' hash mode.  Either don't specify a hash for path routing, or correct the hash value.");
            }
            if (routingOptions.hashMode !== 'multi' && typeof this.resolvedHash === 'string') {
                throw new Error("A hash path ID was given, but is only allowed when the library's hash mode has been set to 'multi'.");
            }
        }
        assertAllowedRoutingMode(this.resolvedHash);
        this.#routeHelper = new RouteHelper(this.resolvedHash);
        if (traceOptions.routerHierarchy) {
            registerRouter(this);
            this.#cleanup = true;
        }
    }
    /**
     * Gets the browser's current URL.
     * 
     * This is a shortcut for `location.url`.
     */
    get url() {
        return location.url;
    }
    /**
     * Gets the browser's current state.
     * 
     * This is a shortcut for `location.state`.
     */
    get state() {
        return location.getState(this.resolvedHash);
    }
    /**
     * Gets or sets the router's base path.
     * 
     * The base path is the segments of the URL that must be present in order to match a route.
     */
    get basePath() {
        return this.#calcBasePath;
    }
    set basePath(value: string) {
        this.#basePath = value || '/';
    }
    /**
     * Gets the route definitions.
     * 
     * Unless you're consuming the `Router` class directly, the routes are automatically populated by the `Route` 
     * components that are inside a `Router` component.
     */
    get routes() {
        return this.#routes;
    }
    /**
     * Gets the parent router, if any.
     */
    get parent() {
        return this.#parent;
    }
    dispose() {
        if (this.#cleanup) {
            unregisterRouter(this);
        }
    }
}
