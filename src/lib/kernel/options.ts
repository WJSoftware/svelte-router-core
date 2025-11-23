import type { ExtendedRoutingOptions } from "../types.js";

/**
 * Default routing options used for rollback.
 */
export const defaultRoutingOptions: Required<ExtendedRoutingOptions> = {
    hashMode: 'single',
    defaultHash: false,
    disallowPathRouting: false,
    disallowHashRouting: false,
    disallowMultiHashRouting: false,
};

/**
 * Global routing options.
 */
export const routingOptions: Required<ExtendedRoutingOptions> = structuredClone(defaultRoutingOptions);

/**
 * Sets routing options, merging with current values.
 * This function is useful for extension packages that need to configure routing options.
 * 
 * @param options Partial routing options to set
 */
export function setRoutingOptions(options?: Partial<ExtendedRoutingOptions>): void {
    routingOptions.hashMode = options?.hashMode ?? routingOptions.hashMode;
    routingOptions.defaultHash = options?.defaultHash ?? routingOptions.defaultHash;
    routingOptions.disallowPathRouting = options?.disallowPathRouting ?? routingOptions.disallowPathRouting;
    routingOptions.disallowHashRouting = options?.disallowHashRouting ?? routingOptions.disallowHashRouting;
    routingOptions.disallowMultiHashRouting = options?.disallowMultiHashRouting ?? routingOptions.disallowMultiHashRouting;
    if (routingOptions.hashMode === 'single' && typeof routingOptions.defaultHash === 'string') {
        throw new Error("Using a named hash path as the default path can only be done when 'hashMode' is set to 'multi'.");
    }
    else if (routingOptions.hashMode === 'multi' && routingOptions.defaultHash === true) {
        throw new Error("Using classic hash routing as default can only be done when 'hashMode' is set to 'single'.");
    }
}

/**
 * Resets routing options to their default values.
 */
export function resetRoutingOptions(): void {
    Object.assign(routingOptions, structuredClone(defaultRoutingOptions));
}
