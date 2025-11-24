import { SvelteURL } from "svelte/reactivity";
import { isConformantState } from "./isConformantState.js";
import { logger } from "./Logger.js";
import type { State } from "../types.js";

/**
 * Helper class used to manage the reactive data of Location implementations.
 * This class can serve as a base class for HistoryApi implementations.
 */
export class LocationState {
    url;
    state;

    constructor(initialUrl?: string, initialState?: State) {
        // Initialize URL
        this.url = new SvelteURL(initialUrl ?? globalThis.window?.location?.href ?? 'http://localhost/');
        
        // Initialize state using normalization
        const historyState = initialState ?? globalThis.window?.history?.state;
        this.state = $state(this.normalizeState(historyState));
    }

    /**
     * Normalizes state data to ensure it conforms to the expected State interface.
     * 
     * **NOTE**:  In order to avoid serialization errors of the provided data, which might contain reactive Svelte 
     * proxies, the returned data is a clean snapshot of the normalized data.
     * 
     * @param state The state to normalize
     * @param defaultState Optional default state to use if normalization is needed
     * @returns Normalized state that conforms to the State interface
     */
    normalizeState(state: any, defaultState?: State): State {
        const validState = isConformantState(state);
        
        if (!validState && state != null) {
            const action = defaultState ? 'Using known valid state.' : 'Resetting to clean state.';
            logger.warn(`Non-conformant state data detected. ${action}`);
        }
        
        return $state.snapshot(validState ? state : (defaultState ?? { path: undefined, hash: {} }));
    }
}
