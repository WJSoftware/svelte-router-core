import type {
    BeforeNavigateEvent,
    NavigationCancelledEvent,
    NavigationEvent,
    State,
    FullModeHistoryApi,
    Events
} from '../types.js';
import { isConformantState } from './isConformantState.js';
import { StockHistoryApi } from './StockHistoryApi.svelte.js';
import { logger } from './Logger.js';

/**
 * HistoryApi implementation that intercepts navigation calls to provide beforeNavigate
 * and navigationCancelled events. Used by LocationFull for advanced navigation control.
 */
export class InterceptedHistoryApi extends StockHistoryApi implements FullModeHistoryApi {
    #eventSubs: Record<Events, Record<number, Function>> = {
        beforeNavigate: {},
        navigationCancelled: {}
    };
    #nextSubId = 0;
    #origReplaceState;
    #origPushState;

    constructor(initialUrl?: string, initialState?: State) {
        super(initialUrl, initialState);
        if (globalThis.window) {
            this.#origReplaceState = globalThis.window.history.replaceState;
            this.#origPushState = globalThis.window.history.pushState;
            globalThis.window.history.replaceState = this.replaceState.bind(this);
            globalThis.window.history.pushState = this.pushState.bind(this);
        }
    }

    pushState(data: any, unused: string, url?: string | URL | null): void {
        this.#navigate('push', data, unused, url);
    }

    replaceState(data: any, unused: string, url?: string | URL | null): void {
        this.#navigate('replace', data, unused, url);
    }

    #navigate(
        method: NavigationEvent['method'],
        state: any,
        unused: string,
        url?: string | URL | null
    ) {
        const urlString = url?.toString() || '';
        const event: BeforeNavigateEvent = {
            url: urlString,
            state,
            method,
            wasCancelled: false,
            cancelReason: undefined,
            cancel: (cause) => {
                if (event.wasCancelled) {
                    return;
                }
                event.wasCancelled = true;
                event.cancelReason = cause;
            }
        };

        // Notify beforeNavigate listeners
        for (let sub of Object.values(this.#eventSubs.beforeNavigate)) {
            sub(event);
        }

        if (event.wasCancelled) {
            // Notify navigationCancelled listeners
            for (let sub of Object.values(this.#eventSubs.navigationCancelled)) {
                sub({
                    url: urlString,
                    state: event.state,
                    method,
                    cause: event.cancelReason
                });
            }
        } else {
            if (!isConformantState(event.state)) {
                logger.warn(
                    `Warning: Non-conformant state object passed to history.${method}State. Previous state will prevail.`
                );
                event.state = this.state;
            }
            (method === 'push' ? this.#origPushState : this.#origReplaceState)?.bind(globalThis.window.history)(event.state, unused, url);
            this.url.href = globalThis.window?.location?.href ?? new URL(url ?? '', this.url).href;
            this.state = event.state as State;
        }
    }

    /**
     * Subscribe to navigation events.
     */
    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    on(
        event: 'navigationCancelled',
        callback: (event: NavigationCancelledEvent) => void
    ): () => void;
    on(event: Events, callback: Function): () => void {
        const id = ++this.#nextSubId;
        this.#eventSubs[event][id] = callback;
        return () => delete this.#eventSubs[event][id];
    }

    dispose(): void {
        // Clear event subscriptions
        this.#eventSubs = {
            beforeNavigate: {},
            navigationCancelled: {}
        };
        if (globalThis.window) {
            globalThis.window.history.replaceState = this.#origReplaceState!;
            globalThis.window.history.pushState = this.#origPushState!;
        }
        super.dispose();
    }
}
