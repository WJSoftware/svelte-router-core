import type { BuildHrefOptions } from "$lib/types.js";
import { location } from "./Location.js";
import { mergeQueryParams } from "./preserveQuery.js";

/**
 * Builds a new HREF by combining the path piece from one HREF and the hash piece from another.
 * 
 * Any query parameters present in either piece are merged and included in the resulting HREF.  Furthermore, if the 
 * `preserveQuery` option is provided, additional query parameters from the current URL are also merged in.
 * 
 * ### When to Use
 * 
 * This is a helper function that came to be when the redirection feature was added to the library.  The specific use 
 * case is cross-routing-universe redirections, where the "source" universe's path is not changed by normal redireciton 
 * because "normal" **cross-universe redirections** don't alter other universes' paths.
 * 
 * This function, in conjunction with the `calculateHref` function, allows relatively easy construction of the desired
 * final HREF by combining the results of 2 `calculateHref` calls:  One to get the path piece from the source universe, 
 * and another to get the hash piece for the other universe.
 * @param pathPiece HREF value containing the desired path piece.
 * @param hashPiece HREF value containing the desired hash piece.
 * @param options Optional set of options.
 * @returns The built HREF using the provided pieces.
 */
export function buildHref(pathPiece: string, hashPiece: string, options?: BuildHrefOptions): string {
    const pp = new URL(pathPiece, location.url);
    const hp = new URL(hashPiece, location.url);
    let sp = mergeQueryParams(mergeQueryParams(pp.searchParams, hp.searchParams), options?.preserveQuery);
    return `${pp.pathname}${sp?.size ? `?${sp.toString()}` : ''}${hp.hash}`;
}
