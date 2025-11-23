import { location } from "./Location.js";

/**
 * Calculates a new hash fragment with the specified named hash paths while preserving any existing hash paths not 
 * specified. Paths set to empty string ("") will be completely removed from the hash fragment.
 * @param hashPaths The hash paths to include (or remove via empty strings) in the final HREF.
 * @returns The calculated hash fragment (without the leading `#`).
 */
export function calculateMultiHashFragment(hashPaths: Record<string, string>) {
    const existingIds = new Set<string>();
    let finalUrl = '';
    for (let [id, path] of Object.entries(location.hashPaths)) {
        existingIds.add(id);
        path = hashPaths[id] ?? path;
        if (path) {
            finalUrl += `;${id}=${path}`;
        }
    }
    for (let [hashId, newPath] of Object.entries(hashPaths)) {
        if (existingIds.has(hashId) || !newPath) {
            continue;
        }
        finalUrl += `;${hashId}=${newPath}`;
    }
    return finalUrl.substring(1);
}
