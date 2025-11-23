import type { PreserveQuery } from "../types.js";
import { location } from "./Location.js";

/**
 * Preserves query parameters from the current URL into the given URL, based on the preservation options.
 * @param url The URL to add preserved query parameters to.
 * @param preserveQuery The query preservation options.
 * @returns The URL with preserved query parameters added.
 */
export function preserveQueryInUrl(url: string, preserveQuery: PreserveQuery): string {
    const urlObj = new URL(url, location.url.origin);
    mergeQueryParams(urlObj.searchParams, preserveQuery);
    return urlObj.toString();
}

/**
 * Internal helper to merge query parameters from 2 URL's into a third.
 * @param set1: First set of query parameters.
 * @param set2: Second set of query parameters.
 */
export function mergeQueryParams(set1: URLSearchParams | undefined, set2: URLSearchParams | undefined): URLSearchParams | undefined;
/**
 * Internal helper to merge query parameters for calculateHref.
 * This handles the URLSearchParams merging logic without URL reconstruction.
 * @param existingParams Existing URLSearchParams from the new URL.
 * @param preserveQuery The query preservation options.
 * @returns The merged URLSearchParams or undefined if no merging is needed.
 */
export function mergeQueryParams(existingParams: URLSearchParams | undefined, preserveQuery?: PreserveQuery): URLSearchParams | undefined;
export function mergeQueryParams(set1: URLSearchParams | undefined, pqOrSet2: PreserveQuery | URLSearchParams | undefined): URLSearchParams | undefined {
    const set2 = pqOrSet2 instanceof URLSearchParams ? pqOrSet2 : location.url.searchParams;
    const preserveQuery = pqOrSet2 instanceof URLSearchParams ? true : pqOrSet2;
    if (!pqOrSet2 || !set2.size) {
        return set1;
    }

    if (!set1 && preserveQuery === true) {
        return set2;
    }

    const mergedParams = set1 ?? new URLSearchParams();
    
    const transferValue = (key: string) => {
        const values = set2.getAll(key);
        if (values.length) {
            values.forEach((v) => mergedParams.append(key, v));
        }
    };

    if (typeof preserveQuery === 'string') {
        transferValue(preserveQuery);
    } else {
        for (let key of (Array.isArray(preserveQuery) ? preserveQuery : set2.keys())) {
            transferValue(key);
        }
    }

    return mergedParams;
}
