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
 * Helper that merges query parameters from 2 URL's together.
 * 
 * ### Important Notes
 * 
 * + To preserve system resources, `set1` is modified directly to contain the merged results.
 * + If the provided `set1` is `undefined` and all query parameters are to be preserved, then `set2` will be returned 
 * directly.
 * + If `set1` is `undefined`, a new `URLSearchParams` will be created (and returned) to contain the merged results.
 * + The return value will be `undefined` whenever `set1` is `undefined` and `set2` is also `undefined` or empty.
 * @param set1: First set of query parameters.
 * @param set2: Second set of query parameters.
 * @returns The merged `URLSearchParams`, or `undefined`.
 */
export function mergeQueryParams(set1: URLSearchParams | undefined, set2: URLSearchParams | undefined): URLSearchParams | undefined;
/**
 * Helper that merges the given search parameters with the ones found in the current environment's URL.
 * 
 * ### Important Notes
 * 
 * + To preserve system resources, `existingParams` is modified directly to contain the merged results.
 * + The `URLSearchParams` from the global `location` object will be returned when all query parameters are preserved 
 * and `existingParams` is `undefined`.
 * + If `existingParams` is `undefined`, a new `URLSearchParams` will be created (and returned) to contain the merged 
 * results.
 * + The return value will be `undefined` whenever `existingParams` is `undefined` and the global `location`'s search 
 * parameters are empty.
 * @param existingParams Existing `URLSearchParams` from the new URL.
 * @param preserveQuery The query preservation options.
 * @returns The merged `URLSearchParams`, or `undefined`.
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
