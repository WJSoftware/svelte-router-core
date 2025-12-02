import type { BeforeNavigateEvent, Hash, Location, GoToOptions, NavigateOptions, NavigationCancelledEvent, State, HistoryApi } from "../types.js";
import { getCompleteStateKey } from "./Location.js";
import { StockHistoryApi } from "./StockHistoryApi.svelte.js";
import { routingOptions } from "./options.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { calculateHref } from "./calculateHref.js";
import { calculateState } from "./calculateState.js";
import { preserveQueryInUrl } from "./preserveQuery.js";
import { assertAllowedRoutingMode } from "$lib/utils.js";

/**
 * A lite version of the location object.  It does not support event listeners or state-setting call interceptions, 
 * which are normally only needed when mixing router libraries.
 */
export class LocationLite implements Location {
    #historyApi: HistoryApi;

    hashPaths = $derived.by(() => {
        if (routingOptions.hashMode === 'single') {
            return { single: this.#historyApi.url.hash.substring(1) };
        }
        const result = {} as Record<string, string>;
        const paths = this.#historyApi.url.hash.substring(1).split(';');
        for (let rawPath of paths) {
            const [id, path] = rawPath.split('=');
            if (!id || !path) {
                continue;
            }
            result[id] = path;
        }
        return result;
    });

    path = $derived.by(() => {
        const hasDriveLetter = this.url.protocol.startsWith('file:') && this.url.pathname[2] === ':';
        return hasDriveLetter ? this.url.pathname.substring(3) : this.url.pathname;
    });

    constructor(historyApi?: HistoryApi) {
        this.#historyApi = historyApi ?? new StockHistoryApi();
    }

    on(event: "beforeNavigate", callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: "navigationCancelled", callback: (event: NavigationCancelledEvent) => void): () => void;
    on(_event: unknown, _callback: unknown): (() => void) | (() => void) {
        throw new Error("This feature is only available when initializing the routing library with the full option.");
    }

    get url() {
        return this.#historyApi.url;
    }

    getState(hash?: Hash | undefined) {
        const resolvedHash = resolveHashValue(hash);
        if (typeof resolvedHash === 'string') {
            return this.#historyApi.state?.hash[resolvedHash];
        }
        if (resolvedHash) {
            return this.#historyApi.state?.hash.single;
        }
        return this.#historyApi.state?.path;
    }

    back(): void {
        this.#historyApi.back();
    }

    forward(): void {
        this.#historyApi.forward();
    }

    go(delta: number): void {
        this.#historyApi.go(delta);
    }

    #goTo(url: string, replace: boolean, state: State | undefined) {
        if (url === '') {
            // Shallow routing.
            url = this.url.href;
        }
        this.#historyApi[replace ? 'replaceState' : 'pushState'](state, '', url);
    }

    goTo(url: string, options?: GoToOptions): void {
        if (options?.preserveQuery && url !== '') {
            url = preserveQueryInUrl(url, options.preserveQuery);
        }
        this.#goTo(url, options?.replace ?? false, options?.state);
    }

    navigate(url: string, options?: NavigateOptions): void {
        const resolvedHash = resolveHashValue(options?.hash);
        assertAllowedRoutingMode(resolvedHash);
        if (url !== '') {
            url = calculateHref({
                ...options,
                hash: resolvedHash,
            }, url);
        }
        const newState = calculateState(resolvedHash, options?.state);
        this.#goTo(url, options?.replace ?? false, newState);
    }

    [getCompleteStateKey](): State {
        return $state.snapshot(this.#historyApi.state);
    }

    dispose() {
        this.#historyApi.dispose();
    }
}
