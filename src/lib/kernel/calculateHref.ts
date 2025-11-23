import type { Hash, PreserveQuery } from "../types.js";
import { dissectHrefs } from "./dissectHrefs.js";
import { location } from "./Location.js";
import { mergeQueryParams } from "./preserveQuery.js";
import { joinPaths } from "./RouteHelper.svelte.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { calculateMultiHashFragment } from "./calculateMultiHashFragment.js";

export type CalculateHrefOptions = {
    /**
     * Whether to preserve the current query parameters (or the ones specified) in the new URL.
     * 
     * New URL's can specify a query string, and if query string preservation is requested, the query parameters from 
     * the current URL will be appended with the ones from the new URL.
     */
    preserveQuery?: PreserveQuery;
    /**
     * Whether to preserve the current hash in the new URL.  This is only applicable when the `hash` property is set to 
     * `false` (path routing universe).
     */
    preserveHash?: boolean;
    /**
     * Determines the routing universe the new URL will be for.
     * 
     * Read the [online documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/routing-modes) to understand 
     * the concept of routing modes (or universes).
     */
    hash?: Hash;
};



/**
 * Combines the given HREF's into a single HREF that also includes any query string parameters that are either carried
 * by the given HREF's, or preserved from the current environment's URL.
 *
 * Calculation is done assuming the resultant HREF will be for the routing universe specified in the library's
 * `defaultHash` option.
 * @param hrefs The HREF's used to calculate the final HREF for the routing universe implied by the library's default 
 * hash.
 */
export function calculateHref(...hrefs: (string | undefined)[]): string;
/**
 * Combines the given HREF's into a single HREF that also includes any query string parameters that are either carried
 * by the given HREF's, or preserved from the current environment's URL.
 *
 * Calculation is done assuming the resultant HREF will be for the routing universe specified by the options' `hash` 
 * property.  If the option is not specified, then a value will be resolved based on the library's `defaultHash` 
 * option.
 * @param options Desired options that control how the resultant HREF is calculated.
 * @param hrefs The HREF's used to calculate the final HREF for the desired routing universe.
 */
export function calculateHref(options: CalculateHrefOptions, ...hrefs: (string | undefined)[]): string;
export function calculateHref(...allArgs: (CalculateHrefOptions | string | undefined)[]): string {
    let options = (typeof allArgs[0] === 'object' ? allArgs.shift() : {}) as CalculateHrefOptions;
    let {
        hash = resolveHashValue(undefined),
        preserveQuery = false,
        preserveHash = false
    } = options;
    const allHrefs = allArgs as (string | undefined)[];
    
    // Validate that no HREF contains protocol, host, or port
    for (const href of allHrefs) {
        if (href && typeof href === 'string') {
            // Check for absolute URL patterns (protocol://host or //host)
            if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(href)) {
                throw new Error(`HREF cannot contain protocol, host, or port. Received: "${href}"`);
            }
        }
    }
    
    const dissected = dissectHrefs(...allHrefs);
    if (hash !== false && dissected.hashes.some(h => !!h.length)) {
        throw new Error("Specifying hashes in HREF's is only allowed for path routing.");
    }
    let searchParams: URLSearchParams | undefined;
    let joinedSearchParams = '';
    for (let i = 0; i < dissected.searchParams.length; ++i) {
        if (dissected.searchParams[i].length) {
            joinedSearchParams += `&${dissected.searchParams[i]}`;
        }
    }
    if (joinedSearchParams.length) {
        searchParams = new URLSearchParams(joinedSearchParams.substring(1));
    }
    searchParams = mergeQueryParams(searchParams, preserveQuery);
    const path = typeof hash === 'string' ?
        calculateMultiHashFragment({ [hash]: joinPaths(...dissected.paths) }) :
        joinPaths(...dissected.paths);
    let hashValue = hash === false ?
        dissected.hashes.find(h => h.length) || (preserveHash ? location.url.hash.substring(1) : '') :
        path;
    return `${hash ? '' : path}${searchParams ? `?${searchParams}` : ''}${hashValue.length ? `#${hashValue}` : ''}`;
}
